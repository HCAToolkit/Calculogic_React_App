import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Explicitly includes the .tsx extension

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
