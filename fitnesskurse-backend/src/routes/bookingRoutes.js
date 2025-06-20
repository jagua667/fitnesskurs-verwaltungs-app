console.log("✅ bookingRoutes.js wird geladen");

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Holt alle Buchungen des aktuell eingeloggten Benutzers
 *     tags:
 *       - Buchungen
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Erfolgreich – Liste der Buchungen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookingId:
 *                     type: integer
 *                     example: 101
 *                   courseName:
 *                     type: string
 *                     example: Yoga Basics
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-01T10:00:00Z
 *       401:
 *         description: Nicht autorisiert – Token fehlt oder ungültig
 */
router.get("/my", authenticateToken, bookingController.getUserBookings);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Kursbuchung für Kunden
 *     tags:
 *       - Buchungen
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Buchung erfolgreich
 *       400:
 *         description: Ungültige Anfrage
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Zugriff verweigert – Nur für Kunden erlaubt
 */
router.post('/', authenticateToken, authorizeRole(['kunde']), bookingController.bookCourse);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   delete:
 *     summary: Buchung stornieren (nur für Kunden)
 *     tags:
 *       - Buchungen
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         description: Die ID der zu stornierenden Buchung
 *         schema:
 *           type: integer
 *           example: 101
 *     responses:
 *       200:
 *         description: Buchung erfolgreich storniert
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Zugriff verweigert – Nur für Kunden erlaubt
 *       404:
 *         description: Buchung nicht gefunden
 */
router.delete('/:bookingId', authenticateToken, authorizeRole(['kunde']), bookingController.cancelBooking);


module.exports = router;


