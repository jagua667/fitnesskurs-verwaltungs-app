const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Importiere die Middleware
const pool = require("../config/db"); // Verbindung zur PostgreSQL-Datenbank

// Route zum Ändern der Benutzerrolle (nur für Admins)
router.put("/update-role", authMiddleware, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Zugriff verweigert" });
    }

    const { userId, newRole } = req.body;

    try {
        await pool.query("UPDATE users SET role = $1 WHERE id = $2", [newRole, userId]);
        res.json({ message: "Benutzerrolle aktualisiert" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
});

module.exports = router;

