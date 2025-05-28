console.log("✅ bookingRoutes.js wird geladen");

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

// Gebuchte Kurse holen
router.get("/my", authenticateToken, bookingController.getUserBookings);

// Kurs buchen (nur Kunde)
router.post('/', authenticateToken, authorizeRole(['kunde']), bookingController.bookCourse);

// Buchung stornieren (nur Kunde)
router.delete('/:bookingId', authenticateToken, authorizeRole(['kunde']), bookingController.cancelBooking);


module.exports = router;


