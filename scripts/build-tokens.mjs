import { readFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap, getTransforms } from '@tokens-studio/sd-transforms';
import { compileString } from 'sass';

// Preserve each theme's references when combining both themes into one dictionary.
function namespaceReferences(value, theme) {
  if (typeof value === 'string') {
    return value.replace(/\{([^{}]+)\}/g, (_, reference) => `{${theme}.${reference}}`);
  }
  if (Array.isArray(value)) return value.map(child => namespaceReferences(child, theme));
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) =>
    [key, namespaceReferences(child, theme)]));
}

function mergeSets(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && !Array.isArray(value) &&
      !Object.hasOwn(value, '$value') && !Object.hasOwn(value, 'value')) {
      target[key] = mergeSets(target[key] ?? {}, value);
    } else {
      target[key] = structuredClone(value);
    }
  }
  return target;
}

function namespaceTokens(tree, theme) {
  if (Object.hasOwn(tree, '$value') || Object.hasOwn(tree, 'value')) {
    const key = Object.hasOwn(tree, '$value') ? '$value' : 'value';
    tree[key] = namespaceReferences(tree[key], theme);
    return;
  }
  for (const [key, child] of Object.entries(tree)) {
    if (!key.startsWith('$') && child && typeof child === 'object') namespaceTokens(child, theme);
  }
}

function validateValue(value, path) {
  if (value === null || value === undefined ||
    (typeof value === 'number' && !Number.isFinite(value)) ||
    (typeof value === 'string' && /\{[^{}]+\}/.test(value))) {
    throw new Error(`Invalid or unresolved token: ${path}`);
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) validateValue(child, `${path}.${key}`);
  }
}

const source = JSON.parse(await readFile('tokens.json', 'utf8'));
const tokens = {};

for (const theme of ['light', 'dark']) {
  const sets = ['core', theme, 'theme'];
  for (const set of sets) {
    if (!source[set]) throw new Error(`Missing token set: ${set}`);
  }
  tokens[theme] = sets.reduce((merged, set) => mergeSets(merged, source[set]), {});
  namespaceTokens(tokens[theme], theme);
}

await register(StyleDictionary, { excludeParentKeys: false });
const transforms = [...getTransforms({ platform: 'css' }), 'name/kebab'];
await mkdir('src/tokens', { recursive: true });
const dictionary = new StyleDictionary({
  tokens,
  usesDtcg: true,
  preprocessors: ['tokens-studio'],
  expand: { typesMap: expandTypesMap },
  log: { warnings: 'error', errors: { brokenReferences: 'throw' } },
  platforms: {
    scss: {
      transforms,
      buildPath: 'src/tokens/',
      files: [{ destination: '_variables.scss', format: 'scss/variables', options: { showFileHeader: false } }],
    },
    javascript: {
      transforms,
      buildPath: 'src/tokens/',
      files: [{ destination: '_variables.js', format: 'javascript/esm', options: { showFileHeader: false, minify: true } }],
    },
  },
});
await dictionary.buildAllPlatforms();
const resolved = await dictionary.getPlatformTokens('javascript');
if (!resolved.allTokens.length) throw new Error('No generated tokens');
for (const token of resolved.allTokens) {
  validateValue(token.$value, token.path.join('.'));
}

// Fail the workflow if either generated file cannot be consumed.
compileString(await readFile('src/tokens/_variables.scss', 'utf8'));
const generated = await import(pathToFileURL(resolve('src/tokens/_variables.js')).href);
validateValue(generated.default, 'generated');
for (const theme of ['light', 'dark']) {
  if (!generated.default?.[theme] || !Object.keys(generated.default[theme]).length) {
    throw new Error(`Missing generated theme: ${theme}`);
  }
}
