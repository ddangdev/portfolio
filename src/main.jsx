import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

/* `app` tells the head snippet the bundle ran, so it keeps `js` (and never shows the no-JS fallback) */
document.documentElement.classList.add('app');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
