// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
      try {
        const res = await axios.post('/auth/login', { email, password });

        if (!res.data?.token) {
          console.warn("Kein Token erhalten");
          return false;
        }

        localStorage.setItem('token', res.data.token);  // Speichere JWT
        setUser(res.data.user);                         // Setze Benutzerzustand
        return true;

      } catch (err) {
        console.error('Login fehlgeschlagen:', err);
        if (err.response?.status === 403) {
          alert("Ihr Konto ist gesperrt.");
        }
        return false;
      }
    };

    const logout = async () => {
      try {
        await axios.post('/auth/logout'); // Session invalidieren
      } catch (err) {
        console.error("Fehler beim Logout:", err);
      } finally {
        localStorage.removeItem('token');
        setUser(null);
      }
    };

  // Bei Seiten-Neuladen: Token prüfen & user holen
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/auth/me');
        setUser(res.data); // Benutzer aus dem Token holen
      } catch (err) {
        console.error('Token ungültig oder abgelaufen');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
