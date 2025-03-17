const Schedule = require('../models/schedule');
const { logAction } = require('../utils/auditLogger');

const scheduleController = {
  /**
   * Create a new schedule entry
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

      // Create schedule data
      const scheduleData = {
        userId,
        ...req.body
      };

      // Validate data
      if (!scheduleData.taskId || !scheduleData.date) {
        return res.status(400).json({ error: 'Missing required fields: taskId and date are required' });
      }

      // If month is not provided, extract it from the date
      if (!scheduleData.month && scheduleData.date) {
        const dateObj = new Date(scheduleData.date);
        scheduleData.month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      }

      const schedule = await Schedule.createSchedule(scheduleData);
      
      // Log the action
      await logAction(userId, 'CREATE_SCHEDULE', `Created schedule entry for date ${scheduleData.date}`);
      
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Error in createSchedule controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Get schedules for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserSchedules(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      // Get optional month filter from query
      const { month } = req.query;
      
      const schedules = await Schedule.getSchedulesByUser(userId, month);
      res.json(schedules);
    } catch (error) {
      console.error('Error in getUserSchedules controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Get a specific schedule by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getScheduleById(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const scheduleId = req.params.id;
      const schedule = await Schedule.getScheduleById(scheduleId);
      
      // Check if the schedule belongs to the authenticated user or user is admin
      if (schedule.User_Id !== userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this schedule' });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error('Error in getScheduleById controller:', error);
      if (error.message === 'Schedule not found') {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Update a schedule entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSchedule(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const scheduleId = req.params.id;
      
      // First check if the schedule exists and belongs to the user
      const existingSchedule = await Schedule.getScheduleById(scheduleId);
      
      // Check if the schedule belongs to the authenticated user or user is admin
      if (existingSchedule.User_Id !== userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update this schedule' });
      }
      
      const updatedSchedule = await Schedule.updateSchedule(scheduleId, req.body);
      
      // Log the action
      await logAction(userId, 'UPDATE_SCHEDULE', `Updated schedule entry ${scheduleId}`);
      
      res.json(updatedSchedule);
    } catch (error) {
      console.error('Error in updateSchedule controller:', error);
      if (error.message === 'Schedule not found') {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Delete a schedule entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSchedule(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const scheduleId = req.params.id;
      
      // First check if the schedule exists and belongs to the user
      const existingSchedule = await Schedule.getScheduleById(scheduleId);
      
      // Check if the schedule belongs to the authenticated user or user is admin
      if (existingSchedule.User_Id !== userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this schedule' });
      }
      
      await Schedule.deleteSchedule(scheduleId);
      
      // Log the action
      await logAction(userId, 'DELETE_SCHEDULE', `Deleted schedule entry ${scheduleId}`);
      
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error in deleteSchedule controller:', error);
      if (error.message === 'Schedule not found') {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },
  
  /**
   * Mark a month's schedules as ready for review
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markMonthAsReady(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const { month } = req.body;
      
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required (format: YYYY-MM)' });
      }
      
      // Get all schedules for the user and month
      const schedules = await Schedule.getSchedulesByUser(userId, month);
      
      // Update each schedule
      const updatePromises = schedules.map(schedule => 
        Schedule.updateSchedule(schedule.WS_Id, { isReadyForReview: true })
      );
      
      await Promise.all(updatePromises);
      
      // Log the action
      await logAction(userId, 'MARK_MONTH_READY', `Marked month ${month} as ready for review`);
      
      res.json({ message: `Month ${month} marked as ready for review`, count: schedules.length });
    } catch (error) {
      console.error('Error in markMonthAsReady controller:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};

module.exports = scheduleController;