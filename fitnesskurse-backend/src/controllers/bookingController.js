const pool = require('../db'); // deine DB-Verbindung
const { authorizeRole } = require('../middleware/authMiddleware');  // Importiere die Autorisierungs-Middleware

// 🟢 Kurs buchen
exports.bookCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  try {
    // 1. Prüfen, ob Kurs existiert
    const course = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) return res.status(404).json({ message: 'Kurs nicht gefunden' });

    // 2. Prüfen, ob Kurs voll ist
    const count = await pool.query('SELECT COUNT(*) FROM bookings WHERE course_id = $1', [courseId]);
    if (parseInt(count.rows[0].count) >= course.rows[0].max_capacity) {
      return res.status(400).json({ message: 'Kurs ist ausgebucht' });
    }

    // 3. Buchung einfügen
   await pool.query(
  'INSERT INTO bookings (course_id, user_id, status, booking_date) VALUES ($1, $2, $3, NOW())',
  [courseId, userId, 'booked']
);

    res.json({ message: 'Kurs erfolgreich gebucht' });

  } catch (err) {
    if (err.code === '23505') { // UNIQUE constraint verletzt
      return res.status(400).json({ message: 'Du hast diesen Kurs bereits gebucht' });
    }
    res.status(500).json({ error: 'Fehler beim Buchen' });
  }
};

// 🔴 Kurs stornieren
exports.cancelBooking = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM bookings WHERE course_id = $1 AND user_id = $2 RETURNING *',
      [courseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Buchung nicht gefunden' });
    }

    res.json({ message: 'Buchung storniert' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Stornieren' });
  }
};

