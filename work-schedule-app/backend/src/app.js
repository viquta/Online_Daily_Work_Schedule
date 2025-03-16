// filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\work-schedule-app\backend\src\app.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;
const db = require('./config/database');

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: 'your_secure_session_secret', // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Example route to test sessions
app.get('/', (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }
  res.send(`Number of views: ${req.session.views}`);
});

// Define routes
app.use('/api', require('./routes'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;