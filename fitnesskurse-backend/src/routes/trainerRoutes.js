const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 

router.get('/courses', authenticateToken, authorizeRole(['trainer']), trainerController.getCoursesByTrainer);

module.exports = router;
