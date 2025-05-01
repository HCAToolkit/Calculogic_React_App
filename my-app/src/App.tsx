import React from 'react';
import BuildTab from './tabs/BuildTab';

export default function App() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>🔧 Calculogic Builder</h1>
      <BuildTab />
    </div>
  );
}
