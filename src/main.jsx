import { createRoot } from 'react-dom/client';
import styled from '@emotion/styled';
import classNames from 'classnames';
import tokens from './tokens/_variables.js';
import './style.scss';

const { spacing, borderRadius, colors, fg, fontFamilies, fontSizes, fontWeights, lineHeights, opacity } = tokens.light;

const ButtonSamples = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
`;

const TokenButton = styled.button`
  padding: ${spacing.md} ${spacing.superbig};
  border: 0;
  border-radius: ${borderRadius.lg};
  background-color: ${colors.bubbleggum};
  color: ${fg.default};
  font-family: ${fontFamilies.body}, sans-serif;
  font-size: ${fontSizes.body};
  font-weight: ${fontWeights.bodyBold};
  line-height: ${lineHeights.body};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${fg.default};
    outline-offset: ${spacing.xs};
  }

  &:active {
    opacity: ${opacity.high};
  }
`;

function SampleButton({ className }) {
  return (
    <button type="button" className={classNames('sample-button', className)}>
      SCSS 토큰 버튼
    </button>
  );
}

function JavaScriptSampleButton({ className }) {
  return (
    <TokenButton type="button" className={classNames('js-token-button', className)}>
      Emotion 토큰 버튼
    </TokenButton>
  );
}

createRoot(document.getElementById('root')).render(
  <ButtonSamples>
    <SampleButton />
    <JavaScriptSampleButton />
  </ButtonSamples>,
);
