
-- ============================================================
-- SQL commands to create the tables in the database.
-- Tables: Users, Tasks, Work_Schedule, Credentials, Audit_Log.
-- ============================================================

-- Users table: Stores user information (first name, last name, role, status).
-- Tasks table: Stores task details (name, category, description, status).
-- Work_Schedule table: Stores user work schedules (user id, task id, time details).
-- Credentials table: Stores user login credentials (username, password hash).
-- Audit_Log table: Tracks user actions (action, timestamp, details).

-- ============================================================
-- Drop tables if they exist
-- ============================================================
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS Work_Schedule;
DROP TABLE IF EXISTS Credentials;
DROP TABLE IF EXISTS Audit_Log;

-- ============================================================
-- Create Users table
-- ============================================================
CREATE TABLE Users (
    Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL, -- User's first name
    Last_Name VARCHAR(50) NOT NULL,  -- User's last name
    Role VARCHAR(50),                -- User's role (e.g., admin, employee)
    Status ENUM('working', 'sick', 'holiday') NOT NULL -- User's current status
);

-- ============================================================
-- Create Tasks table
-- ============================================================
CREATE TABLE Tasks (
    Task_Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Task_Name VARCHAR(100) NOT NULL,       -- Name of the task
    Task_Category VARCHAR(50),            -- Category of the task
    Task_Optional_Description TEXT,       -- Optional description of the task
    Task_Status VARCHAR(50)               -- Task status (e.g., pending, complete)
);

-- ============================================================
-- Create Work_Schedule table
-- ============================================================
CREATE TABLE Work_Schedule (
    WS_Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    User_Id INT NOT NULL,                 -- Foreign key to Users table
    Task_Id INT NOT NULL,                 -- Foreign key to Tasks table
    WeekNr DATE,                          -- Week number
    MonthNr INT,                          -- Month number
    Month VARCHAR(50),                    -- Month name
    Start_Time TIME,                      -- Start time of the work
    End_Time TIME,                        -- End time of the work
    Break_Time TIME,                      -- Break time during work
    Date DATE,                            -- Date of the work
    FOREIGN KEY (User_Id) REFERENCES Users(Id),
    FOREIGN KEY (Task_Id) REFERENCES Tasks(Task_Id)
);

-- ============================================================
-- Create Credentials table
-- ============================================================
CREATE TABLE Credentials (
    Credential_Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    User_Id INT NOT NULL,                 -- Foreign key to Users table
    Username VARCHAR(50) NOT NULL UNIQUE, -- Unique username for login
    Password_Hash VARCHAR(255) NOT NULL,  -- Hashed password
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of creation
    FOREIGN KEY (User_Id) REFERENCES Users(Id)
);

-- ============================================================
-- Create Audit_Log table
-- ============================================================
CREATE TABLE Audit_Log (
    Log_Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    User_Id INT NULL,                     -- Foreign key to Users table
    Action VARCHAR(255) NOT NULL,         -- Action performed by the user
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the action
    Details TEXT NULL,                    -- Additional details about the action
    FOREIGN KEY (User_Id) REFERENCES Users(Id)
);

-- ============================================================
-- Select all records from tables
-- ============================================================
SELECT * FROM Users;
SELECT * FROM Tasks;
SELECT * FROM Work_Schedule;
SELECT * FROM Credentials;
SELECT * FROM Audit_Log;
