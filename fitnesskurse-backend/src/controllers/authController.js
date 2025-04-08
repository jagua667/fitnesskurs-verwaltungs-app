const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

// DB-Verbindung
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
});

// Registrierung eines neuen Benutzers
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Prüfen, ob der Benutzer bereits existiert
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Benutzer existiert bereits" });
        }

        // Passwort hashen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Benutzer in die Datenbank einfügen
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "Benutzer registriert", user: newUser.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
};

// Benutzer-Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Benutzer suchen
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Ungültige Anmeldedaten" });
        }

        // Passwort überprüfen
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Ungültige Anmeldedaten" });
        }

        // JWT-Token erstellen
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
};

// Rolle ändern (nur Admin)
const updateRole = async (req, res) => {
    if (req.user.role !== "Admin") {
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
};

// Exportiere die Funktionen
module.exports = {
    registerUser,
    loginUser,
    updateRole,
};

