import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);  // Zustand für Fehler
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const response = await axios.post('/api/auth/login', { email, password });

    const token = response.data.token;

    // Token speichern
    localStorage.setItem('authToken', token);

    // Token decodieren
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Gültigkeit prüfen
    if (decoded.exp < currentTime) {
      setError("Die Sitzung ist abgelaufen. Bitte erneut einloggen.");
      return;
    }

    // Weiterleitung basierend auf Rolle
    if (decoded.role === 'Admin') {
      navigate('/dashboard/admin');
    } else if (decoded.role === 'Trainer') {
      navigate('/dashboard/trainer');
    } else if (decoded.role === 'Kunde') {
      navigate('/dashboard/kunde');
    } else {
      setError("Unbekannte Benutzerrolle.");
    }

  } catch (error) {
    console.error('Fehler beim Login', error);
    setError('Login fehlgeschlagen. Überprüfen Sie Ihre Anmeldedaten.');
  }
};


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="error">{error}</div>} {/* Fehleranzeige */}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

