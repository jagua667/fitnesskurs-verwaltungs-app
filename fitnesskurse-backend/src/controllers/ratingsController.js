const { Parser } = require('json2csv');
const db = require('../db'); // Datenbank-Verbindung

/**
 * Bewertungen für einen bestimmten Kurs abrufen.
 * @param req Express Request-Objekt mit courseId als URL-Parameter.
 * @param res Express Response-Objekt.
 * 
 * Funktion holt alle Bewertungen zu einem Kurs, inklusive Name des bewertenden Nutzers,
 * und gibt diese als JSON an den Client zurück.
 */
const getRatingsByCourseId = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await db.query(
      'SELECT r.*, u.name AS user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1',
      [courseId]
    );
    // Rückgabe der rohen Bewertungsdaten aus der DB (inkl. Nutzername)
    res.json(result.rows); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
};

/**
 * Bewertungen aller Kurse eines Trainers abrufen.
 * @param req Express Request-Objekt, Trainer-ID wird aus auth User-Objekt entnommen.
 * @param res Express Response-Objekt.
 * 
 * Holt alle Bewertungen der Kurse, die vom aktuell angemeldeten Trainer angeboten werden.
 * Gibt diese Bewertungen als JSON zurück.
 */
const getRatingsForTrainerCourses = async (req, res) => {
  const trainerId = req.user.id;
  console.log("Trainer ID:", trainerId);

  try {
    const result = await db.query(`
      SELECT r.*, u.name AS user_name 
      FROM ratings r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.course_id IN (
        SELECT id FROM courses WHERE trainer_id = $1
      )
    `, [trainerId]);

    console.log("Ratings result:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Bewertungen.' });
  }
};

/**
 * Bewertungen eines Kurses als CSV-Datei exportieren.
 * @param req Express Request-Objekt mit courseId als URL-Parameter.
 * @param res Express Response-Objekt.
 * 
 * Funktion lädt alle Bewertungen für einen Kurs aus der Datenbank,
 * wandelt die Daten in das CSV-Format um und sendet diese Datei als Download an den Client.
 */
async function exportRatings(req, res) {
  const { courseId } = req.params;

  try {
    // Bewertungen aus der Datenbank laden
    const result = await db.query(
      'SELECT r.*, u.name AS user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      // Falls keine Bewertungen vorhanden sind, 404 zurückgeben
      return res.status(404).json({ message: 'Keine Bewertungen für diesen Kurs gefunden.' });
    }

    // JSON-Daten in CSV umwandeln
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(result.rows);

    // HTTP-Header setzen, um Datei-Download zu ermöglichen
    res.header('Content-Type', 'text/csv');
    res.attachment(`ratings_course_${courseId}.csv`);
    res.send(csv); // CSV-Daten als Antwort senden
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Bewertungen.' });
  }
}

module.exports = {getRatingsByCourseId, getRatingsForTrainerCourses, exportRatings};

