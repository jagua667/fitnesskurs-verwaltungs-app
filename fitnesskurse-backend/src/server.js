/**
 * server.js
 *
 * Startpunkt der Webanwendung für die Verwaltung von Fitnesskursen.
 * Diese Datei konfiguriert Express, verbindet sich mit der PostgreSQL-Datenbank,
 * richtet alle API-Routen ein und startet den HTTP-Server.
 *
 * Verwendete Technologien:
 * - Express (API-Server)
 * - PostgreSQL (Datenbank, via pg-Pool)
 * - CORS (Cross-Origin-Requests erlauben)
 * - Nodemailer (Versand von Benachrichtigungs-E-Mails)
 * - .env (Konfiguration über Umgebungsvariablen)
 *
 * API-Routen (via /api/*):
 * - /auth: Registrierung und Login
 * - /bookings: Kursbuchungen
 * - /courses: Kursinformationen
 * - /trainer: Trainerverwaltung
 * - /ratings: Kursbewertungen
 * - /fitnesscourses: (ggf. entfernen oder vereinheitlichen)
 *
 * Startbefehl:
 *    node server.js
 *
 * Erwartete Umgebungsvariablen (.env):
 * - DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT
 * - EMAIL_USER, EMAIL_PASS
 * - PORT (optional)
 */

require('dotenv').config();

const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");

// Swagger-Dokumentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const { bookCourse, cancelBooking } = require('./controllers/bookingController');

console.log("🔥 Server wird gestartet!");
const app = express(); // ✅ App wird hier zuerst erstellt

// PostgreSQL-Verbindung
const pool = require("./db");

// Datenbankverbindung testen
console.log("Geladener DB-Benutzer: ", process.env.DB_USER);
console.log("Geladenes DB-Passwort: ", process.env.DB_PASSWORD);
console.log("🚀 Starte Verbindung zur Datenbank...");

const CourseManager = require('../models/CourseManager'); // ⬅️ Neu: Import des Managers
const courseManager = CourseManager;

// Verbindung testen
pool.connect()
  .then(client => {
    console.log("✅ Erfolgreich mit PostgreSQL verbunden");
    client.release(); // Verbindung sofort zurückgeben!
    courseManager.loadInitialState();
  })
  .catch(err => console.error("❌ Fehler bei der DB-Verbindung:", err));

// Middleware aktivieren für JSON-Parsing und CORS
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend-URL
}));

// Authentifizierungs- und Rollen-Middleware importieren
const { authenticateToken, authorizeRole } = require('./middleware/authMiddleware');

// Route zum Ausliefern der Swagger JSON-
app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// API-Routen einbinden
// Verwaltet Kurse mit allgemeinen Infos (z. B. Titel, Beschreibung, Zeitplan)
const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

// Trainer-Routen
const trainerRoutes = require('./routes/trainerRoutes');
app.use('/api/trainer', trainerRoutes);

// Admin-Routen
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Meta-Routen
const metaRoutes = require('./routes/metaRoutes');
app.use('/api', metaRoutes);

// Buchungs-Routen
const bookingRoutes = require('./routes/bookingRoutes');
console.log("📦 bookingRoutes geladen");
app.use('/api/bookings', bookingRoutes);

//Ratings-Routen
const ratingsRouter = require('./routes/ratings'); // Die Route für Bewertungen
app.use('/api/ratings', ratingsRouter); // Alle Routen aus ratings.js unter /api/ratings

// Authentifizierungs-Routen
const authRoutes = require("./routes/authRoutes"); // Importiere die Authentifizierungsrouten
app.use("/api/auth", authRoutes); // Routen für Registrierung und Login unter /api/auth

// Swagger UI unter /api-docs bereitstellen
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const nodemailer = require('nodemailer');

// Erstelle den Nodemailer-Transporter
const transporter = nodemailer.createTransport({
  service: 'deinMailProvider', // z.B. 'gmail', 'yahoo', 'smtp.mailtrap.io' usw.
  auth: {
    user: process.env.EMAIL_USER,  // Deine E-Mail-Adresse
    pass: process.env.EMAIL_PASS,  // Dein E-Mail-Passwort
  },
});

// Beispiel für den Versand einer E-Mail
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    });
    console.log('E-Mail gesendet: ' + info.response);
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
  }
};

const http = require('http'); 
const WebSocketContext = require('./websocket/WebSocketContext'); 

// Portnummer ermitteln oder auf den Standardwert setzen
const PORT = process.env.PORT || 5000;

// 1. Erstelle einen HTTP-Server, der die Express-App verwendet
const server = http.createServer(app);

// 2. Initialisiere Socket.IO und lade die aktive Strategie
// Dies übergibt den HTTP-Server an den WebSocket-Kontext
WebSocketContext.init(server); 

// 3. Starte den gemeinsamen HTTP/WebSocket-Server
server.listen(PORT, () => { 
  console.log(`[HTTP/WS] Server läuft auf Port ${PORT}`);
  console.log(`Swagger-Dokumentation läuft unter http://localhost:${PORT}/api-docs`);
});

module.exports = { app, pool, courseManager };

