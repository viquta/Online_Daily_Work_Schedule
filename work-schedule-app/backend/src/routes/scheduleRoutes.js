const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { isAuthenticated, isAdminOrManager } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(isAuthenticated);

// Schedule routes
router.post('/', scheduleController.createSchedule);
router.get('/', scheduleController.getUserSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.post('/month/ready', scheduleController.markMonthAsReady);

module.exports = router;