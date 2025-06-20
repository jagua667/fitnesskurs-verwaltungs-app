/**
 * userController.js
 *
 * Enthält Funktionen für die Benutzerverwaltung:
 * - Registrierung eines neuen Benutzers mit Passwort-Hashing
 * - Benutzer-Login mit Passwortprüfung und JWT-Token-Ausgabe
 * - Rollenänderung (nur durch Admins erlaubt)
 * - Logout durch Session-Löschung in der Datenbank
 *
 * Verwendete Technologien:
 * - PostgreSQL (via pg-Pool)
 * - bcryptjs (Passwort-Hashing)
 * - jsonwebtoken (JWT für Authentifizierung)
 * - uuid (für Session-IDs)
 *
 * Erwartete Umgebungsvariablen:
 * - DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT (für DB-Verbindung)
 * - JWT_SECRET (für JWT-Signatur)
 */

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

// Datenbankverbindung initialisieren
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
});

/**
 * Registrierung eines neuen Benutzers
 * - Prüft, ob E-Mail schon existiert
 * - Hasht das Passwort mit bcrypt
 * - Fügt den Nutzer in die DB ein
 */
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const normalizedRole = role?.toLowerCase() || "kunde";

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
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, normalizedRole]
        );

        res.status(201).json({ message: "Benutzer registriert", user: newUser.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
};

/**
 * Benutzer-Login
 * - Überprüft E-Mail und Passwort
 * - Prüft, ob Nutzer gesperrt ist
 * - Erstellt JWT mit Session-ID (UUID)
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("🔐 Loginversuch:");
    console.log("Email:", email);
    console.log("Passwort (eingegeben):", password);

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        console.log("User aus DB:", user.rows[0]);

        if (user.rows.length === 0) {
            console.log("❌ Kein Benutzer gefunden.");
            return res.status(401).json({ message: "Ungültige Anmeldedaten" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        console.log("Passwortvergleich:", isMatch);

        if (!isMatch) {
            console.log("❌ Passwort stimmt nicht.");
            return res.status(401).json({ message: "Ungültige Anmeldedaten" });
        }

        if (user.rows[0].locked) {
          console.log("❌ Benutzer ist gesperrt.");
          return res.status(403).json({ message: "Benutzer ist gesperrt" });
        }

        const userId = user.rows[0].id;

      // Prüfen, ob schon eine Session existiert, ansonsten neue erstellen
        let sessionId;
        const existingSession = await pool.query(
          'SELECT id FROM sessions WHERE user_id = $1 LIMIT 1',
          [userId]
        );

        if (existingSession.rows.length > 0) {
          sessionId = existingSession.rows[0].id;
        } else {
          // ⬇️ In sessions einfügen
          sessionId = uuidv4();
          await pool.query(
            'INSERT INTO sessions (id, user_id) VALUES ($1, $2)',
            [sessionId, userId]
          );
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role?.toLowerCase(), sessionId: sessionId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ Login erfolgreich. Token wird zurückgegeben.");
        console.log("🚨 Sollte NICHT erreicht werden für gesperrte Benutzer");
        res.json({
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
                role: user.rows[0].role?.toLowerCase(),
            }
        });

    } catch (error) {
        console.error("🔥 Serverfehler beim Login:", error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
};
  
/**
 * Rolle eines Benutzers ändern (nur Admin)
 */
const updateRole = async (req, res) => {
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
};


/**
 * Logout eines Benutzers
 * - Löscht die Session aus der Datenbank
 */
const logoutUser = async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    res.status(200).json({ message: "Logout erfolgreich" });
  } catch (err) {
    console.error("Logout-Fehler:", err);
    res.status(500).json({ message: "Serverfehler beim Logout" });
  }
};


// Exportiere die Funktionen
module.exports = {
    registerUser,
    loginUser,
    updateRole,
    logoutUser,
};

