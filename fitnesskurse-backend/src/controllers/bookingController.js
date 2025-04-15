const pool = require('../db');
const {
  sendBookingEmailToCustomer,
  sendBookingEmailToTrainer,
  sendCancellationEmailToCustomer,
  sendCancellationEmailToTrainer,
} = require('../services/mailer');

// 🟢 Kurs buchen
exports.bookCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  try {
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

    const count = await pool.query('SELECT COUNT(*) FROM bookings WHERE course_id = $1', [courseId]);
    if (parseInt(count.rows[0].count) >= course.max_capacity)
      return res.status(400).json({ message: 'Kurs ist ausgebucht' });

    await pool.query(
      'INSERT INTO bookings (course_id, user_id, status, booking_date) VALUES ($1, $2, $3, NOW())',
      [courseId, userId, 'booked']
    );

    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // 📧 E-Mails senden
    const emailData = {
      name: user.name,
      user: user.name,
      course: course.name,
      date: course.date,
      time: course.time,
      trainer: course.trainer_name,
    };

    await sendBookingEmailToCustomer(user.email, emailData);
    console.log("📧 Kunden-E-Mail:", user.email);
    await sendBookingEmailToTrainer(course.trainer_email, emailData); 

    res.json({ message: 'Kurs gebucht und E-Mails gesendet' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Du hast diesen Kurs bereits gebucht' });
    }
    res.status(500).json({ error: 'Fehler beim Buchen' });
  }
};

// 🔴 Kurs stornieren
exports.cancelBooking = async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;

  try {
    console.log(`Versuche, Buchung zu stornieren: bookingId = ${bookingId}, userId = ${userId}`);

    // 🧠 Buchung holen inkl. Kursdaten
    const bookingResult = await pool.query(
      `SELECT b.*, c.title AS course_name, c.start_time, c.end_time, 
              u.email AS trainer_email, u.name AS trainer_name
       FROM bookings b
       JOIN courses c ON b.course_id = c.id
       JOIN users u ON c.trainer_id = u.id
       WHERE b.id = $1 AND b.user_id = $2 AND b.status = 'booked'`,
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      console.log(`Keine Buchung gefunden oder Status ist nicht 'booked' für bookingId: ${bookingId}, userId: ${userId}`);
      return res.status(404).json({ message: 'Buchung nicht gefunden oder nicht erlaubt' });
    }

    const booking = bookingResult.rows[0];
    console.log(`Buchung gefunden: ${JSON.stringify(booking)}`);

    // 🧹 Lösche Buchung
    const deleteResult = await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
    console.log(`Löschvorgang abgeschlossen: ${deleteResult.rowCount} Zeile(n) gelöscht`);

    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const emailData = {
      name: user.name,
      user: user.name,
      course: booking.course_name,
      date: booking.start_time,
      time: booking.end_time,
      trainer: booking.trainer_name,
    };

    try {
      await sendCancellationEmailToCustomer(user.email, emailData);
      await sendCancellationEmailToTrainer(booking.trainer_email, emailData);
    } catch (emailError) {
      console.error("Fehler beim Senden der Stornierungs-E-Mails:", emailError);
    }

    res.status(200).json({ message: 'Buchung storniert und E-Mails gesendet' });
  } catch (err) {
    console.error("Fehler beim Stornieren:", err.message, err.stack);
    res.status(500).json({ error: 'Fehler beim Stornieren', details: err.message });
  }
};

