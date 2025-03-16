// filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\work-schedule-app\backend\src\routes\auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Import your database connection
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).send({ error: 'Username and password are required' });
    }

    // Query the database to find the user by username
    const [rows] = await db.query('SELECT * FROM Credentials WHERE Username = ?', [username]);

    if (rows.length === 0) {
      return res.status(400).send({ error: 'Invalid username or password' });
    }

    const user = rows[0]; // Get the user record from the query result

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.Password_Hash);
    if (!isPasswordValid) {
      return res.status(400).send({ error: 'Invalid username or password' });
    }

    // Create a session
    req.session.userId = user.Credential_Id;

    // Send the success message to the client
    res.send({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred during login' });
  }
});

module.exports = router;