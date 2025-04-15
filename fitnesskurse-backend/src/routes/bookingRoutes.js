console.log("✅ bookingRoutes.js wird geladen");

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

// Kurs buchen (nur Kunde)
router.post('/', authenticateToken, authorizeRole(['Kunde']), bookingController.bookCourse);

// Buchung stornieren (nur Kunde)
router.delete('/:bookingId', authenticateToken, authorizeRole(['Kunde']), bookingController.cancelBooking);


module.exports = router;


