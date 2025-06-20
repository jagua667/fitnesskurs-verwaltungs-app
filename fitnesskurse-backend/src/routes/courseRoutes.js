const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 


/**
 * @swagger
 * /courses/export/courses:
 *   get:
 *     summary: Exportiere Kursdaten als CSV-Datei
 *     tags:
 *       - Kurse
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV-Export erfolgreich
 *       401:
 *         description: Nicht autorisiert
 */
router.get('/export/courses', authenticateToken, courseController.exportCourses);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Alle Kurse abrufen
 *     tags:
 *       - Kurse
 *     responses:
 *       200:
 *         description: Liste aller Kurse
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Einzelnen Kurs anhand der ID abrufen
 *     tags:
 *       - Kurse
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kurs-ID
 *     responses:
 *       200:
 *         description: Kursdetails
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Kurs nicht gefunden
 */
router.get('/:id', courseController.getCourseById);


/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Neuen Kurs anlegen
 *     tags:
 *       - Kurse
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Kurs erfolgreich erstellt
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Zugriff verweigert
 */
router.post('/', authenticateToken, authorizeRole(['admin', 'trainer']), courseController.createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Kurs aktualisieren
 *     tags:
 *       - Kurse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kurs-ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Kurs erfolgreich aktualisiert
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Zugriff verweigert
 *       404:
 *         description: Kurs nicht gefunden
 */
router.put('/:id', authenticateToken, authorizeRole(['admin', 'trainer']), courseController.updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Kurs löschen
 *     tags:
 *       - Kurse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kurs-ID
 *     responses:
 *       200:
 *         description: Kurs erfolgreich gelöscht
 *       401:
 *         description: Nicht autorisiert
 *       403:
 *         description: Zugriff verweigert
 *       404:
 *         description: Kurs nicht gefunden
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'trainer']), courseController.deleteCourse);

module.exports = router;

