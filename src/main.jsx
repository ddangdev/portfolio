import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { init, view } from './features/analytics/analytics.js';
import './styles/base.css';
import './features/wheel/wheel.css';
import './features/preview/preview.css';
import './features/page/page.css';
import './features/ticker/ticker.css';
import './features/nav/nav.css';
import './features/counter/counter.css';
import './features/services/services.css';
import './features/contact/contact.css';
import './features/work/work.css';
import './features/faq/faq.css';
import './features/notes/notes.css';

// analytics (see features/analytics/analytics.js): the arrival is a view of the wheel, 'home'
init();
view('home');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
