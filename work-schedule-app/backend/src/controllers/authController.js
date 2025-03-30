//authController.js manages all authentication related operations such as login and logout.

const User = require('../models/user');
const { logAction } = require('../utils/auditLogger');

//grouping auth functions together in the object authController --> organisation, readability, and maintainability
const authController = {
  /**
   * Handle user login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */

  /**
   * The login function needs to "try":
      1. Wait for database queries to complete
      2. Wait for authentication verification
      3. Wait for audit logging
      4. Send response once all of these are complete 
      (catch any errors)
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Verify credentials (security checkpoint)
      const user = await User.verifyCredentials(username, password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Set user info in session (to persist info between http requests)
      req.session.userId = user.id; //unique id
      req.session.userName = `${user.firstName} ${user.lastName}`; //for display purposes
     
      // Log successful login (user.id is the unique identifier, LOGIN is a constant to indicate security type, `User ${username} logged in` is template string that contains the details of the user who logged in)
      await logAction(user.id, 'LOGIN', `User ${username} logged in`);

      //send json reponse to the client: message + user info
      res.json({ 
        message: 'Login successful', 
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        } 
      });
    } catch (error) {
      console.error('Error in login controller:', error);
      res.status(500).json({ error: 'An error occurred during login', message: error.message });
    }
  },

  /**
   * Handle user logout
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // Log the logout action
      if (req.session.userId) {
        await logAction(req.session.userId, 'LOGOUT', `User logged out`);
      }
      
      // Destroy the session
      req.session.destroy(err => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ message: 'Logout successful' });
      });
    } catch (error) {
      console.error('Error in logout controller:', error);
      res.status(500).json({ error: 'An error occurred during logout', message: error.message });
    }
  },

  /**
   * Get current user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user data
      const user = await User.findById(req.session.userId);
      if (!user) {
        // This shouldn't happen normally, but just in case
        req.session.destroy();
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.Id,
        firstName: user.firstName,
        lastName: user.lastName,

      });
    } catch (error) {
      console.error('Error in getCurrentUser controller:', error);
      res.status(500).json({ error: 'An error occurred while fetching user data', message: error.message });
    }
  }
};

module.exports = authController;