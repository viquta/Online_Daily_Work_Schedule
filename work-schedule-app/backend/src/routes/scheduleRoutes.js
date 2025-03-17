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

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Schedule routes working!', userId: req.session.userId });
});

// Get all schedules for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Get optional month filter from query
    const { month } = req.query;
    
    let query = `
      SELECT ws.*, t.Task_Name, t.Task_Category, t.Task_Optional_Description 
      FROM Work_Schedule ws
      JOIN Tasks t ON ws.Task_Id = t.Task_Id
      WHERE ws.User_Id = ?
    `;
    
    const params = [req.session.userId];
    
    if (month) {
      query += ' AND ws.Month = ?';
      params.push(month);
    }
    
    const [schedules] = await db.query(query, params);
    res.json(schedules);
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ error: 'An error occurred while fetching schedules' });
  }
});

// Create a new schedule
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { taskId, weekNr, month, date, startTime, endTime, breakTime, isReadyForReview = false } = req.body;
    
    // Validate required fields
    if (!taskId || !date) {
      return res.status(400).json({ error: 'Task ID and date are required' });
    }

    // If month is not provided, extract it from the date
    const scheduleMonth = month || date.substring(0, 7);
    
    const [result] = await db.query(
      `INSERT INTO Work_Schedule 
      (User_Id, Task_Id, WeekNr, Month, Date, Start_Time, End_Time, Break_Time, isReadyForReview) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, taskId, weekNr, scheduleMonth, date, startTime, endTime, breakTime, isReadyForReview]
    );

    res.status(201).json({
      id: result.insertId,
      userId,
      taskId, 
      weekNr, 
      month: scheduleMonth, 
      date, 
      startTime, 
      endTime, 
      breakTime, 
      isReadyForReview
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'An error occurred while creating the schedule' });
  }
});

// Get a specific schedule
router.get('/:id', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    const [schedules] = await db.query(
      `SELECT ws.*, t.Task_Name, t.Task_Category, t.Task_Optional_Description 
       FROM Work_Schedule ws
       JOIN Tasks t ON ws.Task_Id = t.Task_Id
       WHERE ws.WS_Id = ? AND ws.User_Id = ?`,
      [scheduleId, req.session.userId]
    );
    
    if (schedules.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(schedules[0]);
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: 'An error occurred while fetching the schedule' });
  }
});

// Update a schedule
router.put('/:id', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const userId = req.session.userId;
    const { taskId, weekNr, month, date, startTime, endTime, breakTime, isReadyForReview } = req.body;
    
    // Check if schedule exists and belongs to user
    const [schedules] = await db.query(
      'SELECT * FROM Work_Schedule WHERE WS_Id = ? AND User_Id = ?',
      [scheduleId, userId]
    );
    
    if (schedules.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Build update query
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
      return res.status(400).json({ error: 'No fields provided for update' });
    }
    
    params.push(scheduleId);
    
    await db.query(
      `UPDATE Work_Schedule SET ${updates.join(', ')} WHERE WS_Id = ?`,
      params
    );
    
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'An error occurred while updating the schedule' });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const userId = req.session.userId;
    
    const [result] = await db.query(
      'DELETE FROM Work_Schedule WHERE WS_Id = ? AND User_Id = ?',
      [scheduleId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'An error occurred while deleting the schedule' });
  }
});

// Mark month as ready for review
router.post('/month/ready', async (req, res) => {
  try {
    const { month } = req.body;
    const userId = req.session.userId;
    
    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required (format: YYYY-MM)' });
    }
    
    const [result] = await db.query(
      'UPDATE Work_Schedule SET isReadyForReview = 1 WHERE User_Id = ? AND Month = ?',
      [userId, month]
    );
    
    res.json({ 
      message: `Month ${month} marked as ready for review`,
      updatedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Error marking month ready:', error);
    res.status(500).json({ error: 'An error occurred while marking the month ready for review' });
  }
});

module.exports = router;