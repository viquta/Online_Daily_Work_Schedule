const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { isAuthenticated, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(isAuthenticated);

// Task routes
router.post('/', isAdminOrManager, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', isAdminOrManager, taskController.updateTask);
router.delete('/:id', isAdmin, taskController.deleteTask);

module.exports = router;