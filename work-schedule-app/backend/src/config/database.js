const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', //work_user
  password: process.env.DB_PASSWORD || '', //password for work_user is 'a'
  database: process.env.DB_NAME || 'work_schedule',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connection established successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the application if unable to connect to the database
  });

module.exports = pool;