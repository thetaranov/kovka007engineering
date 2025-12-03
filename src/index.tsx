import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Убедитесь, что App.tsx находится в той же папке src

// Мы уже импортировали стили внутри App.tsx, так что здесь это не нужно.

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);