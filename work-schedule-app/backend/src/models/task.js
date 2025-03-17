const db = require('../config/database');

const Task = {
  /**
   * Create a new task
   * @param {Object} taskData - The task data
   * @returns {Promise<Object>} - The created task
   */
  async createTask(taskData) {
    try {
      const { taskName, taskCategory, taskDescription, taskStatus } = taskData;
      
      // Validate required fields
      if (!taskName) {
        throw new Error('Task name is required');
      }

      const [result] = await db.query(
        `INSERT INTO Tasks 
        (Task_Name, Task_Category, Task_Optional_Description, Task_Status) 
        VALUES (?, ?, ?, ?)`,
        [taskName, taskCategory, taskDescription, taskStatus]
      );

      return {
        id: result.insertId,
        ...taskData
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Get all tasks
   * @returns {Promise<Array>} - List of tasks
   */
  async getAllTasks() {
    try {
      const [tasks] = await db.query('SELECT * FROM Tasks');
      return tasks;
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw error;
    }
  },

  /**
   * Get a task by ID
   * @param {number} taskId - The task ID
   * @returns {Promise<Object>} - The task details
   */
  async getTaskById(taskId) {
    try {
      const [tasks] = await db.query('SELECT * FROM Tasks WHERE Task_Id = ?', [taskId]);
      
      if (tasks.length === 0) {
        throw new Error('Task not found');
      }
      
      return tasks[0];
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  },

  /**
   * Update a task
   * @param {number} taskId - The task ID
   * @param {Object} taskData - The updated task data
   * @returns {Promise<Object>} - The updated task
   */
  async updateTask(taskId, taskData) {
    try {
      const { taskName, taskCategory, taskDescription, taskStatus } = taskData;
      
      // Build the update query dynamically based on provided fields
      const updates = [];
      const params = [];

      if (taskName !== undefined) { updates.push('Task_Name = ?'); params.push(taskName); }
      if (taskCategory !== undefined) { updates.push('Task_Category = ?'); params.push(taskCategory); }
      if (taskDescription !== undefined) { updates.push('Task_Optional_Description = ?'); params.push(taskDescription); }
      if (taskStatus !== undefined) { updates.push('Task_Status = ?'); params.push(taskStatus); }
      
      if (updates.length === 0) {
        throw new Error('No fields provided for update');
      }
      
      params.push(taskId);

      const [result] = await db.query(
        `UPDATE Tasks SET ${updates.join(', ')} WHERE Task_Id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        throw new Error('Task not found or no changes made');
      }

      return {
        id: taskId,
        ...taskData
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  /**
   * Delete a task
   * @param {number} taskId - The task ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async deleteTask(taskId) {
    try {
      const [result] = await db.query('DELETE FROM Tasks WHERE Task_Id = ?', [taskId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Task not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

module.exports = Task;