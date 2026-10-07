import { createRoot } from 'react-dom/client';
import './style.scss';

function SampleButton() {
  return <button type="button" className="sample-button">토큰 샘플 버튼</button>;
}

createRoot(document.getElementById('root')).render(
  <SampleButton />,
);
