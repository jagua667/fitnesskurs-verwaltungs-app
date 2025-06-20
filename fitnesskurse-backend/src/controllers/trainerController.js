const pool = require('../db'); // Verbindung zur Datenbank
const { parseISO, addWeeks, isBefore } = require('date-fns');

/**
 * Kurse eines Trainers abrufen.
 * 
 * @route GET /api/courses/trainer
 * @access Authentifizierte Trainer
 * 
 * Diese Funktion ruft alle Kurse ab, die vom aktuell angemeldeten Trainer erstellt wurden.
 * 
 * Für jeden Kurs werden folgende Informationen berechnet und zurückgegeben:
 * - Kursdetails (Titel, Beschreibung, Zeiten, Raum etc.)
 * - Durchschnittliche Bewertung & Anzahl der Bewertungen
 * - Teilnehmeranzahl & Teilnehmernamen
 * - Trainerinformationen
 */
exports.getCoursesByTrainer = async (req, res) => {
  const trainerId = req.user.id; // ID des aktuell angemeldeten Trainers

  try {
    const result = await pool.query(`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.start_time,
          c.end_time,
          c.location,
          c.max_capacity,
          c.trainer_name,
          c.trainer_id,
          c.repeat,
          c.repeat_until,
          t.name AS trainer_full_name,
          ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
          COUNT(r.rating) AS rating_count,
          COUNT(DISTINCT b.id) AS participant_count,
          json_agg(DISTINCT u.name) FILTER (WHERE u.name IS NOT NULL) AS participants
        FROM courses c
        LEFT JOIN ratings r ON c.id = r.course_id
        LEFT JOIN bookings b ON c.id = b.course_id
        LEFT JOIN users t ON c.trainer_id = t.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE c.trainer_id = $1
        GROUP BY c.id, t.name
        ORDER BY c.start_time;
    `, [trainerId]);

    // Umwandlung der Rohdaten in ein übersichtliches Objektformat für den Client
    const courses = result.rows.map(course => ({
      id: course.id,
      name: course.title,
      description: course.description,
      date: course.start_time ? course.start_time.toISOString().split("T")[0] : "unbekannt",
      time: (course.start_time && course.end_time)
        ? `${course.start_time.toTimeString().slice(0, 5)} - ${course.end_time.toTimeString().slice(0, 5)}`
        : "unbekannt",
      room: course.location || "unbekannt",
      trainer: course.trainer_name || course.trainer_full_name || "unbekannt",
      trainer_id: course.trainer_id,
      repeat: course.repeat,
      repeat_until: course.repeat_until ? course.repeat_until.toISOString() : null,
      rating: course.average_rating,
      rating_count: course.rating_count,
      participant_count: course.participant_count,
      participant: course.participants || [],
      max_capacity: course.max_capacity,
    }));

    res.json(courses); // Antwort an den Client senden
  } catch (err) {
    console.error("Fehler beim Laden der Trainer-Kurse:", err);
    res.status(500).json({ error: 'Fehler beim Laden der Trainer-Kurse' });
  }
};
