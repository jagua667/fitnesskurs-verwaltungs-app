const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * /api/trainers:
 *   get:
 *     summary: Gibt eine Liste aller Trainer mit Kursen zurück
 *     tags:
 *       - Allgemein
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort – Liste der Trainer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 3
 *                   name:
 *                     type: string
 *                     example: "Max Mustermann"
 *       500:
 *         description: Serverfehler beim Abrufen der Trainer
 */
router.get('/trainers', async (req, res) => {
  console.log("Anfrage an /api/trainers");
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

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Gibt eine Liste aller verwendeten Kursorte (Standorte / Studios) zurück
 *     tags:
 *       - Allgemein
 *     responses:
 *       200:
 *         description: Erfolgreiche Antwort – Liste der Orte
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "Berlin Mitte Studio A"
 *       500:
 *         description: Serverfehler beim Abrufen der Orte
 */
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

