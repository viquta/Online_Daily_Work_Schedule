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

/**
 * Middleware to verify if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function isAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admin access required' });
}

/**
 * Middleware to verify if user is either an admin or manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function isAdminOrManager(req, res, next) {
  if (req.session && req.session.userId && 
     (req.session.userRole === 'admin' || req.session.userRole === 'manager')) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admin or manager access required' });
}

module.exports = {
  authenticateUser,
  isAdmin,
  isAdminOrManager
};