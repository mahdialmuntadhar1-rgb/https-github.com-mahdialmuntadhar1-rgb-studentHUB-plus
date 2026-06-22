import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  document.body.innerHTML = '<div style="padding:24px;font-family:Arial">Talaba startup error.</div>';
} else {
  createRoot(root).render(<App />);
}
