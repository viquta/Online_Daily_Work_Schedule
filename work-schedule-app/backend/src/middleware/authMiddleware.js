/**
 * Middleware to verify if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateUser = (req, res, next) => {
  if (!req.session || !req.session.userId) { 
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
  next();
};

//other functions i could have if a company has a manager and admin role
/**
 * Middleware to verify if user is an admin
 */


/**
 * Middleware to verify if user is either an admin or manager
 */


module.exports = {
  authenticateUser,
};