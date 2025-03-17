const db = require('./src/config/database');

async function createTestData() {
  try {
    console.log('Creating test data...');
    
    // Create a test task
    const [taskResult] = await db.query(
      `INSERT INTO Tasks (Task_Name, Task_Category, Task_Optional_Description, Task_Status)
      VALUES (?, ?, ?, ?)`,
      ['Development', 'Software', 'Software development tasks', 'active']
    );
    console.log('Created test task with ID:', taskResult.insertId);
    
    // Update admin user role to ensure it's set to admin
    const [updateResult] = await db.query(
      `UPDATE Users SET Role = 'admin' 
       WHERE Id = (SELECT User_Id FROM Credentials WHERE Username = ?)`,
      ['admin']
    );
    console.log('Updated admin role:', updateResult.affectedRows > 0);
    
    console.log('Test data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();