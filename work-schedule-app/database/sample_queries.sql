-- Goal 1: Authentication
-- Retrieve user by username (for login)
-- try also with testuser2
SELECT user_id, username, password_hash, first_name, last_name
FROM users
WHERE username = 'testuser';

-- Goal 2: Schedule viewing
-- Get schedule and tasks for specific date and user 
-- play around a bit with the date and user_id
SELECT s.schedule_id, s.date, t.task_id, t.start_time, t.end_time, t.task_name, t.task_description
FROM schedules s
LEFT JOIN tasks t ON s.schedule_id = t.schedule_id
WHERE s.user_id = 1 AND s.date = '2025-03-29'
ORDER BY t.start_time;

-- Check if schedule exists for date
SELECT schedule_id FROM schedules 
WHERE user_id = 1 AND date = '2025-03-29';

-- Create new schedule for date
INSERT INTO schedules (user_id, date) 
VALUES (1, '2025-03-31');

-- Get previous day's schedule
SELECT schedule_id, date FROM schedules
WHERE user_id = 1 AND date < '2025-03-29'
ORDER BY date DESC
LIMIT 1;

-- Get next day's schedule
SELECT schedule_id, date FROM schedules
WHERE user_id = 1 AND date > '2025-03-29'
ORDER BY date ASC
LIMIT 1;

-- Goal 3: Task management
-- Add new task
INSERT INTO tasks (schedule_id, start_time, end_time, task_name, task_description)
VALUES (1, '19:00:00', '22:00:00', 'Client Call', 'Discuss project timeline');

-- Delete task
DELETE FROM tasks WHERE task_id = 1;
-- the following should be deleted: (1, '09:00:00', '10:00:00', 'Morning Meeting', 'Team standup in conference room A'),