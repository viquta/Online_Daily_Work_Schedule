// filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\work-schedule-app\backend\src\app.js

require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3306;
const db = require('./config/database');

app.use(express.json());

// Define routes
app.use('/api', require('./routes'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});