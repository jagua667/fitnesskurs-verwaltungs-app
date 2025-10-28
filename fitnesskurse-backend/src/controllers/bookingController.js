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
const courseManager = require('../../models/CourseManager.js');
const {
  sendBookingEmailToCustomer,
  sendBookingEmailToTrainer,
  sendCancellationEmailToCustomer,
  sendCancellationEmailToTrainer,
} = require('../services/mailer');
const { observerNotifier } = require('../services/notifications/observerNotifier');
const { createMediatorWithDefaults } = require('../services/notifications/mediatorNotifier');
const { publishCourseAvailableAgain } = require('../services/notifications/pubsubNotifier');

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
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Transaktion starten
    // Kursdetails inkl. Trainerdaten abfragen
    const courseResult = await client.query(
      `SELECT c.id, c.max_capacity, u.email AS trainer_email, u.name AS trainer_name, c.title, c.start_time, c.end_time
       FROM courses c 
       JOIN users u ON c.trainer_id = u.id 
       WHERE c.id = $1`,
      [courseId]
    );
    if (courseResult.rows.length === 0)
      return res.status(404).json({ message: 'Kurs nicht gefunden' });

    const course = courseResult.rows[0];

    // ATOMARE KAPAZITÄTSPRÜFUNG & ZÄHLER-INKREMENT
    const updateResult = await client.query(
      `UPDATE courses 
       SET booked_participants = booked_participants + 1 
       WHERE id = $1 AND booked_participants < max_capacity
       RETURNING booked_participants`,
      [courseId]
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Kurs ist ausgebucht' });
    }

    // 3. Buchung anlegen
    await client.query(
      'INSERT INTO bookings (course_id, user_id, status, booking_date) VALUES ($1, $2, $3, NOW())',
      [courseId, userId, 'booked']
    );

    // 4. KUNDENDATEN FÜR E-MAIL ABRUFEN (INNERHALB DER TRANSAKTION MIT 'client')
    const userResult = await client.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    await client.query('COMMIT'); // Transaktion erfolgreich abschließen

    // Zustand über den CourseManager aktualisieren und Filter-Daten abrufen
    // participantsChange = +1 (Ein Platz wurde belegt, d.h. -1 free spot, oder +1 booked participant)
    const filterData = await courseManager.handleCourseUpdate(courseId, -1);

    if (filterData) {
      // Rufe die zentrale Benachrichtigungsfunktion mit den Zustandsdaten auf
      // Diese Funktion enthält jetzt die rollenbasierte Filterlogik.
      WebSocketContext.notifyCourseUpdate(filterData);
      // ⚠️ Die vorherige manuelle WebSocketContext.distributeMessage-Logik wird entfernt/ersetzt.
    }

    // E-Mail-Daten vorbereiten
    const emailData = {
      name: user.name,
      user: user.name,
      course: course.title,
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
    // ROLLBACK bei jedem Fehler
    await client.query('ROLLBACK');
    // Fehler bei doppelter Buchung (Unique Constraint)
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Du hast diesen Kurs bereits gebucht' });
    }
    console.error("Fehler beim Buchen:", err.message, err.stack);
    res.status(500).json({ error: 'Fehler beim Buchen', details: err.message });
  } finally {
    // UNBEDINGT die Client-Verbindung freigeben
    client.release();
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
  const client = await pool.connect(); // Startet DB-Client für Transaktion

  try {
    await client.query('BEGIN'); // Transaktion starten
    console.log(`Versuche, Buchung zu stornieren: bookingId = ${bookingId}, userId = ${userId}`);

    // Buchung mit Kurs- und Trainerdaten abfragen
    const bookingResult = await client.query(
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

    const courseId = booking.course_id;

    // 2. Buchung löschen (mit 'client')
    await client.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

    // 3. ATOMARE ZÄHLER-DEKREMENTIERUNG (mit 'client')
    await client.query('UPDATE courses SET booked_participants = booked_participants - 1 WHERE id = $1', [courseId]);

    // Zustand über den CourseManager aktualisieren und Filter-Daten abrufen
    // participantsChange = +1 (Ein freier Platz kommt hinzu)
    const filterResult = await courseManager.handleCourseUpdate(courseId, -1);

    // 🔍 Ermittle interessierte Benutzer (z. B. Kunden, die sich vormals nicht einbuchen konnten)
    const interestedUsers = await courseManager.getInterestedUsers(courseId);

    // 🎯 Bereite Kursdaten für Notification-Patterns vor
    const courseData = {
      id: courseId,
      title: filterResult.updatedCourse.title,
      seatsAvailable: filterResult.newSpots,
    };

    if (filterResult) {
      // Mappen der Manager-Rückgabe auf Client-Format
      const clientPayload = {
        // Der Titel liegt im updatedCourse-Objekt
        courseTitle: filterResult.updatedCourse.title,
        // Die korrekte Anzahl freier Plätze liegt in newSpots
        seatsAvailable: filterResult.newSpots,
        courseId: courseId
      };

      // 3a. Rufe die zentrale Benachrichtigungsfunktion mit KORRIGIERTER Payload auf
      WebSocketContext.distributeMessage('course_updated', clientPayload);

      // 3b. Rufe notifyCourseAvailableAgain für das relevante Pattern auf.
      const pattern = (req.query.pattern || process.env.NOTIFY_PATTERN || 'observer').toLowerCase();
      console.log(`[Pattern] Using pattern="${pattern}" for cancelBooking notification`);
      if (pattern === 'observer') {
        await observerNotifier.notifyCourseAvailableAgain(interestedUsers, courseData);
      } else if (pattern === 'mediator') {
        const mediator = createMediatorWithDefaults();
        await mediator.notifyCourseAvailableAgain(interestedUsers, courseData);
      } else if (pattern === 'pubsub') {
        publishCourseAvailableAgain(interestedUsers, courseData);
      }

      console.log(`[WS:INFO] Sende Update: ${clientPayload.courseTitle} hat ${clientPayload.seatsAvailable} Plätze.`);
    }

    // 4. 🔥 KUNDENDATEN FÜR E-MAIL ABRUFEN (mit 'client')
    const userResult = await client.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    await client.query('COMMIT'); // Transaktion erfolgreich abschließen

    const emailData = {
      name: user.name,
      user: user.name,
      course: booking.course_name,
      date: booking.start_time ? booking.start_time.toISOString().split("T")[0] : "unbekannt",
      time: (booking.start_time && booking.end_time)
        ? `${booking.start_time.toTimeString().slice(0, 5)} - ${booking.end_time.toTimeString().slice(0, 5)}`
        : "unbekannt",
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
    await client.query('ROLLBACK'); // Bei Fehler Transaktion rückgängig machen
    console.error("Fehler beim Stornieren:", err.message, err.stack);
    res.status(500).json({ error: 'Fehler beim Stornieren', details: err.message });
  } finally {
    client.release(); // Client-Verbindung freigeben
  }
};

