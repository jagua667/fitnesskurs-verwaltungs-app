// routes/ratings.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require('../middleware/authMiddleware.js'); // JWT Middleware
const ratingsController = require('../controllers/ratingsController');

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Fügt eine Bewertung hinzu oder aktualisiert eine bestehende
 *     tags:
 *       - Bewertungen
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - rating
 *             properties:
 *               course_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: Sehr guter Kurs!
 *     responses:
 *       200:
 *         description: Bewertung hinzugefügt oder aktualisiert
 *       401:
 *         description: Nicht autorisiert
 *       500:
 *         description: Serverfehler
 */
router.post('/', authenticate.authenticateToken, async (req, res) => {
  const { course_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    const existing = await db.query(
      'SELECT * FROM ratings WHERE course_id = $1 AND user_id = $2',
      [course_id, user_id]
    );

    if (existing.rows.length > 0) {
      // Update
      await db.query(
        'UPDATE ratings SET rating = $1, comment = $2, created_at = NOW() WHERE course_id = $3 AND user_id = $4',
        [rating, comment, course_id, user_id]
      );
      return res.json({ message: 'Bewertung aktualisiert' });
    } else {
      // Insert
      await db.query(
        'INSERT INTO ratings (course_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [course_id, user_id, rating, comment]
      );
      return res.json({ message: 'Bewertung hinzugefügt' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

/**
 * @swagger
 * /api/ratings/trainer:
 *   get:
 *     summary: Gibt alle Bewertungen zu Kursen eines Trainers zurück
 *     tags:
 *       - Bewertungen
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bewertungen erfolgreich abgerufen
 *       401:
 *         description: Nicht autorisiert
 */
router.get('/trainer', authenticate.authenticateToken, ratingsController.getRatingsForTrainerCourses);


/**
 * @swagger
 * /api/ratings/course/{courseId}:
 *   get:
 *     summary: Gibt alle Bewertungen für einen bestimmten Kurs zurück
 *     tags:
 *       - Bewertungen
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID des Kurses
 *     responses:
 *       200:
 *         description: Bewertungen erfolgreich abgerufen
 *       500:
 *         description: Serverfehler
 */
router.get('/course/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await db.query(
      'SELECT r.*, u.name AS user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1',
      [courseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

/**
 * @swagger
 * /api/ratings/course/{courseId}/average:
 *   get:
 *     summary: Gibt den Durchschnitt der Bewertungen für einen Kurs zurück
 *     tags:
 *       - Bewertungen
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID des Kurses
 *     responses:
 *       200:
 *         description: Durchschnittsbewertung erfolgreich abgerufen
 *       500:
 *         description: Serverfehler
 */
router.get('/course/:courseId/average', async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await db.query(
      'SELECT AVG(rating)::numeric(3,2) AS average_rating FROM ratings WHERE course_id = $1',
      [courseId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

/**
 * @swagger
 * /api/ratings/ratings/{courseId}:
 *   get:
 *     summary: Gibt alle Bewertungen eines Kurses zurück (Controller-Route)
 *     tags:
 *       - Bewertungen
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID des Kurses
 *     responses:
 *       200:
 *         description: Bewertungen erfolgreich abgerufen
 *       401:
 *         description: Nicht autorisiert
 */
router.get('/ratings/:courseId', authenticate.authenticateToken, ratingsController.getRatingsByCourseId);

/**
 * @swagger
 * /api/ratings/export/{courseId}:
 *   get:
 *     summary: Exportiert Bewertungen eines Kurses als CSV
 *     tags:
 *       - Bewertungen
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID des Kurses
 *     responses:
 *       200:
 *         description: CSV-Export gestartet
 *       401:
 *         description: Nicht autorisiert
 */
router.get('/export/:courseId', authenticate.authenticateToken, (req, res) => {
  console.log('Export Route Aufgerufen!'); // Debugging-Log
  ratingsController.exportRatings(req, res);
});

module.exports = router;
