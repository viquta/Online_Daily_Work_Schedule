const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Schedule routes
router.post('/', scheduleController.createSchedule);
router.get('/', scheduleController.getUserSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

// Task management routes
router.post('/:id/tasks', scheduleController.addTaskToSchedule);
router.put('/:scheduleId/tasks/:taskId', scheduleController.updateScheduleTask);
router.delete('/:scheduleId/tasks/:taskId', scheduleController.removeTaskFromSchedule);

// Mark month as ready for review
router.post('/mark-month-ready', scheduleController.markMonthAsReady);

module.exports = router;