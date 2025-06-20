/**
 * Rollenbasierte Zugriffskontrolle (Middleware)
 * 
 * Diese Middleware prüft, ob der authentifizierte Benutzer über eine der 
 * angegebenen Rollen verfügt. Sie setzt voraus, dass `req.user.role` vorher 
 * durch eine Authentifizierungsmiddleware (z. B. `authenticateToken`) gesetzt wurde.
 * 
 * Verwendung:
 * 
 * ```js
 * const checkRole = require('./middleware/checkRole');
 * app.get('/admin/dashboard', authenticateToken, checkRole('admin'), handler);
 * ```
 * 
 * @param  {...string} allowedRoles - Liste erlaubter Rollen, z. B. 'admin', 'trainer', 'user'
 * @returns Express-Middleware-Funktion
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Prüfe, ob Benutzer und Rolle gesetzt sind
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: "Zugriff verweigert: Keine Benutzerrolle gefunden." });
        }

        // Prüfe, ob Benutzerrolle erlaubt ist
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Zugriff verweigert: Unzureichende Berechtigungen." });
        }

        // Benutzer hat passende Rolle → Weiter zur nächsten Middleware/Route
        next(); // Benutzer hat die richtige Rolle → Weiter zur Route
    };
};

module.exports = checkRole;

