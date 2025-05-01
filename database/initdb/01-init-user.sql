-- filepath: /Users/victorhristov/Documents/Documents/GitHub/Online_Daily_Work_Schedule/database/initdb/01-init-user.sql

-- Ensure we are using the correct database created by environment variables
USE work_schedule;

CREATE TABLE IF NOT EXISTS users ( 
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);

-- Insert the demo user 'testuser1' with the bcrypt hash for password 'a'.
-- IMPORTANT: Replace 'YOUR_GENERATED_BCRYPT_HASH' with the actual hash.
-- Assumes your users table is named 'users' and has these columns. Adjust if necessary.
INSERT INTO users (username, password_hash, first_name, last_name)
VALUES ('testuser1', '$2b$10$xP/x6JPUz7s4KxluYIUVEuaGaZqbKNdf16JbmhphfiKFdcv6kly7G', 'Demo', 'User')
ON DUPLICATE KEY UPDATE password_hash='$2b$10$xP/x6JPUz7s4KxluYIUVEuaGaZqbKNdf16JbmhphfiKFdcv6kly7G'; 

-- Note: This script assumes the 'users' table already exists.
-- If your backend application doesn't automatically create the tables,
-- you would need to add the CREATE TABLE statements here before the INSERT.
-- Example:
-- CREATE TABLE IF NOT EXISTS users (
--   user_id INT AUTO_INCREMENT PRIMARY KEY,
--   username VARCHAR(255) UNIQUE NOT NULL,
--   password_hash VARCHAR(255) NOT NULL,
--   first_name VARCHAR(255),
--   last_name VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );