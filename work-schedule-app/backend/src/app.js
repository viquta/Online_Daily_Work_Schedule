// filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\work-schedule-app\backend\src\app.js

const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/scheduleRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to work with credentials
app.use(cors({
  origin: 'http://localhost:5173', // Your Vue frontend URL (adjust as needed)
  credentials: true  // This is crucial for cookies to work
}));

// Update your session configuration
app.use(session({
  secret: 'your-secret-key', // Use a strong random secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Add this before your routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Session data:', req.session);
  next();
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tasks', taskRoutes);

// Add this right before the 404 handler
app.get('/test', (req, res) => {
  res.json({ message: 'Basic test route working!' });
});

// Add this near your existing test route
app.post('/test-post', (req, res) => {
  res.json({ message: 'Post test working!', body: req.body });
});

// Add this before your 404 handler
app.get('/debug/session', (req, res) => {
  res.json({ 
    session: {
      userId: req.session.userId,
      userRole: req.session.userRole
    }
  });
});

// Catch 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For testing purposes
module.exports = app;