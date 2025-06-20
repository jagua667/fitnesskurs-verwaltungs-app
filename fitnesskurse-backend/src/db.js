/**
 * src/db.js
 *
 * Stellt eine Verbindung zur PostgreSQL-Datenbank über ein Connection Pool her.
 * Die Verbindungsdaten werden aus Umgebungsvariablen (.env-Datei) gelesen.
 *
 * Dieses Modul exportiert ein Pool-Objekt, das in anderen Modulen für Datenbankabfragen verwendet wird.
 *
 * Beispiel für Verwendung:
 *   const pool = require('./db');
 *   const result = await pool.query('SELECT * FROM users');
 */
require("dotenv").config();
const { Pool } = require("pg");

// Erstelle eine neue Verbindung zum PostgreSQL-Datenbankpool mit Konfiguration aus .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Exportiere das Pool-Objekt zur Wiederverwendung in der gesamten Anwendung
module.exports = pool;
