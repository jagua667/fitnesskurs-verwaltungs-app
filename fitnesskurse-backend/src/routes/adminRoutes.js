const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const pool = require("../db"); // Verbindung zur PostgreSQL-Datenbank
const { Parser } = require('json2csv');

/**
 * @swagger
 * /admin/update-role:
 *   put:
 *     summary: Ändert die Rolle eines Benutzers (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Neue Rolle und Benutzer-ID
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newRole
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "123"
 *               newRole:
 *                 type: string
 *                 example: "trainer"
 *     responses:
 *       200:
 *         description: Benutzerrolle erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benutzerrolle aktualisiert
 *       500:
 *         description: Serverfehler
 */
router.put("/update-role", authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [newRole, userId]);
    res.json({ message: "Benutzerrolle aktualisiert" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Serverfehler" });
  }
});

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Liefert Admin-Kennzahlen über Benutzer, Buchungen, Bewertungen
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin-Statistiken erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeUsers:
 *                   type: string
 *                   example: "5"
 *                 activeCourses:
 *                   type: string
 *                   example: "3"
 *                 totalBookings:
 *                   type: string
 *                   example: "12"
 *                 todaysBookings:
 *                   type: string
 *                   example: "2"
 *                 avgRating:
 *                   type: number
 *                   format: float
 *                   example: 4.2
 *                 newCourses:
 *                   type: string
 *                   example: "1"
 *                 newRatings:
 *                   type: string
 *                   example: "4"
 *       500:
 *         description: Serverfehler
 */
router.get('/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const activeUsers = await pool.query(`SELECT COUNT(DISTINCT user_id) FROM sessions WHERE last_active > NOW() - INTERVAL '10 MINUTES'`);
    const activeCourses = await pool.query('SELECT COUNT(*) FROM courses WHERE start_time > NOW()');
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const todaysBookings = await pool.query('SELECT COUNT(*) FROM bookings WHERE booking_date BETWEEN NOW() - INTERVAL \'24 HOURS\' AND NOW()');
    const avgRating = await pool.query('SELECT ROUND(AVG(rating), 1) as avg FROM reviews');
    const newCourses = await pool.query('SELECT COUNT(*) FROM courses WHERE created_at >= NOW() - INTERVAL \'24 HOURS\'');
    const newRatings = await pool.query('SELECT COUNT(*) FROM ratings WHERE created_at >= NOW() - INTERVAL \'24 HOURS\'');

    res.json({
      activeUsers: activeUsers.rows[0].count,
      activeCourses: activeCourses.rows[0].count,
      totalBookings: totalBookings.rows[0].count,
      todaysBookings: todaysBookings.rows[0].count,
      avgRating: avgRating.rows[0].avg || 0,
      newCourses: newCourses.rows[0].count,
      newRatings: newRatings.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Abrufen der Admin-Statistiken');
  }
});

/**
 * @swagger
 * /admin/export/courses:
 *   get:
 *     summary: Exportiert Kursdaten als CSV (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV-Datei mit Kursdaten
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Serverfehler
 */
router.get('/export/courses', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT c.id, 
               c.title AS course_name, 
               c.description, 
               TO_CHAR(c.start_time, 'YYYY-MM-DD') AS date,
               TO_CHAR(c.start_time, 'HH24:MI') || ' - ' || TO_CHAR(c.end_time, 'HH24:MI') AS time,
               c.location,
               u.name AS trainer_name,
               COUNT(b.id) AS participant_count
        FROM courses c
        LEFT JOIN bookings b ON c.id = b.course_id
        LEFT JOIN users u ON u.id = c.trainer_id
        GROUP BY c.id, u.name
        ORDER BY c.start_time
    `);

    const fields = ['id', 'course_name', 'description', 'date', 'time', 'location', 'trainer_name', 'participant_count'];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('courses_export.csv');
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Export der Kurse');
  }
});

/**
 * @swagger
 * /admin/export/ratings:
 *   get:
 *     summary: Exportiert Kursbewertungen als CSV (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV-Datei mit Bewertungen
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Serverfehler
 */
router.get('/export/ratings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(`
              SELECT r.id, 
               r.course_id, 
               c.title AS course_name, 
               r.rating AS stars, 
               r.comment, 
               u.name AS user_name
        FROM ratings r
        JOIN courses c ON r.course_id = c.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `);

    const fields = ['id', 'course_id', 'course_name', 'stars', 'comment', 'user_name'];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('reviews_export.csv');
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Export der Bewertungen');
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Ruft alle Benutzer mit Rollen und Sperrstatus ab (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste aller Benutzer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123"
 *                   name:
 *                     type: string
 *                     example: "Max Mustermann"
 *                   email:
 *                     type: string
 *                     example: "max@example.com"
 *                   role:
 *                     type: string
 *                     example: "admin"
 *                   locked:
 *                     type: boolean
 *                     example: false
 *       500:
 *         description: Serverfehler
 */
router.get("/users", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, locked FROM users ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Fehler beim Laden der Benutzerliste" });
  }
});

/**
 * @swagger
 * /admin/users/lock:
 *   put:
 *     summary: Sperrt oder entsperrt einen Benutzer (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Benutzer-ID und Sperrstatus
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - locked
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "123"
 *               locked:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Sperrstatus erfolgreich gesetzt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benutzer wurde gesperrt
 *       500:
 *         description: Serverfehler
 */
router.put("/users/lock", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const { userId, locked } = req.body;

  try {
    await pool.query("UPDATE users SET locked = $1 WHERE id = $2", [locked, userId]);
    res.json({ message: `Benutzer wurde ${locked ? "gesperrt" : "entsperrt"}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Fehler beim Sperren oder Entsperren des Benutzers" });
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Löscht einen Benutzer anhand der ID (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID des zu löschenden Benutzers
 *         schema:
 *           type: string
 *           example: "123"
 *     responses:
 *       200:
 *         description: Benutzer erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Benutzer gelöscht
 *       500:
 *         description: Serverfehler
 */
router.delete("/users/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const userId = req.params.id;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json({ message: "Benutzer gelöscht" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Fehler beim Löschen des Benutzers" });
  }
});

/**
 * @swagger
 * /admin/newRatings:
 *   get:
 *     summary: Gibt alle Bewertungen der letzten 24 Stunden zurück (nur Admins)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Neue Bewertungen erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   course:
 *                     type: string
 *                     example: "Yoga Anfängerkurs"
 *                   user:
 *                     type: string
 *                     example: "Anna Schmidt"
 *                   rating:
 *                     type: number
 *                     example: 5
 *                   comment:
 *                     type: string
 *                     example: "Sehr guter Kurs!"
 *       500:
 *         description: Serverfehler
 */
router.get('/newRatings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        c.title AS course,
        u.name AS user,
        r.rating,
        r.comment
      FROM ratings r
      JOIN courses c ON r.course_id = c.id
      JOIN users u ON r.user_id = u.id
      WHERE r.created_at >= NOW() - INTERVAL '24 HOURS'
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Abrufen neuer Bewertungen" });
  }
});


module.exports = router;
