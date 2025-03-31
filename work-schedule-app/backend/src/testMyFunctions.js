const db = require('./config/database');
const User = require('./models/user'); // Import the User model
const bcrypt = require('bcrypt'); // Import bcrypt for password comparison

/*
async function testQueryFindByUsername() {
  try {
    // Test the corrected query (changed c.Username to u.username)
    const username = 'testuser2';
    console.log(`Testing query for username: ${username}`);
    
    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.password_hash,
       u.first_name, u.last_name
       FROM users u
       WHERE u.username = ?`,
      [username]
    );
    
    console.log('Query results:');
    console.log(rows);
    
    if (rows.length === 0) {
      console.log('No user found!');
    }
  } catch (error) {
    console.error('Error executing query:', error.message);
  } finally {
    // Close the database connection
    process.exit();
  }
}


testQueryFindByUsername(); //test success
*/

/*
async function testfindById() {
  try {
    const user_id = 2; 
    console.log(`Testing query for user_id: ${user_id}`);
    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.password_hash,
      u.first_name, u.last_name
      from users u
       WHERE u.user_id = ?`, [user_id]); 
      //or --> 'SELECT * FROM users WHERE user_id = ?', [userId]); //* is just me being lazy hehe

      if (!rows.length) return null; // Check if user exists --> so if it is true that the array rows is empty, return null

      console.log('Query results:');
      console.log(rows);

  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  } finally {
    process.exit();
  }
}

testfindById(); //test success
*/

/*
async function testTableStructure() {
  try {
    console.log("Checking the structure of the users table...");
    
    // This will show us the actual column names in the users table
    const [columns] = await db.query("DESCRIBE users");
    console.log("Table columns:");
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
    // Now try a simple query that doesn't use aliases
    console.log("\nTesting a simple query without aliases...");
    const [users] = await db.query("SELECT * FROM users LIMIT 1");
    console.log("First user record:", users[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

testTableStructure(); //test success
*/


//verifycredentials fx --> success!
 async function testVerifyCredentials(a, b) {
    try {
      const username = a;
      const password = b;
      const user = await User.findByUsername(username);
      if (!user){console.log('User not found!'); return null;}
      
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) return null;
      
      console.log('User credentials are valid!');
      console.log('User ID:', user.id); 
      return user.id;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    } finally {
      process.exit();
    }
 
};

testVerifyCredentials('testuser1', 'a');