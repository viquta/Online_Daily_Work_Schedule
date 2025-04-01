const Schedule = require('../models/schedule'); // Import the Schedule model - models handle data logic and database interactions while controllers handle the request and response logic
const { logAction } = require('../utils/auditLogger');

const scheduleController = {
  /**
   * Create a new schedule entry for a specific date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSchedule(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const { date } = req.body;
      
      if (!date) {
        return res.status(400).json({ error: 'Missing required field: date is required' });
      }

      // Create schedule
      const schedule = await Schedule.createSchedule({ userId, date });
      
      // Log the action
      await logAction(userId, 'CREATE_SCHEDULE', `Created schedule for date ${date}`);
      
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Error in createSchedule controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Get schedule for a specific date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getScheduleByDate(req, res) {
    try {
      const { date } = req.params;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }
      
      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }
      
      const schedule = await Schedule.getScheduleByUserAndDate(userId, date);
      
      if (!schedule) {
        return res.status(404).json({ error: 'No schedule found for this date' });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error('Error getting schedule by date:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Add a task to an existing schedule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addTaskToSchedule(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const scheduleId = req.params.scheduleId;
      
      // Task data validation
      const { startTime, endTime, taskName, taskDescription } = req.body;
      
      if (!startTime || !endTime || !taskName) {
        return res.status(400).json({ 
          error: 'Missing required fields: startTime, endTime, and taskName are required' 
        });
      }
      
      // Add task to schedule
      const task = await Schedule.addTaskToSchedule(scheduleId, {
        startTime,
        endTime,
        taskName,
        taskDescription
      });
      
      // Log the action
      await logAction(userId, 'ADD_TASK', `Added task to schedule ${scheduleId}`);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error in addTaskToSchedule controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Remove a task from a schedule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeTask(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const taskId = req.params.taskId;
      
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
      
      await Schedule.removeTask(taskId);
      
      // Log the action
      await logAction(userId, 'REMOVE_TASK', `Removed task ${taskId}`);
      
      res.json({ message: 'Task removed successfully' });
    } catch (error) {
      console.error('Error in removeTask controller:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};

module.exports = scheduleController; //nodejs module system
// Export the scheduleController object