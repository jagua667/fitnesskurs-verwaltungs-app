/**
 * Einstiegspunkt der React-Anwendung.
 * 
 * Lädt die Roboto-Schriftart und rendert die App-Komponente
 * innerhalb eines React StrictMode und React Router Browsers.
 *
 * - React.StrictMode aktiviert zusätzliche Checks und Warnungen.
 * - BrowserRouter sorgt für client-seitiges Routing.
 */
console.log("main.jsx wurde geladen!");

import '@fontsource/roboto';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

