const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authenticateToken, authorizeRole(['Admin', 'Trainer']), courseController.createCourse);
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Trainer']), courseController.updateCourse);
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'Trainer']), courseController.deleteCourse);

module.exports = router;

