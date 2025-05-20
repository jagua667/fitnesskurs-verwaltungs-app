const { Pool } = require("pg");  // Füge die Pool-Instanz hinzu, falls sie gebraucht wird
// routes/authRoutes.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Registrierung
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name ist erforderlich"),
    body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
    body("password").isLength({ min: 6 }).withMessage("Passwort muss mindestens 6 Zeichen haben"),
  ],
  authController.registerUser
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Gültige E-Mail erforderlich"),
    body("password").notEmpty().withMessage("Passwort ist erforderlich"),
  ],
  authController.loginUser
);

// GET /auth/me – Info zum eingeloggten Benutzer
router.get("/me", authenticateToken, (req, res) => {
  res.json(req.user); // req.user wurde durch authenticateToken gesetzt
});

// PUT /auth/update-role – Rolle ändern (Admin)
router.put("/update-role", authenticateToken, authController.updateRole);

module.exports = router;
