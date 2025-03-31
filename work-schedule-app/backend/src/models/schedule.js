const db = require('../config/database');

const Schedule = {
  /**
   * Create a new work schedule entry
   * @param {Object} scheduleData - The schedule data
   * @returns {Promise<Object>} - The created schedule
   */
  async createSchedule(scheduleData) {
    try {
      const { userId, date } = scheduleData;

      // Validate required fields
      if (!userId) {
        throw new Error('Missing required field: userId is required');
      }

      if (!date) {
        throw new Error('Missing required field: date is required');
      }

      const [result] = await db.query(
        `INSERT INTO schedules (user_id, date) VALUES (?, ?)`,
        [userId, date]
      );

      return {
        schedule_id: result.insertId,
        user_id: userId,
        date: date
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  /**
   * Add a task to a schedule
   * @param {number} scheduleId - The schedule ID
   * @param {Object} taskData - The task data
   * @returns {Promise<Object>} - The created task
   */
  async addTaskToSchedule(scheduleId, taskData) {
    try {
      const { 
        startTime, 
        endTime, 
        taskName, 
        taskDescription = null
      } = taskData;

      if (!startTime || !endTime || !taskName) {
        throw new Error('Missing required fields: startTime, endTime, and taskName are required');
      }

      const [result] = await db.query(
        `INSERT INTO tasks (schedule_id, start_time, end_time, task_name, task_description) 
         VALUES (?, ?, ?, ?, ?)`,
        [scheduleId, startTime, endTime, taskName, taskDescription]
      );

      return {
        task_id: result.insertId,
        schedule_id: scheduleId,
        start_time: startTime,
        end_time: endTime,
        task_name: taskName,
        task_description: taskDescription
      };
    } catch (error) {
      console.error('Error adding task to schedule:', error);
      throw error;
    }
  },

  /**
   * Remove a task from a schedule
   * @param {number} taskId - The task ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async removeTask(taskId) {
    try {
      const [result] = await db.query(
        'DELETE FROM tasks WHERE task_id = ?',
        [taskId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Task not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error removing task:', error);
      throw error;
    }
  },

  /**
   * Get schedule with tasks for a specific user and date
   * @param {number} userId - The user ID
   * @param {string} date - The date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Schedule with tasks
   */
  async getScheduleByUserAndDate(userId, date) {
    try {
      // First check if a schedule exists for this date
      const [schedules] = await db.query(
        'SELECT * FROM schedules WHERE user_id = ? AND date = ?',
        [userId, date]
      );

      if (schedules.length === 0) {
        return null; // No schedule found for this date
      }

      const schedule = schedules[0];
      
      // Get all tasks for this schedule
      const [tasks] = await db.query(
        `SELECT * FROM tasks WHERE schedule_id = ? ORDER BY start_time`,
        [schedule.schedule_id]
      );

      // Return schedule with tasks
      return {
        ...schedule,
        tasks: tasks
      };
    } catch (error) {
      console.error('Error getting schedule by user and date:', error);
      throw error;
    }
  }
};

module.exports = Schedule;