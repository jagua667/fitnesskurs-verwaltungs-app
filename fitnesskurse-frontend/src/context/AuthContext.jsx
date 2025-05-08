// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user = {role: 'kunde', name: 'Anna'}
  const [loading, setLoading] = useState(true); // Lade-Status

  // Simuliere das Laden eines Benutzers oder einen Login
  useEffect(() => {
    setTimeout(() => {
      // Mock-User für Testzwecke, kannst du später mit einem echten Backend ersetzen
      const mockUser = { role: 'trainer', name: 'Ottmar', id: 1 };
      setUser(mockUser); // Benutzer setzen
      setLoading(false); // Lade-Status auf fertig setzen
    }, 1000); // Mock Verzögerung von 1 Sekunde
  }, []);

  // Falls noch geladen wird, kannst du hier ein Lade-Indikator ausgeben
  if (loading) {
    return <div>Loading...</div>; // Optional: Lade-Anzeige
  }

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

