const db = require('../config/database');

const Schedule = {
  /**
   * Create a new work schedule entry
   * @param {Object} scheduleData - The schedule data
   * @returns {Promise<Object>} - The created schedule
   */
  async createSchedule(scheduleData) {
    try {
      const { 
        userId, 
        taskId, 
        weekNr, 
        month, 
        date, 
        startTime, 
        endTime, 
        breakTime, 
        isReadyForReview = false 
      } = scheduleData;

      // Validate required fields
      if (!userId || !taskId || !date) {
        throw new Error('Missing required fields: userId, taskId, and date are required');
      }

      const [result] = await db.query(
        `INSERT INTO Work_Schedule 
        (User_Id, Task_Id, WeekNr, Month, Date, Start_Time, End_Time, Break_Time, isReadyForReview) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, taskId, weekNr, month, date, startTime, endTime, breakTime, isReadyForReview]
      );

      return {
        id: result.insertId,
        ...scheduleData
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  /**
   * Get all schedules for a specific user
   * @param {number} userId - The user ID
   * @param {string} month - Optional month filter in YYYY-MM format
   * @returns {Promise<Array>} - List of schedules
   */
  async getSchedulesByUser(userId, month = null) {
    try {
      let query = `
        SELECT ws.*, t.Task_Name, t.Task_Category, t.Task_Optional_Description 
        FROM Work_Schedule ws
        JOIN Tasks t ON ws.Task_Id = t.Task_Id
        WHERE ws.User_Id = ?
      `;
      
      const params = [userId];
      
      if (month) {
        query += ' AND ws.Month = ?';
        params.push(month);
      }
      
      const [schedules] = await db.query(query, params);
      return schedules;
    } catch (error) {
      console.error('Error getting schedules by user:', error);
      throw error;
    }
  },

  /**
   * Update an existing work schedule entry
   * @param {number} scheduleId - The schedule ID
   * @param {Object} scheduleData - The updated schedule data
   * @returns {Promise<Object>} - The updated schedule
   */
  async updateSchedule(scheduleId, scheduleData) {
    try {
      // Extract data for update
      const { 
        taskId, 
        weekNr, 
        month, 
        date, 
        startTime, 
        endTime, 
        breakTime, 
        isReadyForReview 
      } = scheduleData;

      // Build the update query dynamically based on provided fields
      const updates = [];
      const params = [];

      if (taskId !== undefined) { updates.push('Task_Id = ?'); params.push(taskId); }
      if (weekNr !== undefined) { updates.push('WeekNr = ?'); params.push(weekNr); }
      if (month !== undefined) { updates.push('Month = ?'); params.push(month); }
      if (date !== undefined) { updates.push('Date = ?'); params.push(date); }
      if (startTime !== undefined) { updates.push('Start_Time = ?'); params.push(startTime); }
      if (endTime !== undefined) { updates.push('End_Time = ?'); params.push(endTime); }
      if (breakTime !== undefined) { updates.push('Break_Time = ?'); params.push(breakTime); }
      if (isReadyForReview !== undefined) { updates.push('isReadyForReview = ?'); params.push(isReadyForReview); }

      if (updates.length === 0) {
        throw new Error('No fields provided for update');
      }

      // Add the ID parameter
      params.push(scheduleId);

      const [result] = await db.query(
        `UPDATE Work_Schedule SET ${updates.join(', ')} WHERE WS_Id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        throw new Error('Schedule not found or no changes made');
      }

      return {
        id: scheduleId,
        ...scheduleData
      };
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  /**
   * Delete a work schedule entry
   * @param {number} scheduleId - The schedule ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async deleteSchedule(scheduleId) {
    try {
      const [result] = await db.query(
        'DELETE FROM Work_Schedule WHERE WS_Id = ?',
        [scheduleId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Schedule not found');
      }

      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  /**
   * Get a specific schedule by ID with task details
   * @param {number} scheduleId - The schedule ID
   * @returns {Promise<Object>} - The schedule details
   */
  async getScheduleById(scheduleId) {
    try {
      const [schedules] = await db.query(
        `SELECT ws.*, t.Task_Name, t.Task_Category, t.Task_Optional_Description 
         FROM Work_Schedule ws
         JOIN Tasks t ON ws.Task_Id = t.Task_Id
         WHERE ws.WS_Id = ?`,
        [scheduleId]
      );

      if (schedules.length === 0) {
        throw new Error('Schedule not found');
      }

      return schedules[0];
    } catch (error) {
      console.error('Error getting schedule by ID:', error);
      throw error;
    }
  }
};

module.exports = Schedule;