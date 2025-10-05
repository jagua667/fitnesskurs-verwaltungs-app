/**
 * bookingController.js
 *
 * Enthält Funktionen zur Verwaltung von Kursbuchungen:
 * - Alle Buchungen eines Nutzers abrufen
 * - Kurs buchen mit Kapazitätsprüfung
 * - Kursbuchung stornieren mit E-Mail-Benachrichtigungen
 *
 * Verwendet:
 * - PostgreSQL via pool (db.js)
 * - Mailer-Service für Benachrichtigungen
 */


const pool = require('../db');
const WebSocketContext = require('../websocket/WebSocketContext');
const {
  sendBookingEmailToCustomer,
  sendBookingEmailToTrainer,
  sendCancellationEmailToCustomer,
  sendCancellationEmailToTrainer,
} = require('../services/mailer');

/**
 * Alle Buchungen des angemeldeten Nutzers abrufen
 * - JOIN auf bookings, courses, users, ratings für umfassende Daten
 * - Nutzerbezogene Bewertungen auslesen (ob User bewertet hat)
 * - Datum und Zeiten formatiert zurückgeben
 */
exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
SELECT b.id AS booking_id, b.booking_date, c.*, c.title AS course_name, t.name AS trainer, c.trainer_id AS trainer_id, u.email AS user_email, t.email AS trainer_email, cr.average_rating AS average_rating, cr.rating_count AS rating_count, cr.user_has_rated         
      FROM bookings b
      JOIN courses c ON b.course_id = c.id
      JOIN users t ON c.trainer_id = t.id
      JOIN users u ON b.user_id = u.id
      JOIN (SELECT c2.id, ROUND(AVG(r.rating)::numeric, 1) AS average_rating, COUNT(r.rating) AS rating_count, BOOL_OR(r.user_id = $1) AS user_has_rated FROM courses c2 LEFT JOIN ratings r ON c2.id = r.course_id GROUP BY c2.id) cr ON c.id = cr.id
      WHERE b.user_id = $1 AND b.status = 'booked'
    `, [userId]);

    // Buchungsdaten formatieren und zurückgeben
    const bookings = result.rows.map(course => ({
      id: course.booking_id,
      booking_date: course.booking_date ? course.booking_date.toISOString() : null,
      name: course.course_name,
      user_email: course.user_email,
      description: course.description,
      date: course.start_time ? course.start_time.toISOString().split("T")[0] : "unbekannt",
      time: (course.start_time && course.end_time)
        ? `${course.start_time.toTimeString().slice(0, 5)} - ${course.end_time.toTimeString().slice(0, 5)}`
        : "unbekannt",
      room: course.location || "unbekannt",
      trainer: course.trainer || "unbekannt",
      user_has_rated: course.user_has_rated,
      rating: course.average_rating ?? null,
      rating_count: course.rating_count ?? null,
      repeat: course.repeat, // falls es ein JSON-Feld o.Ä. ist
      repeat_until: course.repeat_until ? course.repeat_until.toISOString() : null,
      // weitere Felder falls benötigt
    }));

    res.json(bookings);
  } catch (err) {
    console.error("Fehler beim Abrufen der Buchungen:", err);
    res.status(500).json({ message: "Fehler beim Laden der Buchungen" });
  }
};


/**
 * Kurs buchen
 * - Prüft ob Kurs existiert
 * - Prüft ob Kurs noch Kapazität hat
 * - Fügt Buchung hinzu
 * - Sendet Benachrichtigungs-E-Mails an Kunde und Trainer
 */
exports.bookCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  try {
    // Kursdetails inkl. Trainerdaten abfragen
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

    // Anzahl aktueller Buchungen prüfen
    const count = await pool.query('SELECT COUNT(*) FROM bookings WHERE course_id = $1 AND status = $2', [courseId, 'booked']);
    const currentBookings = parseInt(count.rows[0].count);

    if (currentBookings >= course.max_capacity)
      return res.status(400).json({ message: 'Kurs ist ausgebucht' });

    // Buchung anlegen
    await pool.query(
      'INSERT INTO bookings (course_id, user_id, status, booking_date) VALUES ($1, $2, $3, NOW())',
      [courseId, userId, 'booked']
    );

    // Den neuen Status berechnen (für den Payload)
    const newAvailableSeats = course.max_capacity - (currentBookings + 1);

    // WebSocket-Trigger für die Push-Benachrichtigungen: Ruft die aktive Strategie auf
    WebSocketContext.distributeMessage('course_updated', {
        courseId: courseId, // Wichtig für das Frontend, um zu wissen, welcher Kurs betroffen ist
        courseTitle: course.title,
        maxCapacity: course.max_capacity,
        // Sende die neue Anzahl der freien Plätze
        seatsAvailable: newAvailableSeats, 
        action: 'booked',
    });

    // Kundendaten holen
    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // E-Mail-Daten vorbereiten
    const emailData = {
      name: user.name,
      user: user.name,
      course: course.name,
      date: course.date,
      time: course.time,
      trainer: course.trainer_name,
    };

    // E-Mails senden
    await sendBookingEmailToCustomer(user.email, emailData);
    console.log("📧 Kunden-E-Mail:", user.email);
    await sendBookingEmailToTrainer(course.trainer_email, emailData); 

    res.json({ message: 'Kurs gebucht und E-Mails gesendet' });
  } catch (err) {
    // Fehler bei doppelter Buchung (Unique Constraint)
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Du hast diesen Kurs bereits gebucht' });
    }
    res.status(500).json({ error: 'Fehler beim Buchen' });
  }
};

/**
 * Kursbuchung stornieren
 * - Prüft ob Buchung existiert und dem Nutzer gehört
 * - Löscht Buchung aus DB
 * - Sendet Stornierungs-E-Mails an Kunde und Trainer
 */
exports.cancelBooking = async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;

  try {
    console.log(`Versuche, Buchung zu stornieren: bookingId = ${bookingId}, userId = ${userId}`);

    // Buchung mit Kurs- und Trainerdaten abfragen
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

    // Buchung löschen
    const deleteResult = await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
    console.log(`Löschvorgang abgeschlossen: ${deleteResult.rowCount} Zeile(n) gelöscht`);

    // Aktuelle Anzahl der Buchungen abrufen
    const countResult = await pool.query('SELECT COUNT(*) FROM bookings WHERE course_id = $1 AND status = $2', [booking.course_id, 'booked']);
    const remainingBookings = parseInt(countResult.rows[0].count);

    // Kursdetails holen, um die max_capacity zu bekommen (da sie nicht in der Buchung ist)
    const courseCapacity = await pool.query('SELECT max_capacity, title FROM courses WHERE id = $1', [booking.course_id]);

    const newAvailableSeats = courseCapacity.rows[0].max_capacity - remainingBookings;

    // WebSocket-Trigger für die Push-Benachrichtigungen: Ruft die aktive Strategie auf
    WebSocketContext.distributeMessage('course_updated', {
        courseId: booking.course_id,
        courseTitle: courseCapacity.rows[0].title,
        maxCapacity: courseCapacity.rows[0].max_capacity,
        // Sende die neue Anzahl der freien Plätze
        seatsAvailable: newAvailableSeats, 
        action: 'cancelled',
    });

    // Nutzerinfos holen
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

    // E-Mails senden, Fehler abfangen
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

