require('dotenv').config(); 

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { bookCourse, cancelBooking } = require('./controllers/bookingController');

console.log("🔥 Server wird gestartet!");
const app = express(); // ✅ App wird hier zuerst erstellt

// PostgreSQL-Verbindung
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
});

console.log("Geladener DB-Benutzer: ", process.env.DB_USER);
console.log("Geladenes DB-Passwort: ", process.env.DB_PASSWORD);
console.log("🚀 Starte Verbindung zur Datenbank...");

// Verbindung testen
pool.connect()
    .then(() => console.log("✅ Erfolgreich mit PostgreSQL verbunden"))
    .catch(err => console.error("❌ Fehler bei der DB-Verbindung:", err));

// Middleware
app.use(express.json());
app.use(cors());

// Authentifizierungs- und Rollen-Middleware importieren
const { authenticateToken, authorizeRole } = require('./middleware/authMiddleware');

// Fitnesskurs-Routen
const fitnessKursRoutes = require("./routes/fitnessKursRoutes");
app.use("/api/fitnesskurse", fitnessKursRoutes);

//Kurs-Routen
const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);


const bookingRoutes = require('./routes/bookingRoutes');
console.log("📦 bookingRoutes geladen"); 
app.use('/api/bookings', bookingRoutes);

//Ratings-Routen
const ratingsRouter = require('./routes/ratings'); // Die Route für Bewertungen
app.use('/api/ratings', ratingsRouter); // Alle Routen aus ratings.js unter /api/ratings

// Authentifizierungs-Routen
const authRoutes = require("./routes/authRoutes"); // Importiere die Authentifizierungsrouten
app.use("/api/auth", authRoutes); // Routen für Registrierung und Login unter /api/auth

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));

module.exports = { app, pool };

