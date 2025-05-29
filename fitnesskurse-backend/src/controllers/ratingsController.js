const { Parser } = require('json2csv');
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

// Controller zum Exportieren der Bewertungen eines Kurses als CSV
async function exportRatings(req, res) {
  const { courseId } = req.params;

  try {
    // Holen der Bewertungen für einen bestimmten Kurs aus der Datenbank
    const result = await db.query(
      'SELECT r.*, u.name AS user_name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Keine Bewertungen für diesen Kurs gefunden.' });
    }

    // Umwandlung der JSON-Daten in CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(result.rows);

    // Setze Header für den Download
    res.header('Content-Type', 'text/csv');
    res.attachment(`ratings_course_${courseId}.csv`);
    res.send(csv); // CSV-Daten als Antwort senden
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Bewertungen.' });
  }
}

module.exports = {getRatingsByCourseId, exportRatings};

