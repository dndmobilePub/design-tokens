import source from './main.jsx?raw';
import styles from './style.scss?raw';
import tailwindConfig from '../tailwind.config.js?raw';
import tailwindStyles from './tailwind.css?raw';
import tokenSource from './tokens/_variables.js?raw';
import tokenStyles from './tokens/_variables.scss?raw';

// Display the actual implementation so the comparison stays in sync with edits.
export const sampleCode = {
  scss: [
    { label: 'SCSSButton.jsx', code: source.slice(source.indexOf('function SCSSButton('), source.indexOf('function EmotionButton(')).trim() },
    {
      label: 'src/style.scss', code: styles.slice(0, styles.indexOf('body {')).trim()
        + '\n\n' + styles.slice(styles.indexOf('.sample-button,'), styles.indexOf('.token-search')).trim()
    },
    { label: 'src/tokens/_variables.scss', code: tokenStyles.trim() },
  ],
  emotion: [
    {
      label: 'EmotionButton.jsx', code: "import styled from '@emotion/styled';\n// ThemeProvider supplies tokens[mode].\n\n"
        + source.slice(source.indexOf('const TokenButton ='), source.indexOf('function EmotionButton(')).trim()
        + '\n\n' + source.slice(source.indexOf('function EmotionButton('), source.indexOf('function TailwindButton(')).trim()
    },
    { label: 'src/tokens/_variables.js', code: tokenSource.trim() },
  ],
  tailwind: [
    { label: 'TailwindButton.jsx', code: source.slice(source.indexOf('function TailwindButton('), source.indexOf('function flattenTokens(')).trim() },
    { label: 'tailwind.config.js', code: '// colors.primary → bg-primary → var(--token-colors-bubbleggum)\n' + tailwindConfig.trim() },
    { label: 'src/tailwind.css', code: tailwindStyles.trim() },
  ],
};
