const { Parser } = require('json2csv');
const pool = require('../db'); // Verbindung zur Datenbank

exports.getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY start_time');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Laden der Kurse' });
  }
};

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

exports.createCourse = async (req, res) => {
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    max_capacity
  } = req.body;

  const trainer_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO courses 
      (title, description, start_time, end_time, location, max_capacity, trainer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [title, description, start_time, end_time, location, max_capacity, trainer_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Kurses' });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    max_capacity
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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [title, description, start_time, end_time, location, max_capacity, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kurs nicht gefunden' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Kurses' });
  }
};

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

exports.exportCourses = async (req, res) => {
  try {
    // Holen der Kursdaten aus der Datenbank
    const result = await pool.query('SELECT * FROM courses');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Keine Kurse gefunden.' });
    }

    // Umwandlung der JSON-Daten in CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(result.rows);

    // Setze Header für den Download
    res.header('Content-Type', 'text/csv');
    res.attachment('courses.csv');
    res.send(csv); // CSV-Daten als Antwort senden
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Kurse.' });
  }
};
