const pool = require('../db');
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization || req.header("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Kein Token oder ungültiges Format, Zugriff verweigert" });
    }
    const tokenWithoutBearer = token.slice(7); // Entfernt "Bearer " (7 Zeichen)

    try {
        console.log("Authorization Header:", req.headers.authorization);
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        // Extra DB-Check für `locked`
        const userRes = await pool.query("SELECT id, locked FROM users WHERE id = $1", [decoded.id]);
        const user = userRes.rows[0];

        if (!user || user.locked) {
          return res.status(403).json({ message: "Benutzer ist gesperrt (oder existiert nicht)" });
        }

        req.user = decoded;

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

// ⬇️ NEU: Rollenbasiertes Middleware-Feature
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

