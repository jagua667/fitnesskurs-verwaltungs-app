require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(client => {
        console.log("✅ Verbindung erfolgreich!");
        return client.query('SELECT NOW()')
            .then(res => {
                console.log("🕒 Aktuelle Zeit:", res.rows[0]);
                client.release();
            });
    })
    .catch(err => console.error("❌ Verbindung fehlgeschlagen:", err));

