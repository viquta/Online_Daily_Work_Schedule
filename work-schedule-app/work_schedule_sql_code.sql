-- ============================================================
-- SQL commands to create the tables in the database.
-- Tables: Users, Tasks, Work_Schedule, Work_Schedule_Tasks, Credentials, Audit_Log.
-- ============================================================

-- Users table: Stores user information (first name, last name, role, status).
-- Tasks table: Stores task details (name, category, description, status).
-- Work_Schedule table: Stores user work schedules (user id, time details).
-- Work_Schedule_Tasks table: Stores tasks associated with work schedules (work schedule id, task id, task details).
-- Credentials table: Stores user login credentials (username, password hash).
-- Audit_Log table: Tracks user actions (action, timestamp, details).

-- ============================================================
-- Drop tables if they exist (note the new order to respect foreign key constraints)
-- ============================================================
DROP TABLE IF EXISTS Work_Schedule_Tasks;
DROP TABLE IF EXISTS Work_Schedule;
DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS Credentials;
DROP TABLE IF EXISTS Audit_Log;
DROP TABLE IF EXISTS Users;

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
-- Create Work_Schedule table (modified - remove Task_Id)
-- ============================================================
CREATE TABLE Work_Schedule (
    WS_Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    User_Id INT NOT NULL,                 -- Foreign key to Users table
    Schedule_Type ENUM('daily', 'monthly') DEFAULT 'daily', -- Type of schedule
    WeekNr DATE,                          -- Week number
    Month VARCHAR(7),                     -- Month in YYYY-MM format
    Date DATE,                            -- Date of the work
    Start_Time TIME,                      -- Start time of the work
    End_Time TIME,                        -- End time of the work
    Break_Time TIME,                      -- Break time during work
    isReadyForReview BOOLEAN DEFAULT FALSE, -- Indicates if the schedule is ready for review
    FOREIGN KEY (User_Id) REFERENCES Users(Id)
);

-- ============================================================
-- Create Work_Schedule_Tasks junction table (new)
-- ============================================================
CREATE TABLE Work_Schedule_Tasks (
    WSTID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    WS_Id INT NOT NULL,                    -- Foreign key to Work_Schedule table
    Task_Id INT NOT NULL,                  -- Foreign key to Tasks table
    Task_Description TEXT,                 -- Custom description for this specific task
    Completion_Percentage DECIMAL(5,2) DEFAULT 0, -- Percentage of task completed (0-100)
    Notes TEXT,                           -- Additional notes for this task
    FOREIGN KEY (WS_Id) REFERENCES Work_Schedule(WS_Id) ON DELETE CASCADE,
    FOREIGN KEY (Task_Id) REFERENCES Tasks(Task_Id) ON DELETE CASCADE
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
SELECT * FROM Work_Schedule_Tasks;
SELECT * FROM Credentials;
SELECT * FROM Audit_Log;
