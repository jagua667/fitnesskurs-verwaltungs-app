// db/index.js

/**
 * PostgreSQL-Datenbankverbindung
 * 
 * Dieses Modul erstellt eine Verbindungspool-Instanz zur PostgreSQL-Datenbank
 * mithilfe der Umgebungsvariablen. Der Pool wird verwendet, um in der gesamten
 * Anwendung performante und wiederverwendbare Datenbankverbindungen zu ermöglichen.
 * 
 * ⚠️ WICHTIG:
 * - Stelle sicher, dass alle Umgebungsvariablen (`.env`) korrekt gesetzt sind:
 *    - DB_USER
 *    - DB_HOST
 *    - DB_NAME
 *    - DB_PASSWORD
 *    - DB_PORT
 * - Dieses Modul sollte einmalig importiert und gemeinsam genutzt werden
 *   (`Singleton Pattern`), um unnötige Verbindungsaufbauten zu vermeiden.
 */

const { Pool } = require("pg");

// Initialisierung des Verbindungspools mit Konfiguration aus .env-Datei
const pool = new Pool({
  user: process.env.DB_USER,                   // Datenbank-Benutzername
  host: process.env.DB_HOST,                   // Datenbank-Host (z. B. localhost oder remote URL)
  database: process.env.DB_NAME,               // Name der Datenbank
  password: String(process.env.DB_PASSWORD),   // Passwort (explizit in String konvertiert)
  port: process.env.DB_PORT,                   // Port der PostgreSQL-Instanz (Standard: 5432)
});

// Export des Pools zur Wiederverwendung in anderen Modulen
module.exports = pool;

