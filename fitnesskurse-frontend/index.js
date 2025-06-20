/**
 * Einstiegspunkt der React-App.
 * 
 * - React.StrictMode aktiviert zusätzliche Checks und Warnungen während der Entwicklung.
 * - AuthProvider stellt den Authentifizierungs-Kontext für die gesamte App bereit.
 * - BrowserRouter ermöglicht clientseitiges Routing.
 * - Die App-Komponente ist die Root-Komponente der Anwendung.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // <- wichtig!!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* <-- Verpacke hier alles */}
      <BrowserRouter> {/* <-- Router auch notwendig */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

