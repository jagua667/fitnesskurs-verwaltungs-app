// routes/ratings.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require('../middleware/authMiddleware.js'); // JWT Middleware
const ratingsController = require('../controllers/ratingsController');

// Bewertung erstellen oder aktualisieren
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

// Endpunkt zum Abrufen der Bewertungen eines Kurses
router.get('/ratings/:courseId', authenticate.authenticateToken, ratingsController.getRatingsByCourseId);

// Endpunkt zum Exportieren der Bewertungen eines Kurses als CSV
router.get('/export/:courseId', authenticate.authenticateToken, (req, res) => {
  console.log('Export Route Aufgerufen!'); // Debugging-Log
  ratingsController.exportRatings(req, res);
});


module.exports = router;
