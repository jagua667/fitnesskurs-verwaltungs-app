// middleware/auth.js

/**
 * Authentifizierungs- & Autorisierungs-Middleware
 * 
 * Diese Middleware schützt Routen vor unberechtigtem Zugriff.
 * Sie prüft das übermittelte JWT-Token, stellt sicher, dass der Benutzer nicht gesperrt ist,
 * und erlaubt optional rollenbasierte Zugriffskontrolle.
 */

const pool = require('../db');
const jwt = require("jsonwebtoken");

/**
 * Middleware zur Authentifizierung über ein JWT-Token.
 * 
 * - Erwartet ein "Authorization"-Header im Format: Bearer <TOKEN>
 * - Verifiziert das Token mit dem geheimen Schlüssel (JWT_SECRET)
 * - Prüft, ob der Benutzer existiert und nicht gesperrt ist (user.locked)
 * - Falls eine Session-ID im Token vorhanden ist, wird die letzte Aktivität aktualisiert
 * - Setzt `req.user` mit den im Token enthaltenen Benutzerdaten
 */
const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization || req.header("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Kein Token oder ungültiges Format, Zugriff verweigert" });
    }
    const tokenWithoutBearer = token.slice(7); // Entfernt "Bearer " (7 Zeichen)

    try {
        console.log("Authorization Header:", req.headers.authorization);
    
        // Token verifizieren
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        // Benutzer aus der Datenbank holen, um Sperrstatus zu prüfen 
        const userRes = await pool.query("SELECT id, locked FROM users WHERE id = $1", [decoded.id]);
        const user = userRes.rows[0];

        if (!user || user.locked) {
          return res.status(403).json({ message: "Benutzer ist gesperrt (oder existiert nicht)" });
        }

        // Benutzerdaten für nachfolgende Middleware verfügbar machen
        req.user = decoded;

        // Optional: Session-Aktivität aktualisieren
        if (decoded.sessionId) {
          console.log("Session-ID: ", decoded.sessionId);
          try {
            await pool.query('UPDATE sessions SET last_active = NOW() WHERE id = $1', [decoded.sessionId]);
          } catch (updateErr) {
            console.error("Fehler beim Aktualisieren der Session:", updateErr);
          }
        }
        console.log("Benutzer im req.user:", req.user);
        next();
    } catch (error) {
        console.error("Fehler beim Verifizieren des Tokens:", error);
        res.status(401).json({ message: "Ungültiger Token" });
    }
};

/**
 * Rollenbasierte Zugriffskontrolle
 * 
 * @param {Array<string>} roles - Liste erlaubter Rollen (z. B. ["admin", "trainer"])
 * 
 * Nutze diese Middleware nach `authenticateToken`, um den Zugriff auf bestimmte Rollen zu beschränken.
 * Beispiel:
 *    router.get('/admin', authenticateToken, authorizeRole(['admin']), handler);
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        console.log("Benutzerrolle:", req.user.role); // Debugging: Logge die Benutzerrolle
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Zugriff verweigert für Rolle: ${req.user.role}` });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};

