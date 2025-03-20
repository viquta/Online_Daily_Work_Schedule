const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication middleware to specific routes instead of all at once
// router.use(authenticateUser); // <-- This is causing the error

// Schedule routes
router.post('/', authenticateUser, scheduleController.createSchedule);
router.get('/', authenticateUser, scheduleController.getUserSchedules);
router.get('/:id', authenticateUser, scheduleController.getScheduleById);
router.put('/:id', authenticateUser, scheduleController.updateSchedule);
router.delete('/:id', authenticateUser, scheduleController.deleteSchedule);

// Task management routes
router.post('/:id/tasks', authenticateUser, scheduleController.addTaskToSchedule);
router.put('/:scheduleId/tasks/:taskId', authenticateUser, scheduleController.updateScheduleTask);
router.delete('/:scheduleId/tasks/:taskId', authenticateUser, scheduleController.removeTaskFromSchedule);

// Mark month as ready for review
router.post('/mark-month-ready', authenticateUser, scheduleController.markMonthAsReady);

module.exports = router;