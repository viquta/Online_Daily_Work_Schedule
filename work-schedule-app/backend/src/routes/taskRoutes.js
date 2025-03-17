const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Please log in' });
};

// Middleware to check if user is admin or manager
const isAdminOrManager = (req, res, next) => {
  if (req.session && req.session.userRole && 
     (req.session.userRole === 'admin' || req.session.userRole === 'manager')) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admin or manager access required' });
};

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Task routes working!', userId: req.session.userId, userRole: req.session.userRole });
});

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const [tasks] = await db.query('SELECT * FROM Tasks');
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
});

// Create a new task (admin/manager only)
router.post('/', isAdminOrManager, async (req, res) => {
  try {
    const { taskName, taskCategory, taskDescription, taskStatus = 'active' } = req.body;
    
    if (!taskName) {
      return res.status(400).json({ error: 'Task name is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO Tasks (Task_Name, Task_Category, Task_Optional_Description, Task_Status) VALUES (?, ?, ?, ?)',
      [taskName, taskCategory, taskDescription, taskStatus]
    );
    
    res.status(201).json({
      id: result.insertId,
      taskName,
      taskCategory,
      taskDescription,
      taskStatus
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'An error occurred while creating the task' });
  }
});

// Get a specific task
router.get('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const [tasks] = await db.query(
      'SELECT * FROM Tasks WHERE Task_Id = ?',
      [taskId]
    );
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(tasks[0]);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'An error occurred while fetching the task' });
  }
});

// Update a task (admin/manager only)
router.put('/:id', isAdminOrManager, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { taskName, taskCategory, taskDescription, taskStatus } = req.body;
    
    // Build update query
    const updates = [];
    const params = [];

    if (taskName !== undefined) { updates.push('Task_Name = ?'); params.push(taskName); }
    if (taskCategory !== undefined) { updates.push('Task_Category = ?'); params.push(taskCategory); }
    if (taskDescription !== undefined) { updates.push('Task_Optional_Description = ?'); params.push(taskDescription); }
    if (taskStatus !== undefined) { updates.push('Task_Status = ?'); params.push(taskStatus); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
    
    params.push(taskId);
    
    const [result] = await db.query(
      `UPDATE Tasks SET ${updates.join(', ')} WHERE Task_Id = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'An error occurred while updating the task' });
  }
});

// Delete a task (admin/manager only)
router.delete('/:id', isAdminOrManager, async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Check if task is being used in any schedules
    const [schedules] = await db.query(
      'SELECT COUNT(*) as count FROM Work_Schedule WHERE Task_Id = ?',
      [taskId]
    );
    
    if (schedules[0].count > 0) {
      return res.status(400).json({ 
        error: 'Task cannot be deleted because it is used in schedules',
        scheduleCount: schedules[0].count
      });
    }
    
    const [result] = await db.query(
      'DELETE FROM Tasks WHERE Task_Id = ?',
      [taskId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'An error occurred while deleting the task' });
  }
});

// Add this to your taskRoutes.js file
router.get('/debug/schema', async (req, res) => {
  try {
    const [columns] = await db.query('SHOW COLUMNS FROM Tasks');
    res.json({ 
      columns: columns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default
      }))
    });
  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({ error: 'Error fetching schema' });
  }
});

module.exports = router;