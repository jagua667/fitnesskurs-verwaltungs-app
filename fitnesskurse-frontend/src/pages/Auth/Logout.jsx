/**
 * Logout-Komponente
 * ------------------
 * Diese Komponente entfernt den Authentifizierungs-Token aus dem SessionStorage
 * und leitet den Benutzer anschließend zur Login-Seite weiter.
 * 
 * API-Verhalten:
 * - Kein direkter Backend-Call.
 * - Token wird lokal entfernt.
 * - Client-seitige Weiterleitung via window.location.href.
 */


/**
 * Komponente zum Ausloggen eines Benutzers.
 * Führt folgende Schritte aus:
 * 1. Entfernt das authToken aus dem SessionStorage.
 * 2. Leitet den Benutzer zur Login-Seite weiter.
 */
const Logout = () => {
  
  const handleLogout = () => {
    // Entferne den Authentifizierungs-Token
    sessionStorage.removeItem("authToken");
    
    // Leite Benutzer zur Login-Seite um
    window.location.href = "/login";
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;

