const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Kein Token, Zugriff verweigert" });
    }

    const tokenWithoutBearer = token.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        
        // Stelle sicher, dass der Benutzer korrekt im req.user gespeichert wird
        req.user = decoded;

        console.log("Benutzer im req.user:", req.user); // Debugging-Ausgabe
        
        next();
    } catch (error) {
        console.error("Fehler beim Verifizieren des Tokens:", error);
        res.status(401).json({ message: "Ungültiger Token" });
    }
};

module.exports = authMiddleware;

