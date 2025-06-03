require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { bookCourse, cancelBooking } = require('./controllers/bookingController');

console.log("🔥 Server wird gestartet!");
const app = express(); // ✅ App wird hier zuerst erstellt

// PostgreSQL-Verbindung
const pool = require("./db");

console.log("Geladener DB-Benutzer: ", process.env.DB_USER);
console.log("Geladenes DB-Passwort: ", process.env.DB_PASSWORD);
console.log("🚀 Starte Verbindung zur Datenbank...");

// Verbindung testen
pool.connect()
  .then(client => {
    console.log("✅ Erfolgreich mit PostgreSQL verbunden");
    client.release(); // Verbindung sofort zurückgeben!
  })
  .catch(err => console.error("❌ Fehler bei der DB-Verbindung:", err));

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend-URL
}));

// Authentifizierungs- und Rollen-Middleware importieren
const { authenticateToken, authorizeRole } = require('./middleware/authMiddleware');

// Fitnesskurs-Routen (TODO: Warum haben wir sowohl fitnesscourses as auch courses? Brauchen wir beide?)
const fitnessCourseRoutes = require("./routes/fitnessCourseRoutes");
app.use("/api/fitnesscourses", fitnessCourseRoutes);

//Kurs-Routen
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

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));

module.exports = { app, pool };

