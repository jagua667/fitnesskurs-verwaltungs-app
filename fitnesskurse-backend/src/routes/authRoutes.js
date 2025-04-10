const express = require("express");
const { body, validationResult } = require("express-validator");
const authController = require('../controllers/authController'); // Importiere den Controller
const { authenticateToken } = require('../middleware/authMiddleware');
const { Pool } = require("pg");  // Füge die Pool-Instanz hinzu, falls sie gebraucht wird

const router = express.Router();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Registrierung eines neuen Benutzers
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name ist erforderlich"),
        body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
        body("password").isLength({ min: 6 }).withMessage("Passwort muss min. 6 Zeichen haben"),
    ],
    authController.registerUser // Verwende die Methode aus dem Controller
);

// Benutzer-Login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
        body("password").notEmpty().withMessage("Passwort ist erforderlich"),
    ],
    authController.loginUser // Verwende die Methode aus dem Controller
);

// Rolle ändern (nur Admin, daher auch authMiddleware davor)
router.put("/update-role", authenticateToken, async (req, res) => {
    // Überprüfe, ob der Benutzer Admin ist
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Zugriff verweigert" });
    }

    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
        return res.status(400).json({ message: "Fehlende Parameter" });
    }

    try {
        // Überprüfen, ob der Benutzer existiert
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Benutzer nicht gefunden" });
        }

        // Rolle des Benutzers ändern
        await pool.query("UPDATE users SET role = $1 WHERE id = $2", [newRole, userId]);

        res.json({ message: `Benutzerrolle erfolgreich auf ${newRole} geändert` });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Rolle:", error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
});

module.exports = router;

