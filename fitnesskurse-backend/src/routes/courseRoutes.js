const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); 


// Route zum Exportieren der Kurse als CSV
router.get('/export/courses', authenticateToken, courseController.exportCourses);
// Weitere Routen
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Trainer']), courseController.createCourse);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Trainer']), courseController.updateCourse);
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'Trainer']), courseController.deleteCourse);

module.exports = router;

