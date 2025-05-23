// bcrypt-hash.js
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error("Bitte Passwort als Argument übergeben: node bcrypt-hash.js (Passwort)");
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log("Bcrypt Hash:", hash);
  })
  .catch(err => {
    console.error("Fehler beim Hashen:", err);
  });

