// controllers/ratingsController.js
const db = require('../db'); // Datenbank-Verbindung

// Bewertungen für einen Kurs abrufen
const getRatingsByCourseId = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await db.query(
      'SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1',
      [courseId]
    );
    res.json(result.rows); // Gibt alle Bewertungen zurück
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
};

module.exports = { getRatingsByCourseId };

