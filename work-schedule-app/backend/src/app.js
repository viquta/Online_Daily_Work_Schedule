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

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to work with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true  // This is crucial for cookies to work
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use env variable in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Only log session userId in non-production for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('Session userId:', req.session.userId || 'none');
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);

// Development-only routes
if (process.env.NODE_ENV !== 'production') {
  app.get('/test', (req, res) => {
    res.json({ message: 'Basic test route working!' });
  });
  
  app.post('/test-post', (req, res) => {
    res.json({ message: 'Post test working!', body: req.body });
  });
  
  app.get('/debug/session', (req, res) => {
    res.json({ 
      session: {
        userId: req.session.userId,
        userRole: req.session.userRole
      }
    });
  });
}

// Catch 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler middleware - should be AFTER routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For testing purposes
module.exports = app;