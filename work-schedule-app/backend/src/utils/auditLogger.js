const db = require('../config/database');

/**
 * Log an action performed by a user
 * @param {number} userId - The ID of the user who performed the action
 * @param {string} actionType - The type of action (e.g., 'LOGIN', 'CREATE_SCHEDULE')
 * @param {string} actionDetails - Details about the action
 * @returns {Promise<Object>} - The created log entry
 */
async function logAction(userId, actionType, actionDetails) {
  try {
    const [result] = await db.query(
      'INSERT INTO Audit_Log (User_Id, Action_Type, Action_Details, Action_Timestamp) VALUES (?, ?, ?, NOW())',
      [userId, actionType, actionDetails]
    );
    
    return {
      id: result.insertId,
      userId,
      actionType,
      actionDetails,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error logging action:', error);
    // Don't throw the error - we don't want logging failures to affect the main functionality
    return null;
  }
}

/**
 * Get audit logs, with optional filtering
 * @param {Object} options - Filter options
 * @param {number} options.userId - Filter by user ID
 * @param {string} options.actionType - Filter by action type
 * @param {Date} options.startDate - Filter by start date
 * @param {Date} options.endDate - Filter by end date
 * @param {number} options.limit - Limit the number of results
 * @returns {Promise<Array>} - Array of log entries
 */
async function getAuditLogs(options = {}) {
  try {
    const { userId, actionType, startDate, endDate, limit = 100 } = options;
    
    let query = `
      SELECT al.*, u.First_Name, u.Last_Name 
      FROM Audit_Log al
      JOIN Users u ON al.User_Id = u.Id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (userId) {
      query += ' AND al.User_Id = ?';
      params.push(userId);
    }
    
    if (actionType) {
      query += ' AND al.Action_Type = ?';
      params.push(actionType);
    }
    
    if (startDate) {
      query += ' AND al.Action_Timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND al.Action_Timestamp <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY al.Action_Timestamp DESC LIMIT ?';
    params.push(limit);
    
    const [logs] = await db.query(query, params);
    return logs;
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    throw error;
  }
}

module.exports = {
  logAction,
  getAuditLogs
};