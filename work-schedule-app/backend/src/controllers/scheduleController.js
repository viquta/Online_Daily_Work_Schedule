const Schedule = require('../models/schedule');
const { logAction } = require('../utils/auditLogger');

const scheduleController = {
  /**
   * Create a new schedule entry with multiple tasks
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
      const { tasks, ...scheduleData } = req.body;
      
      // Prepare final schedule data
      const finalScheduleData = {
        userId,
        ...scheduleData,
        scheduleType: scheduleData.scheduleType || 'daily' // Default to daily if not specified
      };

      // Validate schedule data
      if (!finalScheduleData.date && finalScheduleData.scheduleType === 'daily') {
        return res.status(400).json({ error: 'Missing required field: date is required for daily schedules' });
      }

      if (!finalScheduleData.month && finalScheduleData.scheduleType === 'monthly') {
        return res.status(400).json({ error: 'Missing required field: month is required for monthly schedules' });
      }

      // If month is not provided for daily schedule, extract it from the date
      if (!finalScheduleData.month && finalScheduleData.date) {
        const dateObj = new Date(finalScheduleData.date);
        finalScheduleData.month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      }

      // Validate tasks array
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: 'At least one task is required' });
      }

      // Validate each task has the required taskId
      for (const task of tasks) {
        if (!task.taskId) {
          return res.status(400).json({ error: 'Each task must have a taskId' });
        }
      }

      // Create the schedule first
      const schedule = await Schedule.createSchedule(finalScheduleData);
      
      // Now add all tasks to the schedule
      const taskPromises = tasks.map(task => 
        Schedule.addTaskToSchedule(schedule.WS_Id, {
          taskId: task.taskId,
          description: task.description || null,
          completionPercentage: task.completionPercentage || 0,
          notes: task.notes || null
        })
      );
      
      // Wait for all tasks to be added
      const scheduleTasks = await Promise.all(taskPromises);
      
      // Prepare response with schedule and its tasks
      const result = {
        ...schedule,
        tasks: scheduleTasks
      };
      
      // Log the action
      const actionDescription = finalScheduleData.scheduleType === 'daily' 
        ? `Created daily schedule entry for date ${finalScheduleData.date}` 
        : `Created monthly schedule entry for month ${finalScheduleData.month}`;
      
      await logAction(userId, 'CREATE_SCHEDULE', actionDescription);
      
      res.status(201).json(result);
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

      // Get optional filters from query
      const { month, scheduleType } = req.query;
      
      // Get schedules with their tasks
      const schedules = await Schedule.getSchedulesByUser(userId, month, scheduleType);
      
      // For each schedule, get its tasks
      const schedulesWithTasks = await Promise.all(
        schedules.map(async (schedule) => {
          const tasks = await Schedule.getTasksByScheduleId(schedule.WS_Id);
          return { ...schedule, tasks };
        })
      );
      
      res.json(schedulesWithTasks);
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
      
      // Get tasks for this schedule
      const tasks = await Schedule.getTasksByScheduleId(scheduleId);
      
      // Combine schedule and tasks
      const result = {
        ...schedule,
        tasks
      };
      
      res.json(result);
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
      
      // Extract tasks from request body
      const { tasks, ...scheduleData } = req.body;
      
      // Update schedule data
      const updatedSchedule = await Schedule.updateSchedule(scheduleId, scheduleData);
      
      // If tasks are provided, update them
      if (tasks && Array.isArray(tasks)) {
        // Remove existing tasks
        await Schedule.removeAllTasksFromSchedule(scheduleId);
        
        // Add new tasks
        const taskPromises = tasks.map(task => 
          Schedule.addTaskToSchedule(scheduleId, {
            taskId: task.taskId,
            description: task.description || null,
            completionPercentage: task.completionPercentage || 0,
            notes: task.notes || null
          })
        );
        
        await Promise.all(taskPromises);
      }
      
      // Get the updated schedule with tasks
      const updatedTasks = await Schedule.getTasksByScheduleId(scheduleId);
      
      // Prepare response
      const result = {
        ...updatedSchedule,
        tasks: updatedTasks
      };
      
      // Log the action
      await logAction(userId, 'UPDATE_SCHEDULE', `Updated schedule entry ${scheduleId}`);
      
      res.json(result);
    } catch (error) {
      console.error('Error in updateSchedule controller:', error);
      if (error.message === 'Schedule not found') {
        return res.status(404).json({ error: 'Schedule not found' });
      }
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

      const scheduleId = req.params.id;
      
      // Check if the schedule exists and belongs to the user
      const existingSchedule = await Schedule.getScheduleById(scheduleId);
      
      if (existingSchedule.User_Id !== userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this schedule' });
      }
      
      const taskData = req.body;
      
      // Validate task data
      if (!taskData.taskId) {
        return res.status(400).json({ error: 'Missing required field: taskId' });
      }
      
      // Add task to schedule
      const scheduleTask = await Schedule.addTaskToSchedule(scheduleId, {
        taskId: taskData.taskId,
        description: taskData.description || null,
        completionPercentage: taskData.completionPercentage || 0,
        notes: taskData.notes || null
      });
      
      // Log the action
      await logAction(userId, 'ADD_TASK_TO_SCHEDULE', `Added task to schedule ${scheduleId}`);
      
      res.status(201).json(scheduleTask);
    } catch (error) {
      console.error('Error in addTaskToSchedule controller:', error);
      if (error.message === 'Schedule not found') {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Update a specific task in a schedule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateScheduleTask(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const scheduleId = req.params.scheduleId;
      const taskId = req.params.taskId;
      
      // Check if the schedule exists and belongs to the user
      const existingSchedule = await Schedule.getScheduleById(scheduleId);
      
      if (existingSchedule.User_Id !== userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this schedule' });
      }
      
      const updatedTask = await Schedule.updateScheduleTask(scheduleId, taskId, req.body);
      
      // Log the action
      await logAction(userId, 'UPDATE_SCHEDULE_TASK', `Updated task in schedule ${scheduleId}`);
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error in updateScheduleTask controller:', error);
      if (error.message === 'Schedule task not found') {
        return res.status(404).json({ error: 'Schedule task not found' });
      }
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  /**
   * Remove a task from a schedule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeTaskFromSchedule(req, res) {
    try {
      // Get user ID from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
      }

      const scheduleId = req.params.scheduleId;
      const taskId = req.params.taskId;
      
      // Check if the schedule exists and belongs to the user
      const existingSchedule = await Schedule.getScheduleById(scheduleId);
      
      if (existingSchedule.User_Id !== userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this schedule' });
      }
      
      await Schedule.removeTaskFromSchedule(scheduleId, taskId);
      
      // Log the action
      await logAction(userId, 'REMOVE_TASK_FROM_SCHEDULE', `Removed task from schedule ${scheduleId}`);
      
      res.json({ message: 'Task removed from schedule successfully' });
    } catch (error) {
      console.error('Error in removeTaskFromSchedule controller:', error);
      if (error.message === 'Schedule task not found') {
        return res.status(404).json({ error: 'Schedule task not found' });
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
      
      // No need to delete tasks separately due to ON DELETE CASCADE
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