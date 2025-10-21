const { Parser } = require('json2csv');
const pool = require('../db'); // Verbindung zur Datenbank
const { parseISO, addWeeks, isBefore } = require('date-fns');
const { deleteCourseAndCollectAffectedUsers } = require('../services/courseDeletionService');
const observerNotifier = require('../services/notifications/observerNotifier');
const { createMediatorWithDefaults } = require('../services/notifications/mediatorNotifier');
const { publishCourseDeleted } = require('../services/notifications/pubsubNotifier');

/**
 * Alle Kurse abrufen und zusammen mit Bewertungen zurückgeben
 * - Kursdetails mit durchschnittlicher Bewertung und Anzahl der Bewertungen
 * - Kurse nach Startzeit sortiert zurückgeben
 */
exports.getAllCourses = async (req, res) => {
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
        ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
        COUNT(r.rating) AS rating_count
      FROM courses c
      LEFT JOIN ratings r ON c.id = r.course_id
      GROUP BY c.id
      ORDER BY c.start_time;
    `);      

    const courses = result.rows.map(course => ({
      id: course.id,
      name: course.title,
      description: course.description,
      date: course.start999999_time ? course.start_time.toISOString().split("T")[0] : "unbekannt",
      time: (course.start_time && course.end_time)
        ? `${course.start_time.toTimeString().slice(0, 5)} - ${course.end_time.toTimeString().slice(0, 5)}`
        : "unbekannt",
      room: course.location || "unbekannt",
      trainer: course.trainer_name || "unbekannt",
      trainer_id: course.trainer_id,
      repeat: course.repeat,
      repeat_until: course.repeat_until ? course.repeat_until.toISOString() : null,
      rating: 0,
      reviews: []
    }));

    res.json(result.rows);
    console.log(result.rows);

  } catch (err) {
    console.error("❌ Fehler beim Laden der Kurse:", err);
    res.status(500).json({ error: 'Fehler beim Laden der Kurse' });
  }
};

/**
 * Einen Kurs anhand der Kurs-ID abrufen
 * - Gibt den Kurs zurück, wenn er existiert
 * - 404 wenn nicht gefunden
 */
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kurs nicht gefunden' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Abrufen des Kurses' });
  }
};

/**
 * Einen neuen Kurs anlegen
 * - Erwartet alle relevanten Kursdaten im Request Body
 * - Der angemeldete Nutzer wird als Trainer gespeichert (trainer_id)
 * - Gibt den neu angelegten Kurs als Antwort zurück
 */
exports.createCourse = async (req, res) => {
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    max_capacity,
    repeat,
    repeat_until
  } = req.body;

  const trainer_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO courses 
      (title, description, start_time, end_time, location, max_capacity, trainer_id, repeat, repeat_until)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [title, description, start_time, end_time, location, max_capacity, trainer_id, repeat, repeat_until]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Kurses' });
  }
};

/**
 * Einen bestehenden Kurs aktualisieren
 * - Aktualisiert Kursfelder basierend auf der Kurs-ID (URL-Parameter)
 * - Gibt den aktualisierten Kurs zurück
 * - 404 wenn Kurs nicht gefunden
 */
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    max_capacity,
    repeat,
    repeat_until,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE courses SET 
        title = $1,
        description = $2,
        start_time = $3,
        end_time = $4,
        location = $5,
        max_capacity = $6,
        repeat = $7,
        repeat_until = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [title, description, start_time, end_time, location, max_capacity, repeat, repeat_until, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kurs nicht gefunden' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Kurses' });
  }
};

/**
 * Einen Kurs löschen
 * - Löscht den Kurs basierend auf der Kurs-ID (URL-Parameter)
 * - Gibt eine Bestätigung bei Erfolg zurück
 * - 404 wenn Kurs nicht gefunden
 */
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kurs nicht gefunden' });
    res.json({ message: 'Kurs gelöscht' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Löschen des Kurses' });
  }
};

/**
 * Kurse als CSV exportieren
 * - Exportiert alle Kurse aus der Datenbank
 * - Sendet CSV-Datei als Download an den Client
 */
exports.exportCourses = async (req, res) => {
  try {
    // Kurse aus DB holen
    const result = await pool.query('SELECT * FROM courses');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Keine Kurse gefunden.' });
    }

    // JSON in CSV konvertieren
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(result.rows);

    // Response-Header setzen für CSV-Download
    res.header('Content-Type', 'text/csv');
    res.attachment('courses.csv');
    res.send(csv); // CSV-Daten als Antwort senden
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Kurse.' });
  }
};

// DELETE /api/courses/:id?pattern=observer|mediator|pubsub
exports.deleteCourseHandler = async(req, res) => {
  const courseId = parseInt(req.params.id, 10);
  const pattern = (req.query.pattern || 'observer').toLowerCase();

  try {
    const result = await deleteCourseAndCollectAffectedUsers(courseId);
    if (!result.deletedCourseId) {
      return res.status(404).json({ ok: false, error: 'Course not found' });
    }

    if (result.affectedBookingsCount > 0) {
      if (pattern === 'observer') {
        await observerNotifier.notifyCourseDeletion(result.affectedUsers, courseId);
      } else if (pattern === 'mediator') {
        const mediator = createMediatorWithDefaults();
        await mediator.notify(result.affectedUsers, { courseId, message: 'Der Kurs wurde abgesagt.' });
      } else if (pattern === 'pubsub') {
        publishCourseDeleted(result.affectedUsers, courseId);
      } else {
        await observerNotifier.notifyCourseDeletion(result.affectedUsers, courseId);
      }
    }

    return res.json({ ok: true, deletedCourseId: result.deletedCourseId, affectedBookings: result.affectedBookingsCount });
  } catch (err) {
    console.error('deleteCourse error', err);
    return res.status(500).json({ ok: false, error: 'Server error', details: err.message });
  }
};
