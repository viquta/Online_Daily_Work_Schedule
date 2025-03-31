-- Sample test users
-- Note: In a real app, password_hash would be an actual bcrypt hash, for now, my testusers have the same password 'a'
-- I ran this in my terminal from the backend directory:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('a', 10).then(hash => console.log(hash));"
INSERT INTO users (username, password_hash, first_name, last_name) VALUES
('testuser1', '$2b$10$rXso67yrPWEWNoCER/ndIOJapipi1KNZMIS8Xpxf5DpnKrxePVN0q', 'Mary', 'Smith'),
('testuser2', '$2b$10$rXso67yrPWEWNoCER/ndIOJapipi1KNZMIS8Xpxf5DpnKrxePVN0q', 'Frans', 'Smith');

-- Sample schedules
INSERT INTO schedules (user_id, date) VALUES
(1, '2025-03-29'),
(1, '2025-03-30'),
(2, '2025-03-28'),
(2, '2025-03-29'),
(2, '2025-03-30');  

-- Sample tasks
INSERT INTO tasks (schedule_id, start_time, end_time, task_name, task_description) VALUES
(1, '09:00:00', '10:00:00', 'Morning Meeting', 'Team standup in conference room A'),
(1, '12:30:00', '13:30:00', 'Lunch', 'Lunch with client'),
(1, '15:00:00', '16:30:00', 'Project Planning', 'Quarter planning session'),
(2, '10:00:00', '11:00:00', 'Code Review', 'Review PR #423'),
(3, '11:00:00', '12:00:00', 'Client Call', 'Discuss project updates'),
(3, '14:00:00', '15:00:00', 'Design Review', 'Review new UI designs with team');