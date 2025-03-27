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
        scheduleType = 'daily',
        weekNr, 
        month, 
        date, 
        startTime, 
        endTime, 
        breakTime, 
        isReadyForReview = false 
      } = scheduleData;

      // Validate required fields
      if (!userId) {
        throw new Error('Missing required field: userId is required');
      }

      // Validate based on schedule type
      if (scheduleType === 'daily' && !date) {
        throw new Error('Missing required field: date is required for daily schedules');
      }

      if (scheduleType === 'monthly' && !month) {
        throw new Error('Missing required field: month is required for monthly schedules');
      }

      const [result] = await db.query(
        `INSERT INTO Work_Schedule 
        (User_Id, Schedule_Type, WeekNr, Month, Date, Start_Time, End_Time, Break_Time, isReadyForReview) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, scheduleType, weekNr, month, date, startTime, endTime, breakTime, isReadyForReview]
      );

      return {
        WS_Id: result.insertId,
        User_Id: userId,
        Schedule_Type: scheduleType,
        WeekNr: weekNr,
        Month: month,
        Date: date,
        Start_Time: startTime,
        End_Time: endTime,
        Break_Time: breakTime,
        isReadyForReview
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
   * @returns {Promise<Object>} - The created schedule task
   */
  async addTaskToSchedule(scheduleId, taskData) {
    try {
      const { 
        taskId, 
        description = null, 
        completionPercentage = 0,
        notes = null 
      } = taskData;

      if (!taskId) {
        throw new Error('Missing required field: taskId is required');
      }

      const [result] = await db.query(
        `INSERT INTO Work_Schedule_Tasks 
        (WS_Id, Task_Id, Task_Description, Completion_Percentage, Notes) 
        VALUES (?, ?, ?, ?, ?)`,
        [scheduleId, taskId, description, completionPercentage, notes]
      );

      return {
        WSTID: result.insertId,
        WS_Id: scheduleId,
        Task_Id: taskId,
        Task_Description: description,
        Completion_Percentage: completionPercentage,
        Notes: notes
      };
    } catch (error) {
      console.error('Error adding task to schedule:', error);
      throw error;
    }
  },

  /**
   * Get all tasks for a specific schedule
   * @param {number} scheduleId - The schedule ID
   * @returns {Promise<Array>} - List of tasks
   */
  async getTasksByScheduleId(scheduleId) {
    try {
      const [tasks] = await db.query(
        `SELECT wst.*, t.Task_Name, t.Task_Category, t.Task_Optional_Description
         FROM Work_Schedule_Tasks wst
         JOIN Tasks t ON wst.Task_Id = t.Task_Id
         WHERE wst.WS_Id = ?`,
        [scheduleId]
      );

      return tasks;
    } catch (error) {
      console.error('Error getting tasks by schedule ID:', error);
      throw error;
    }
  },

  /**
   * Update a task in a schedule
   * @param {number} scheduleId - The schedule ID
   * @param {number} taskId - The task ID from the junction table (WSTID)
   * @param {Object} taskData - The updated task data
   * @returns {Promise<Object>} - The updated task
   */
  async updateScheduleTask(scheduleId, taskId, taskData) {
    try {
      const { 
        description, 
        completionPercentage,
        notes
      } = taskData;

      // Build the update query dynamically based on provided fields
      const updates = [];
      const params = [];

      if (description !== undefined) { updates.push('Task_Description = ?'); params.push(description); }
      if (completionPercentage !== undefined) { updates.push('Completion_Percentage = ?'); params.push(completionPercentage); }
      if (notes !== undefined) { updates.push('Notes = ?'); params.push(notes); }

      if (updates.length === 0) {
        throw new Error('No fields provided for update');
      }

      // Add the ID parameters
      params.push(scheduleId);
      params.push(taskId);

      const [result] = await db.query(
        `UPDATE Work_Schedule_Tasks SET ${updates.join(', ')} 
         WHERE WS_Id = ? AND WSTID = ?`,
        params
      );

      if (result.affectedRows === 0) {
        throw new Error('Schedule task not found or no changes made');
      }

      // Get the updated task
      const [tasks] = await db.query(
        `SELECT wst.*, t.Task_Name, t.Task_Category, t.Task_Optional_Description
         FROM Work_Schedule_Tasks wst
         JOIN Tasks t ON wst.Task_Id = t.Task_Id
         WHERE wst.WSTID = ?`,
        [taskId]
      );

      return tasks[0];
    } catch (error) {
      console.error('Error updating schedule task:', error);
      throw error;
    }
  },



  /**
   * Remove all tasks from a schedule
   * @param {number} scheduleId - The schedule ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async removeTaskFromSchedule(scheduleId, taskId) {
    try {
      // First, log what we're trying to delete
      console.log('Attempting to delete task:', {
        providedScheduleId: scheduleId,
        taskId: taskId
      });
      
      // Step 1: Check if there's a task with this WSTID in any schedule
      const [taskInfo] = await db.query(
        'SELECT WS_Id FROM Work_Schedule_Tasks WHERE WSTID = ?',
        [taskId]
      );
      
      if (taskInfo.length === 0) {
        throw new Error('Task not found in any schedule');
      }
      
      // Step 2: Use the actual schedule ID from the database
      const actualScheduleId = taskInfo[0].WS_Id;
      
      console.log(`Found task ${taskId} in schedule ${actualScheduleId} (client provided ${scheduleId})`);
      
      // Step 3: Delete the task using the correct schedule ID
      const [result] = await db.query(
        'DELETE FROM Work_Schedule_Tasks WHERE WS_Id = ? AND WSTID = ?',
        [actualScheduleId, taskId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to delete task');
      }
      
      console.log(`Successfully deleted task ${taskId} from schedule ${actualScheduleId}`);
      return true;
    } catch (error) {
      console.error('Error removing task from schedule:', error);
      throw error;
    }
  },

  /**
   * Get all schedules for a specific user
   * @param {number} userId - The user ID
   * @param {string} month - Optional month filter in YYYY-MM format
   * @param {string} scheduleType - Optional schedule type filter ('daily' or 'monthly')
   * @returns {Promise<Array>} - List of schedules
   */
  async getSchedulesByUser(userId, month = null, scheduleType = null) {
    try {
      let query = `
        SELECT * FROM Work_Schedule 
        WHERE User_Id = ?
      `;
      
      const params = [userId];
      
      if (month) {
        query += ' AND Month = ?';
        params.push(month);
      }

      if (scheduleType) {
        query += ' AND Schedule_Type = ?';
        params.push(scheduleType);
      }
      
      const [schedules] = await db.query(query, params);
      return schedules;
    } catch (error) {
      console.error('Error getting schedules by user:', error);
      throw error;
    }
  },

  /**
   * Get schedules by user and schedule type
   * @param {number} userId - The user ID
   * @param {string} scheduleType - The schedule type ('daily' or 'monthly')
   * @param {string} month - Optional month filter in YYYY-MM format
   * @returns {Promise<Array>} - List of schedules
   */
  async getSchedulesByUserAndType(userId, scheduleType, month = null) {
    try {
      let query = `
        SELECT * FROM Work_Schedule 
        WHERE User_Id = ? AND Schedule_Type = ?
      `;
      
      const params = [userId, scheduleType];
      
      if (month) {
        query += ' AND Month = ?';
        params.push(month);
      }
      
      const [schedules] = await db.query(query, params);
      return schedules;
    } catch (error) {
      console.error('Error getting schedules by user and type:', error);
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
        scheduleType,
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

      if (scheduleType !== undefined) { updates.push('Schedule_Type = ?'); params.push(scheduleType); }
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

      // Get the updated schedule
      const [schedules] = await db.query(
        'SELECT * FROM Work_Schedule WHERE WS_Id = ?',
        [scheduleId]
      );

      return schedules[0];
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
      // Tasks will be automatically deleted due to ON DELETE CASCADE
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
   * Get a specific schedule by ID
   * @param {number} scheduleId - The schedule ID
   * @returns {Promise<Object>} - The schedule details
   */
  async getScheduleById(scheduleId) {
    try {
      // Check if value exists
      if (scheduleId === undefined || scheduleId === null) {
        throw new Error('Schedule ID is required');
      }
      
      // Parse ID - simpler validation
      const id = parseInt(scheduleId, 10);
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid Schedule ID: must be a positive integer');
      }
      
      // Remove the string comparison that was causing issues
      
      const [schedules] = await db.query(
        'SELECT * FROM Work_Schedule WHERE WS_Id = ?',
        [id]
      );

      console.log('Raw query results:', schedules);
      console.log('SQL executed:', 'SELECT * FROM Work_Schedule WHERE WS_Id = ' + id);

      // Try a direct raw query to verify
      const [directCheck] = await db.query('SELECT COUNT(*) as count FROM Work_Schedule');
      console.log('Total schedules in database:', directCheck[0].count);
  
      if (!schedules || schedules.length === 0) {
        throw new Error('Schedule not found');
      }
  
      return schedules[0];
    } catch (error) {
      console.error('Error getting schedule by ID:', error);
      throw error;
    }
  },

  

  /**
   * Get schedules by user and date
   * @param {number} userId - The user ID
   * @param {string} date - The date
   * @returns {Promise<Array>} - List of schedules
   */
  async getSchedulesByUserAndDate(userId, date) {
    try {
      const [schedules] = await db.query(
        'SELECT * FROM Work_Schedule WHERE User_Id = ? AND Date = ?',
        [userId, date]
      );
      
      return schedules;
    } catch (error) {
      console.error('Error getting schedules by user and date:', error);
      throw error;
    }
  },
};

module.exports = Schedule;