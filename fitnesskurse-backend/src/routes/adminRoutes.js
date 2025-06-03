const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 

const pool = require("../db"); // Verbindung zur PostgreSQL-Datenbank

// Route zum Ändern der Benutzerrolle (nur für Admins)
router.put("/update-role", authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { userId, newRole } = req.body;

    try {
        await pool.query("UPDATE users SET role = $1 WHERE id = $2", [newRole, userId]);
        res.json({ message: "Benutzerrolle aktualisiert" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Serverfehler" });
    }
});

router.get('/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true');
    const activeCourses = await pool.query('SELECT COUNT(*) FROM courses WHERE start_time > NOW()');
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const todaysBookings = await pool.query('SELECT COUNT(*) FROM bookings WHERE booking_date BETWEEN NOW() - INTERVAL \'24 HOURS\' AND NOW()'); 
    const avgRating = await pool.query('SELECT ROUND(AVG(rating), 1) as avg FROM reviews');

    res.json({
      // activeUsers: activeUsers.rows[0].count,
      activeCourses: activeCourses.rows[0].count,
      totalBookings: totalBookings.rows[0].count,
      todaysBookings: todaysBookings.rows[0].count,
      avgRating: avgRating.rows[0].avg || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Abrufen der Admin-Statistiken');
  }
});

module.exports = router;
