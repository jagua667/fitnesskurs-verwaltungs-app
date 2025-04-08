const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: "Zugriff verweigert: Keine Benutzerrolle gefunden." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Zugriff verweigert: Unzureichende Berechtigungen." });
        }

        next(); // Benutzer hat die richtige Rolle → Weiter zur Route
    };
};

module.exports = checkRole;

