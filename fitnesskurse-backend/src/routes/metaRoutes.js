const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route: Alle Trainernamen abrufen
router.get('/trainers', async (req, res) => {
  console.log("📥 Anfrage an /api/trainers");
  try {
    const result = await pool.query(`
      SELECT DISTINCT u.id, u.name 
      FROM users u 
      JOIN courses c ON u.id = c.trainer_id 
      WHERE u.role = 'trainer'
    `);
    //const trainers = result.rows.map(row => row.name);
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Trainer:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Route: Alle Orte / Studios abrufen
router.get('/locations', async (req, res) => {
  console.log("📥 Anfrage an /api/locations");
  try {
    const result = await pool.query('SELECT DISTINCT location FROM courses WHERE location IS NOT NULL');
    const locations = result.rows.map(row => row.location);
    res.json(locations);
  } catch (error) {
    console.error('Fehler beim Abrufen der Orte:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

module.exports = router;

