const db = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
  /**
   * Find a user by username
   * @param {string} username - The username to search for
   * @returns {Promise<Object>} - The user object
   */
  async findByUsername(username) {
    try {
      const [rows] = await db.query( //await db.query makes an async query to the database and then it assigns the first element from the array to rows
        `SELECT u.user_id, u.username, u.password_hash,
       u.first_name, u.last_name
       FROM users u
       WHERE u.username = ?`, 
        [username]
      );
      if (!rows.length) return null;
      
      // Return user object with consistent property naming
    return {
      id: rows[0].user_id,
      username: rows[0].username,
      passwordHash: rows[0].password_hash,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
    };
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  },

  /**
   * Find a user by ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} - The user object
   * Important for session management
   */
  async findById(user_id) {
    try {
      const [rows] = await db.query(
        `SELECT u.user_id, u.username, u.password_hash,
        u.first_name, u.last_name
        from users u
         WHERE u.user_id = ?`, [user_id]); 
        //or --> 'SELECT * FROM users WHERE user_id = ?', [userId]); //* is just me being lazy hehe

        if (!rows.length) return null; // Check if user exists --> so if it is true that the array rows is empty, return null
      
        return {
          id: rows[0].user_id,
          username: rows[0].username,
          passwordHash: rows[0].password_hash,
          firstName: rows[0].first_name,
          lastName: rows[0].last_name,
        };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  /**
   * Verify user credentials
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Promise<Object|null>} - The user object if credentials are valid, null otherwise
   * login auth...
   */
  async verifyCredentials(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) return null;
      
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) return null;
      
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  },
};

module.exports = User;