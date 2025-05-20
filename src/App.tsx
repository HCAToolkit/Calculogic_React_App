import { useState } from 'react';
import BuildTab from './tabs/BuildTab';

export default function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  function toggleDark() {
    setDark(d => !d);
    document.body.classList.toggle('dark', !dark);
  }

  return (
    <div style={{ height: '100vh', fontFamily: 'sans-serif' }} className={dark ? 'dark' : ''}>
      <button
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 1000,
          background: dark ? '#222' : '#eee', color: dark ? '#fff' : '#222', border: '1px solid #888', borderRadius: 4, padding: '4px 10px'
        }}
        onClick={toggleDark}
        aria-label="Toggle dark mode"
      >
        {dark ? '🌙 Dark' : '☀️ Light'}
      </button>
      <BuildTab />
    </div>
  );
}
