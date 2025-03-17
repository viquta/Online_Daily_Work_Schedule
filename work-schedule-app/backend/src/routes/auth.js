// filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\work-schedule-app\backend\src\routes\auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Import your database connection
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth test route is working!' });
});

// Register route
router.post('/register', async (req, res) => {
  const { firstName, lastName, username, password, role = 'employee' } = req.body;

  try {
    // Validate input
    if (!firstName || !lastName || !username || !password) {
      return res.status(400).json({ error: 'First name, last name, username, and password are required' });
    }

    // Check if username already exists
    const [existingUsers] = await db.query('SELECT * FROM Credentials WHERE Username = ?', [username]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create a database connection for the transaction
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create user record
      const [userResult] = await connection.query(
        'INSERT INTO Users (First_Name, Last_Name, Role, Status) VALUES (?, ?, ?, ?)',
        [firstName, lastName, role, 'working']
      );
      
      const userId = userResult.insertId;
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create credentials record
      await connection.query(
        'INSERT INTO Credentials (User_Id, Username, Password_Hash) VALUES (?, ?, ?)',
        [userId, username, hashedPassword]
      );
      
      await connection.commit();
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: userId,
          firstName,
          lastName,
          role
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Update the login route to properly store user role in session
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Query the database to find the user by username
    const [rows] = await db.query('SELECT * FROM Credentials WHERE Username = ?', [username]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const credentials = rows[0]; // Get the credentials record

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, credentials.Password_Hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Get user details
    const [userRows] = await db.query('SELECT * FROM Users WHERE Id = ?', [credentials.User_Id]);
    
    if (userRows.length === 0) {
      return res.status(500).json({ error: 'User data not found' });
    }
    
    const userData = userRows[0];

    // Create a session
    req.session.userId = credentials.User_Id;
    req.session.userRole = userData.Role;
    
    console.log('User logged in:', { 
      id: userData.Id, 
      firstName: userData.First_Name, 
      lastName: userData.Last_Name, 
      role: userData.Role 
    });
    console.log('Session data:', { userId: req.session.userId, userRole: req.session.userRole });
    
    res.json({
      message: 'Login successful',
      user: {
        id: userData.Id,
        firstName: userData.First_Name,
        lastName: userData.Last_Name,
        role: userData.Role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;