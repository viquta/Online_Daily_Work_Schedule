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
        `SELECT c.*, u.* 
         FROM Credentials c
         JOIN Users u ON c.User_Id = u.Id
         WHERE c.Username = ?`, //does this query make sql injections possible?
        [username]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  },

  /**
   * Find a user by ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} - The user object
   */
  async findById(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM Users WHERE Id = ?', [userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new user with credentials
   * @param {Object} userData - The user data
   * @returns {Promise<Object>} - The created user
   */
  async createUser(userData) {
    /**
     * This function creates a new user with credentials.
     * However, it is not needed for this version of the application.
     */
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert user data
      const { firstName, lastName, role = 'employee', status = 'working', username, password } = userData;
      
      // Validate required fields
      if (!firstName || !lastName || !username || !password) {
        throw new Error('Missing required fields');
      }

      const [userResult] = await connection.query(
        'INSERT INTO Users (First_Name, Last_Name, Role, Status) VALUES (?, ?, ?, ?)',
        [firstName, lastName, role, status]
      );
      
      const userId = userResult.insertId;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert credentials
      await connection.query(
        'INSERT INTO Credentials (User_Id, Username, Password_Hash) VALUES (?, ?, ?)',
        [userId, username, hashedPassword]
      );
      
      await connection.commit();
      
      return {
        id: userId,
        firstName,
        lastName,
        role,
        status,
        username
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error creating user:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Verify user credentials
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Promise<Object|null>} - The user object if credentials are valid, null otherwise
   */
  async verifyCredentials(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) return null;
      
      const isPasswordValid = await bcrypt.compare(password, user.Password_Hash);
      if (!isPasswordValid) return null;
      
      return {
        id: user.Id,
        firstName: user.First_Name,
        lastName: user.Last_Name,
        role: user.Role,
        status: user.Status
      };
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  },

  /**
   * Update user information
   * @param {number} userId - The user ID
   * @param {Object} userData - The updated user data
   * @returns {Promise<Object>} - The updated user
   */
  async updateUser(userId, userData) {
    try {
      const { firstName, lastName, role, status } = userData;
      
      // Build the update query dynamically based on provided fields
      const updates = [];
      const params = [];

      if (firstName !== undefined) { updates.push('First_Name = ?'); params.push(firstName); }
      if (lastName !== undefined) { updates.push('Last_Name = ?'); params.push(lastName); }
      if (role !== undefined) { updates.push('Role = ?'); params.push(role); }
      if (status !== undefined) { updates.push('Status = ?'); params.push(status); }
      
      if (updates.length === 0) {
        throw new Error('No fields provided for update');
      }
      
      params.push(userId);

      const [result] = await db.query(
        `UPDATE Users SET ${updates.join(', ')} WHERE Id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found or no changes made');
      }

      return {
        id: userId,
        ...userData
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

module.exports = User;