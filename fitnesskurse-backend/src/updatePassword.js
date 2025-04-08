const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: process.env.DB_PORT,
});

const email = 'julian@example.com';
const newPassword = '123456';  // Klartext-Passwort, das gespeichert werden soll

async function updatePassword() {
    try {
        // Passwort direkt in der DB aktualisieren (ohne bcrypt)
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [newPassword, email]
        );
        console.log('Passwort wurde erfolgreich aktualisiert.');
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Passworts:', error.message);
    }
}

updatePassword();

