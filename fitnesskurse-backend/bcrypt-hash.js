/**
 * bcrypt-hash.js
 *
 * Dieses Skript erstellt einen bcrypt-Hash aus einem übergebenen Passwort.
 * Es wird im Terminal mit einem Passwort als Argument aufgerufen.
 * Beispiel: node bcrypt-hash.js meinPasswort123
 *
 * Der erzeugte Hash wird in der Konsole ausgegeben und kann z. B. zur Speicherung
 * in der Datenbank für die Benutzerregistrierung verwendet werden.
 */

const bcrypt = require('bcryptjs');
// Lese das Passwort aus den Kommandozeilen-Argumenten
const password = process.argv[2];
// Wenn kein Passwort übergeben wurde, zeige eine Fehlermeldung
if (!password) {
  console.error("Bitte Passwort als Argument übergeben: node bcrypt-hash.js (Passwort)");
  process.exit(1);
}
// Erzeuge einen bcrypt-Hash mit 10 Salt-Rounds
bcrypt.hash(password, 10)
  .then(hash => {
    console.log("Bcrypt Hash:", hash);
  })
  .catch(err => {
    console.error("Fehler beim Hashen:", err);
  });

