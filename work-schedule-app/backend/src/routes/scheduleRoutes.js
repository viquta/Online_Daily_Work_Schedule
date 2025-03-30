const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication middleware to specific routes instead of all at once
// router.use(authenticateUser); // <-- This is causing the error

// Schedule routes
router.post('/', authenticateUser, scheduleController.createSchedule);
router.get('/', authenticateUser, scheduleController.getUserSchedules);
router.get('/date/:date', authenticateUser, scheduleController.getSchedulesByDate);
router.get('/:id([0-9]+)', scheduleController.getScheduleById);  // Only match numeric IDs
router.put('/:id', authenticateUser, scheduleController.updateSchedule);
router.delete('/:id', authenticateUser, scheduleController.deleteSchedule);

// Task management routes
router.post('/:id/tasks', authenticateUser, scheduleController.addTaskToSchedule);
router.put('/:scheduleId/tasks/:taskId', authenticateUser, scheduleController.updateScheduleTask);
router.delete('/:scheduleId/tasks/:taskId', authenticateUser, scheduleController.removeTaskFromSchedule);


module.exports = router;