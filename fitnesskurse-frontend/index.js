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

