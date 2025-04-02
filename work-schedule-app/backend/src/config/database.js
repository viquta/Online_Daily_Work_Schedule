const mysql = require('mysql2/promise'); //client for mariadb --> this one allows me to use async/await and promise channing
const dotenv = require('dotenv'); //let's me use .env
const path = require('path');  // Add this line to import the path module

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });


// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'your_db_user_name', //or 'root', but I gave the db_user all privileges to the database
  password: process.env.DB_PASSWORD || '', //password 
  database: process.env.DB_NAME || 'your_db_name',
  waitForConnections: true,
  connectionLimit: 10, //here you can probably increase it if you want more users
  queueLimit: 0,
  // Try supporting the GSSAPI authentication plugin
  authPlugins: {
    'auth_gssapi_client': () => () => Buffer.from(process.env.DB_PASSWORD || '')
  }
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
