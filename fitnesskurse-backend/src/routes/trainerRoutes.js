const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 

/**
 * @swagger
 * /api/trainer/courses:
 *   get:
 *     summary: Gibt alle Kurse des eingeloggten Trainers zurück
 *     tags:
 *       - Trainer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Erfolgreich – Liste der Kurse
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Yoga Basics
 *                   description:
 *                     type: string
 *                     example: Einführung in Yoga
 *                   trainer_id:
 *                     type: integer
 *                     example: 3
 *       401:
 *         description: Nicht autorisiert – Token fehlt oder ist ungültig
 *       403:
 *         description: Zugriff verweigert – keine Trainerrolle
 */
router.get('/courses', authenticateToken, authorizeRole(['trainer']), trainerController.getCoursesByTrainer);

module.exports = router;
