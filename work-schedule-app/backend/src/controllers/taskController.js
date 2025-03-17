const Task = require('../models/task');
const { logAction } = require('../utils/auditLogger');

const taskController = {
  /**
   * Create a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTask(req, res) {
    try {
      // Only admin or manager should be able to create tasks
      if (req.session.userRole !== 'admin' && req.session.userRole !== 'manager') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to create tasks' });
      }

      const taskData = req.body;
      
      // Validate required fields
      if (!taskData.taskName) {
        return res.status(400).json({ error: 'Task name is required' });
      }
      
      const task = await Task.createTask(taskData);
      
      // Log the action
      await logAction(req.session.userId, 'CREATE_TASK', `Created task: ${taskData.taskName}`);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error in createTask controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Get all tasks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllTasks(req, res) {
    try {
      const tasks = await Task.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error('Error in getAllTasks controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Get a task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTaskById(req, res) {
    try {
      const taskId = req.params.id;
      const task = await Task.getTaskById(taskId);
      res.json(task);
    } catch (error) {
      console.error('Error in getTaskById controller:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Update a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTask(req, res) {
    try {
      // Only admin or manager should be able to update tasks
      if (req.session.userRole !== 'admin' && req.session.userRole !== 'manager') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update tasks' });
      }

      const taskId = req.params.id;
      const taskData = req.body;
      
      const updatedTask = await Task.updateTask(taskId, taskData);
      
      // Log the action
      await logAction(req.session.userId, 'UPDATE_TASK', `Updated task: ${taskId}`);
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error in updateTask controller:', error);
      if (error.message === 'Task not found' || error.message === 'Task not found or no changes made') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Delete a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTask(req, res) {
    try {
      // Only admin should be able to delete tasks
      if (req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete tasks' });
      }

      const taskId = req.params.id;
      
      await Task.deleteTask(taskId);
      
      // Log the action
      await logAction(req.session.userId, 'DELETE_TASK', `Deleted task: ${taskId}`);
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error in deleteTask controller:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};

module.exports = taskController;