const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
const token = req.headers.authorization || req.header("Authorization");
if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Kein Token oder ungültiges Format, Zugriff verweigert" });
}
const tokenWithoutBearer = token.slice(7); // Entfernt "Bearer " (7 Zeichen)


    try {
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.user = decoded;
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

