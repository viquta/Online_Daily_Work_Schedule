const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Schedule routes
router.post('/', authenticateUser, scheduleController.createSchedule);
router.get('/date/:date', authenticateUser, scheduleController.getScheduleByDate);

// Task management routes
router.post('/:scheduleId/tasks', authenticateUser, scheduleController.addTaskToSchedule);
router.delete('/tasks/:taskId', authenticateUser, scheduleController.removeTask);

module.exports = router;