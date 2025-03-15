// filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\work-schedule-app\backend\src\routes\index.js
//this is just a test to see if it works
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('API is working');
});

// Test route
router.get('/test', (req, res) => {
  res.send('Test successful');
});

module.exports = router;