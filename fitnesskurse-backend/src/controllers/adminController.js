/**
 * @file adminController.js
 * @description Controller für administrative Aktionen (z.B. Kursabsage).
 * Dieser Controller demonstriert Wartbarkeit durch Kapselung: Er 
 * löst die kritische Benachrichtigung aus, ohne die Filter-Logik zu kennen.
 */

const pool = require('../db');
const WebSocketContext = require('../websocket/WebSocketContext');

/**
 * Markiert einen Kurs als abgesagt und initiiert die kritische WebSocket-Benachrichtigung.
 * @route POST /api/admin/courses/:courseId/cancel
 */
exports.cancelCourse = async (req, res) => {
    // Annahme: Authentifizierung/Rollenprüfung für Admin/Trainer ist hier bereits erfolgt
    const { courseId } = req.params;
    const { reason } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Kurs in der DB als abgesagt markieren und Grund speichern
        // RETURNING * liefert uns die Kursdetails für das Payload
        const courseUpdate = await client.query(
            'UPDATE courses SET cancellation_reason = $1, updated_at = NOW() WHERE id = $2 AND cancellation_reason IS NULL RETURNING *',
            [reason, courseId]
        );

        if (courseUpdate.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Kurs nicht gefunden oder bereits abgesagt." });
        }

        const course = courseUpdate.rows[0];

        // 2. Transaktion abschließen
        await client.query('COMMIT');

        // 3. 🎯 KRITISCHE ZUSTELLUNG über gekapselten Kontext auslösen
        // Der Controller bildet das Payload und übergibt es an den Context.
        const payload = {
            courseId: course.id,
            courseTitle: course.title,
            reason: reason,
            time: new Date().toISOString()
        };

        // Kapselung: Der Controller weiß nicht, WIE (Observer/Mediator) gefiltert wird –
        // nur DASS eine gezielte kritische Nachricht gesendet werden muss.
        WebSocketContext.sendCriticalMessage(course.id, 'course_cancelled', payload); 
        console.log(`[WS:INFO] Absage für Kurs ${course.id} an gebuchte Kunden initiiert.`);

        res.status(200).json({ message: "Kurs erfolgreich abgesagt und Benachrichtigung initiiert." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Fehler beim Absagen des Kurses:", err.stack);
        res.status(500).json({ error: 'Interner Fehler beim Absagen des Kurses.' });
    } finally {
        client.release();
    }
};