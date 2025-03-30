// Routes (auth.js) should only define API endpoints and delegate to controllers

const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth test route is working!' });
});

// Authentication routes
router.post('/login', authController.login);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

module.exports = router;