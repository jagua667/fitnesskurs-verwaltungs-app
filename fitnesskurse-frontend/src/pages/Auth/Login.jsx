import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('authToken');
          return;
        }

        // Weiterleitung basierend auf der Rolle
        if (decoded.role.toLowerCase() === "kunde") {
          navigate("/kurse"); // Kunde soll direkt zu Kurse
        } else {
          const roleBasedRedirect = {
            admin: '/dashboard/admin',
            trainer: '/dashboard/trainer',
          };
          navigate(roleBasedRedirect[decoded.role.toLowerCase()] || '/');
        }
      } catch (err) {
        console.error('Token konnte nicht dekodiert werden:', err);
        localStorage.removeItem('authToken'); // Sicherheit: Ungültigen Token entfernen
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });

      const token = response.data.token;
      localStorage.setItem('authToken', token);
      
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        setError('Die Sitzung ist abgelaufen. Bitte erneut einloggen.');
        localStorage.removeItem('authToken');
        return;
      }

      // ✅ Erfolgreicher Login -> Redirect nach Rolle
      if (decoded.role.toLowerCase() === "kunde") {
        navigate("/kurse");
      } else {
        const roleBasedRedirect = {
          admin: '/dashboard/admin',
          trainer: '/dashboard/trainer',
        };
        navigate(roleBasedRedirect[decoded.role.toLowerCase()] || '/');
      }
    } catch (error) {
      console.error('Fehler beim Login', error);
      setError('Login fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h1>Willkommen zur Fitnesskurs-Verwaltung</h1>
      <p>
        Bitte logge dich ein, um deine Kurse zu verwalten, Buchungen vorzunehmen
        oder dein persönliches Dashboard zu sehen.
      </p>

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
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Bitte warten...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;

