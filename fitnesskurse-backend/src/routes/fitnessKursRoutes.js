const express = require("express");
const { pool } = require("../db");  // pool aus db.js importieren
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

const router = express.Router();

// **Fitnesskurs erstellen (Nur für Admins & Trainer)**
router.post("/", authenticateToken, checkRole("Admin", "Trainer"), async (req, res) => {
    const { title, description, start_time, end_time, location, max_capacity, trainer_id } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO courses (title, description, start_time, end_time, location, max_capacity, trainer_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [title, description, start_time, end_time, location, max_capacity, trainer_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Fehler beim Erstellen des Fitnesskurses:', error.message);
        res.status(500).json({ error: "Fehler beim Erstellen des Fitnesskurses." });
    }
});

// **Fitnesskurs löschen (Nur für Admins)**
router.delete("/:id", authenticateToken, checkRole("Admin"), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Fitnesskurs nicht gefunden." });
        }

        res.json({ message: "Fitnesskurs erfolgreich gelöscht." });
    } catch (error) {
        console.error('Fehler beim Löschen des Fitnesskurses:', error.message); // Fehler ausgeben
        res.status(500).json({ error: "Fehler beim Löschen des Fitnesskurses." });
    }
});

// **Fitnesskurs aktualisieren (Nur für Admins & Trainer)**
router.put("/:id", authenticateToken, checkRole("Admin", "Trainer"), async (req, res) => {
    const { id } = req.params;
    const { title, description, start_time, end_time, location, max_capacity, trainer_id } = req.body;

    console.log(pool);  // Überprüfe, ob das pool-Objekt korrekt importiert wurde

    try {
        const result = await pool.query(
            "UPDATE courses SET title=$1, description=$2, start_time=$3, end_time=$4, location=$5, max_capacity=$6, trainer_id=$7 WHERE id=$8 RETURNING *",
            [title, description, start_time, end_time, location, max_capacity, trainer_id, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Fitnesskurs nicht gefunden." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Fitnesskurses:', error.message); // Fehler ausgeben
        res.status(500).json({ error: "Fehler beim Aktualisieren des Fitnesskurses." });
    }
});

// **Alle Fitnesskurse abrufen**
router.get('/', async (req, res) => {
    try {
        console.log('Starte Abrufen der Kurse...'); // Debugging-Ausgabe
        
        const result = await pool.query('SELECT * FROM courses');
        
        if (result.rows.length === 0) {
            console.log('Keine Kurse gefunden.'); // Debugging-Ausgabe
            return res.status(404).json({ error: 'Keine Kurse gefunden.' });
        }

        console.log('Kurse erfolgreich abgerufen:', result.rows); // Debugging-Ausgabe
        res.json(result.rows);
    } catch (error) {
        console.error('Fehler beim Abrufen der Fitnesskurse:', error.message); // Fehler ausgeben
        res.status(500).json({ error: 'Fehler beim Abrufen der Fitnesskurse.' });
    }
});

module.exports = router;

