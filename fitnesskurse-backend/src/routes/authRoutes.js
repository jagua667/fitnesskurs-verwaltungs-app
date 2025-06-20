// routes/authRoutes.js
const { Pool } = require("pg");  // Füge die Pool-Instanz hinzu, falls sie gebraucht wird
const express = require("express");
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrierung eines neuen Benutzers
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Max Mustermann
 *               email:
 *                 type: string
 *                 example: max@example.com
 *               password:
 *                 type: string
 *                 example: geheim123
 *     responses:
 *       201:
 *         description: Benutzer erfolgreich registriert
 *       400:
 *         description: Benutzer existiert bereits oder Validierungsfehler
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name ist erforderlich"),
    body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
    body("password").isLength({ min: 6 }).withMessage("Passwort muss mindestens 6 Zeichen haben"),
  ],
  authController.registerUser
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Benutzer-Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: max@example.com
 *               password:
 *                 type: string
 *                 example: geheim123
 *     responses:
 *       200:
 *         description: Login erfolgreich, gibt Token und User-Daten zurück
 *       401:
 *         description: Ungültige Anmeldedaten
 *       403:
 *         description: Benutzer ist gesperrt
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
    body("password").notEmpty().withMessage("Passwort ist erforderlich"),
  ],
  authController.loginUser
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Gibt die Daten des authentifizierten Benutzers zurück
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Erfolgreich – Benutzerdaten
 *       401:
 *         description: Token ungültig oder nicht vorhanden
 */
router.get("/me", authenticateToken, (req, res) => {
  res.json(req.user); // req.user wurde durch authenticateToken gesetzt
});


/**
 * @swagger
 * /auth/update-role:
 *   put:
 *     summary: Aktualisiert die Rolle eines Benutzers (nur Admins)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
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
 *                 example: abc123
 *               newRole:
 *                 type: string
 *                 example: trainer
 *     responses:
 *       200:
 *         description: Benutzerrolle aktualisiert
 *       403:
 *         description: Kein Admin-Zugriff
 *       500:
 *         description: Serverfehler
 */
router.put("/update-role", authenticateToken, authController.updateRole);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Beendet die aktuelle Benutzersitzung
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout erfolgreich
 *       500:
 *         description: Serverfehler beim Logout
 */
router.post("/logout", authenticateToken, authController.logoutUser);

module.exports = router;
