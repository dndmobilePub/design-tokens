import tokens from './src/tokens/_variables.js';

// Match the CSS custom properties emitted from the generated SCSS variables.
function tokenReferences(tree, path = []) {
  return Object.fromEntries(Object.entries(tree).map(([key, value]) => {
    const nextPath = [...path, key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return [key, tokenReferences(value, nextPath)];
    }
    const name = nextPath.join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return [key, `var(--token-${name})`];
  }));
}

const theme = tokenReferences(tokens.light);

export default {
  theme: {
    extend: {
      colors: {
        ...theme.colors,
        primary: theme.colors.bubbleggum,
        foreground: theme.fg.default,
      },
      spacing: {
        1: theme.spacing.xs,
        2: theme.spacing.sm,
        4: theme.spacing.md,
        8: theme.spacing.lg,
        16: theme.spacing.xl,
      },
      borderRadius: {
        sm: theme.borderRadius.sm,
        lg: theme.borderRadius.lg,
        xl: theme.borderRadius.xl,
      },
      fontFamily: { sans: [theme.fontFamilies.body, 'sans-serif'] },
      fontSize: {
        xs: theme.fontSizes.xs,
        sm: theme.fontSizes.sm,
        base: [theme.fontSizes.body, { lineHeight: String(theme.lineHeights.body) }],
      },
      fontWeight: {
        normal: String(theme.fontWeights.bodyRegular),
        bold: String(theme.fontWeights.bodyBold),
      },
      opacity: {
        10: String(theme.opacity.low),
        50: String(theme.opacity.md),
        90: String(theme.opacity.high),
      },
      outlineOffset: { 4: theme.spacing.xs },
    },
  },
};
