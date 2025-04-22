import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);  // Zustand für Fehler
  const navigate = useNavigate();

  // Wenn der Benutzer bereits eingeloggt ist, weiterleiten
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem('authToken');
          return;
        }

        // Weiterleitung basierend auf der Rolle
        switch (decoded.role) {
          case 'Admin':
            navigate('/dashboard/admin');
            break;
          case 'Trainer':
            navigate('/dashboard/trainer');
            break;
          case 'Kunde':
            navigate('/dashboard/kunde');
            break;
          default:
            console.warn('Unbekannte Rolle:', decoded.role);
            break;
        }
      } catch (err) {
        console.error('Token konnte nicht dekodiert werden:', err);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Fehler zurücksetzen

    try {
      const response = await axios.post('/api/auth/login', { email, password });

      const token = response.data.token;
      
      // Token speichern
      localStorage.setItem('authToken', token);

      // Token decodieren
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Gültigkeit des Tokens prüfen
      if (decoded.exp < currentTime) {
        setError('Die Sitzung ist abgelaufen. Bitte erneut einloggen.');
        return;
      }

      // Weiterleitung basierend auf der Rolle
      switch (decoded.role) {
        case 'Admin':
          navigate('/dashboard/admin');
          break;
        case 'Trainer':
          navigate('/dashboard/trainer');
          break;
        case 'Kunde':
          navigate('/dashboard/kunde');
          break;
        default:
          setError('Unbekannte Benutzerrolle.');
          break;
      }
    } catch (error) {
      console.error('Fehler beim Login', error);
      setError('Login fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.');
    }
  };

  return (
    <div className="login-page" style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      {/* 🏠 Startseiten-Teil */}
      <h1>Willkommen zur Fitnesskurs-Verwaltung</h1>
      <p>
        Bitte logge dich ein, um deine Kurse zu verwalten, Buchungen vorzunehmen
        oder dein persönliches Dashboard zu sehen.
      </p>

      {/* 🔐 Login-Formular */}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;


