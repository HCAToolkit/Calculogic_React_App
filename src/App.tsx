import { useEffect, useState } from 'react';
import BuildTab from './tabs/BuildTab';
import './App.css';

export default function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  function toggleDark() {
    setDark(prev => !prev);
  }

  return (
    <div data-anchor="app-frame">
      <button
        data-anchor="theme-toggle"
        onClick={toggleDark}
        aria-label="Toggle dark mode"
      >
        {dark ? '🌙 Dark' : '☀️ Light'}
      </button>
      <BuildTab />
    </div>
  );
}
