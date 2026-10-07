import { useEffect, useId, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import tokens from './tokens/_variables.js';
import { sampleCode } from './sample-code.js';
import './style.scss';
import './tailwind.css';

const ButtonSamples = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const TokenButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.superbig};
  border: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.bubbleggum};
  color: ${({ theme }) => theme.fg.default};
  font-family: ${({ theme }) => theme.fontFamilies.body}, sans-serif;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.bodyBold};
  line-height: ${({ theme }) => theme.lineHeights.body};
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.fg.default};
    outline-offset: ${({ theme }) => theme.spacing.xs};
  }
  &:active { opacity: ${({ theme }) => theme.opacity.high}; }
`;

function SCSSButton({ className }) {
  return <button type="button" className={classNames('sample-button', className)}>SCSS 토큰 버튼</button>;
}

function EmotionButton({ className }) {
  return <TokenButton type="button" className={classNames('js-token-button', className)}>Emotion 토큰 버튼</TokenButton>;
}

function TailwindButton({ className }) {
  return (
    <button type="button" className={classNames(
      'tailwind-token-button',
      'py-4 px-8 border-0 rounded-lg',
      'bg-primary text-foreground font-sans text-base font-bold',
      'cursor-pointer focus-visible:outline-2 focus-visible:outline-solid',
      'focus-visible:outline-foreground focus-visible:outline-offset-4 active:opacity-90',
      className,
    )}>Tailwind 토큰 버튼</button>
  );
}

function flattenTokens(tree, path = [], result = {}) {
  for (const [key, value] of Object.entries(tree)) {
    const nextPath = [...path, key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenTokens(value, nextPath, result);
    } else {
      result[nextPath.join('.')] = value;
    }
  }
  return result;
}

const tokenValues = { light: flattenTokens(tokens.light), dark: flattenTokens(tokens.dark) };
const tokenNames = [...new Set([...Object.keys(tokenValues.light), ...Object.keys(tokenValues.dark)])].sort();
const formatValue = value => value === undefined ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);

const ColorSwatch = styled.div`
  background-color: ${({ swatchColor }) => swatchColor};
`;

function TokenValue({ value }) {
  const isColor = typeof value === 'string' && /^(#[\da-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\()/i.test(value);
  return <div className="token-value">
    {isColor && <ColorSwatch className="color-swatch" swatchColor={value} aria-hidden="true" />}
    <code>{formatValue(value)}</code>
  </div>;
}

function CodeSample({ title, code, children }) {
  const id = useId();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = Array.isArray(code) ? code : [{ label: '구현 코드', code }];
  const selected = tabs[activeTab];
  const [copyStatus, setCopyStatus] = useState('');
  const [copying, setCopying] = useState(false);
  async function copyCode() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(selected.code);
      setCopyStatus('복사했습니다.');
    } catch {
      setCopyStatus('복사하지 못했습니다. 아래 코드를 선택해 직접 복사해주세요.');
    } finally {
      setCopying(false);
    }
  }
  function selectTab(index) {
    setActiveTab(index);
    setCopyStatus('');
  }
  function handleTabKey(event, index) {
    const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(next);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
  }
  return <article className="code-sample">
    <div className="sample-preview">{children}</div>
    <div className="code-toolbar">
      {tabs.length > 1 ? <div className="code-tabs" role="tablist" aria-label={`${title} 코드 종류`}>
        {tabs.map((tab, index) => <button key={tab.label} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} disabled={copying} onClick={() => selectTab(index)} onKeyDown={event => handleTabKey(event, index)}>{tab.label}</button>)}
      </div> : <span>구현 코드</span>}
      <button type="button" className="copy-button" onClick={copyCode} disabled={copying} aria-label={`${title} ${selected.label} 코드 복사`} aria-busy={copying} title={copying ? '복사 중' : '코드 복사'}>
        <span className="mode-icon copy-icon" aria-hidden="true" />
      </button>
    </div>
    <pre id={`${id}-panel`} role={tabs.length > 1 ? 'tabpanel' : undefined} aria-labelledby={tabs.length > 1 ? `${id}-tab-${activeTab}` : undefined} tabIndex={0} aria-label={tabs.length > 1 ? undefined : `${title} 구현 코드`}><code>{selected.code}</code></pre>
    <p className="copy-status" role="status">{copyStatus}</p>
  </article>;
}

function App() {
  const [mode, setMode] = useState('light');
  const [query, setQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const updateScrollTop = () => setShowScrollTop(window.scrollY >= 300);
    updateScrollTop();
    window.addEventListener('scroll', updateScrollTop, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollTop);
  }, []);
  const filteredNames = tokenNames.filter(name => name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ThemeProvider theme={tokens[mode]}>
      <main className={classNames('token-page', { dark: mode === 'dark' })}>
        <header className="page-header">
          <h1>디자인 토큰 샘플</h1>
          <button type="button" className="mode-toggle" aria-label="다크 모드" title={mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'} aria-pressed={mode === 'dark'} onClick={() => setMode(current => current === 'light' ? 'dark' : 'light')}>
            <span className={classNames('mode-icon', mode === 'dark' ? 'sun-icon' : 'moon-icon')} aria-hidden="true" />
          </button>
        </header>
        <section aria-labelledby="samples-title">
          <h2 id="samples-title">컴포넌트 적용 예제</h2>
          <ButtonSamples>
            <CodeSample title="SCSS" code={sampleCode.scss}><SCSSButton /></CodeSample>
            <CodeSample title="Emotion" code={sampleCode.emotion}><EmotionButton /></CodeSample>
            <CodeSample title="Tailwind CSS" code={sampleCode.tailwind}><TailwindButton /></CodeSample>
          </ButtonSamples>
        </section>
        <section aria-labelledby="tokens-title">
          <h2 id="tokens-title">토큰 명세</h2>
          <p>생성된 변수 기준 · 현재 모드: {mode === 'light' ? '라이트' : '다크'} · {filteredNames.length}개</p>
          <label className="token-search">
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="토큰 이름 검색 (예: colors, spacing)" />
          </label>
          <div className="table-scroll" tabIndex={0} role="region" aria-label="토큰 명세 표">
            <table>
              <caption>라이트·다크 토큰 값 비교</caption>
              <thead><tr><th scope="col">토큰 이름</th>{['light', 'dark'].map(column => <th key={column} scope="col" className={classNames({ 'active-mode': mode === column })}>{column === 'light' ? '라이트' : '다크'}{mode === column && ' · 활성'}</th>)}</tr></thead>
              <tbody>{filteredNames.map(name => (
                <tr key={name}>
                  <th scope="row"><code>{name}</code></th>
                  {['light', 'dark'].map(column => <td key={column} className={classNames({ 'active-mode': mode === column })}><TokenValue value={tokenValues[column][name]} /></td>)}
                </tr>
              ))}</tbody>
            </table>
            {!filteredNames.length && <p role="status">일치하는 토큰이 없습니다.</p>}
          </div>
        </section>
        {showScrollTop && (
          <button type="button" className="mode-toggle scroll-top" aria-label="페이지 맨 위로" title="맨 위로" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>
            <span className="mode-icon arrow-up-icon" aria-hidden="true" />
          </button>
        )}
      </main>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
