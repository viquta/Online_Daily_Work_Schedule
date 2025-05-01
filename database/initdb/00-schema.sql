-- This SQL script creates a simple database schema for my daily work schedule application.
-- The schema includes three tables: users, schedules, and tasks.

-- Ensure we are using the correct database
USE work_schedule;

CREATE TABLE IF NOT EXISTS users ( 
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);


--schedules and users have a 1:N relationship, meaning one user can have many schedules but one schedule can only belong to one user
CREATE TABLE IF NOT EXISTS schedules ( 
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE (user_id, date)
);

--tasks and schedules have a 1:N relationship, meaning one schedule can have many tasks but one task can only belong to one schedule
--for this version of the app, only one user can have a task, multiple users cannot have the same task. If I want to allow multiple users to have the same task, I will need to create a new table to manage this relationship
CREATE TABLE IF NOT EXISTS tasks ( 
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    task_name VARCHAR(100) NOT NULL,
    task_description TEXT,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
);


-- extra table to audit logging
-- Add audit logging table
CREATE TABLE IF NOT EXISTS audit_log ( 
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


