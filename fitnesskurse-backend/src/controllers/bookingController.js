const pool = require('../db'); // deine DB-Verbindung
const { authorizeRole } = require('../middleware/authMiddleware');  // Importiere die Autorisierungs-Middleware
const sendEmail = require('../services/mailer'); 

// 🟢 Kurs buchen
exports.bookCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  try {
    // 1. Prüfen, ob Kurs existiert
   // const course = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
//    if (course.rows.length === 0) return res.status(404).json({ message: 'Kurs nicht gefunden' });

    // Kursdaten holen
    const courseResult = await pool.query(
      `SELECT c.*, u.email AS trainer_email, u.name AS trainer_name 
       FROM courses c 
       JOIN users u ON c.trainer_id = u.id 
       WHERE c.id = $1`,
      [courseId]
    );

    if (courseResult.rows.length === 0)
      return res.status(404).json({ message: 'Kurs nicht gefunden' });

    const course = courseResult.rows[0];

    // 2. Prüfen, ob Kurs voll ist
    const count = await pool.query('SELECT COUNT(*) FROM bookings WHERE course_id = $1', [courseId]);
    if (parseInt(count.rows[0].count) >= course.max_capacity)
      return res.status(400).json({ message: 'Kurs ist ausgebucht' });
    

    // 3. Buchung einfügen
   await pool.query(
  'INSERT INTO bookings (course_id, user_id, status, booking_date) VALUES ($1, $2, $3, NOW())',
  [courseId, userId, 'booked']
);

// Nutzerdaten für E-Mail holen
    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

// E-Mail senden (an Nutzer)
    const subject = `Bestätigung Ihrer Kursbuchung – ${course.name}`;
    const text = `Hallo ${user.name},\n\nvielen Dank für Ihre Buchung des Kurses "${course.name}" am ${course.date} um ${course.time} Uhr mit ${course.trainer_name}. Wir freuen uns auf Ihre Teilnahme!\n\nIhr Fitness-Team`;

 await sendEmail(user.email, subject, text); // ✅ E-Mail wird verschickt

// E-Mail an Trainer
const trainerSubject = `Neue Buchung für Ihren Kurs – ${course.name}`;
const trainerText = `Hallo ${course.trainer_name},\n\n${user.name} hat sich für Ihren Kurs "${course.name}" am ${course.date} um ${course.time} Uhr angemeldet.\n\nIhr Kursverwaltungssystem`;

await sendEmail(course.trainer_email, trainerSubject, trainerText); // 📧 an Trainer

    res.json({ message: 'Kurs erfolgreich gebucht und E-Mail gesendet' });

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

