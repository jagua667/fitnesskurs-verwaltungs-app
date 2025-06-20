// src/context/AuthContext.jsx

/**
 * AuthContext – Kontext für Authentifizierung & Benutzerverwaltung
 *
 * Dieses Modul stellt über den React Context ein zentrales Authentifizierungssystem bereit.
 * Es kümmert sich um:
 * - Login mit Token-Handling
 * - Logout
 * - Automatisches Re-Authentifizieren bei Seiten-Reloads (via JWT)
 * - Bereitstellung des `user`-Objekts und Auth-Funktionen in der gesamten App
 *
 * Komponenten:
 * - `AuthProvider`: Context-Provider, der Auth-Status speichert und global verfügbar macht.
 * - `useAuth`: Custom Hook zur Nutzung des Authentifizierungs-Kontexts.
 *
 * State:
 * - `user`: Aktuell eingeloggter Benutzer (oder `null`)
 * - `loading`: Gibt an, ob der Auth-Status beim Seitenaufruf noch geprüft wird.
 *
 * Funktionen:
 * - `login(email, password)`:
 *    → POST an `/auth/login`
 *    → Speichert JWT im LocalStorage
 *    → Setzt `user`-State bei Erfolg
 *    → Gibt `true` oder `false` zurück
 *    → Warnung bei 403 (z. B. gesperrter Account)
 *
 * - `logout()`:
 *    → POST an `/auth/logout` zur Server-Invalidierung
 *    → Entfernt Token aus LocalStorage
 *    → Setzt `user` auf `null`
 *
 * - `useEffect` beim Mount:
 *    → Holt ggf. Token aus LocalStorage
 *    → Fragt mit GET `/auth/me` Benutzerinfos ab
 *    → Entfernt abgelaufene Tokens und setzt `loading` auf `false`
 *
 * Verwendung:
 * ```jsx
 * const { user, login, logout } = useAuth();
 * ```
 *
 * Beispiel:
 * ```jsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */

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
