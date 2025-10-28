see security page...Axios is vulnerable to DoS attack through lack of data size check (dont use for production until i fix this..)


# Online Daily Work Schedule

A simple page application that uses Vue for managing work schedules efficiently.

## Features

- [Feature 1] Login and log out with encrypted password
- [Feature 2] Daily schedule view per user per date
- [Feature 3] Add and delete tasks 


## Installation

### Option 1: Using Docker (Coming soon...)
...
### Option 2: Manual Installation
Requrements for installation:
- Node.js
- MariaDB --> make a database and remember the password for it, you will need it for the ".env" file


First clone the repository. Then navigate to the /work-schedule-app/backend folder and in the terminal write "npm install". Then go to the frontend directory (work-schedule-frontend-new) and in the terminal write "npm install". 

```bash
# Clone the repository
git clone https://github.com/viquta/Online_Daily_Work_Schedule.git

# Navigate to the project directory
cd Online_Work_Schedule_2.0

# Install backend dependencies
cd work-schedule-app/backend
npm install

# Install frontend dependencies
cd ../../work-schedule-frontend-new
npm install
# probably install vue-router also (i had to do this with my linux)
```

You will need to manually create and use the database and then run the sql scripts to create the tables. For the tables, see: /backend/database/schema.sql. For getting a database, you will need a mariadb server. Once you start mariadb, run each create table statement (from the schema.sql in the /backend/database). 

Afterwards, you can insert this demo user in your users table with this sql command: 
```bash
INSERT INTO users (username, your_password_hash, first_name, last_name) VALUES ('testuser1', '$2b$10$6kFoUDFFxLbalV0.o0Mm0OCVBIQ5nm5ImNc56WXKzgPqbY8x5FqGq' , 'Mary', 'Smith');
```

The username will be "testuser1" and the password will be "a". If you want a different password, run in the terminal from your backend directory the following command:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your_password', 10).then(hash => console.log(hash));" 
```
(more info in /backend/database/seed_data.sql, there I have some commented sql queries as examples)

Furthermore, in the root directory you will need to create a ".env" file: 
```bash
# Database configuration
DB_HOST=127.0.0.1
DB_PORT=3001
DB_NAME=work_schedule
DB_USER=your_username_for_the_database
DB_PASSWORD=your_password_for_the_database
```

How your terminal commands could look like: 

```bash
# Clone the repository
git clone https://github.com/viquta/Online_Daily_Work_Schedule.git

# Navigate to the project directory
cd Online_Work_Schedule_2.0

# Install backend dependencies
cd work-schedule-app/backend
npm install

# Install frontend dependencies
cd ../../work-schedule-frontend-new
npm install
# probably install vue-router also (i had to do this with my linux)

# Set up the database
# 1. Install MariaDB
# 2. Create a database and a user (not recommending root), also if you are having trouble with this, just watch some tutorials or google
# 3. Import or run the schema from ./database/schema.sql and uncomment + run the INSERT users for \database\seed_data.sql (more instructions in that document)
# 4. Create a `.env` file in the project root directory (`Online_Daily_Work_Schedule/`). Copy the example below into this file and update the values (DB_USER, DB_PASSWORD, etc.) to match your database setup.
# 5. Update your `work-schedule-app/backend/src/config/database.js` file if necessary (though it should read from the `.env` file by default).

# Start the backend
cd work-schedule-app/backend
npm start

# Start the frontend (in a new terminal)
cd work-schedule-frontend-new
npm run dev
```
How your .env file could look like: 
```bash
# Database configuration
DB_HOST=127.0.0.1
DB_PORT=3001
DB_NAME=work_schedule
DB_USER=your_username
DB_PASSWORD=your_password_for_the_database
```


How it can look like on the terminal to put in your database and user
```bash
MariaDB [(none)]> CREATE DATABASE work_schedule;
Query OK, 1 row affected (0.002 sec)

MariaDB [(none)]> CREATE USER 'work_user'@'localhost' IDENTIFIED BY 'yourpasswordofchoice';
Query OK, 0 rows affected (0.010 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON work_schedule.* TO 'work_user'@'localhost';FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.009 sec)

Query OK, 0 rows affected (0.001 sec)

```
And just like that, you have a running daily scheudle app on your local host! 


## Technologies Used

- **Frontend**: Vue.js 3, Bootstrap 5, Pinia, DataTables
- **Backend**: Node.js, Express.js, CORS
- **Database**: MariaDB
- **Authentication**: Express Sessions, bcrypt
- **Build Tools**: Vite

## Usage

![App Screenshot](https://github.com/viquta/Online_Daily_WorkSchedule/blob/main/documentation/draft_phase2.pptx%20-%20PowerPoint%2002_04_2025%2010_43_13.png)

### How my goals from phase 1 had changed in phase 2

In phase 1, my vision was to create a work schedule application suitable for a middle- to large-sized company, focusing on accessibility from various devices. The core features included a login system and a work schedule table where users could log their working hours. I planned to use Vue.js for the frontend, potentially with jGrid or DataTables.js for the schedule display, and Node.js with Express.js for the backend, connected to a MariaDB database.

In phase 2, while the core goals remained the same, the scope was adjusted to focus on a reliable daily schedule for individual users. The multi-user aspect for a larger company was scaled back. I successfully implemented the login system with encrypted passwords, a daily schedule view, and the ability to add and delete tasks, all connected to a MariaDB database.

The technology stack remained largely consistent with the initial plan, utilizing Vue.js 3, Bootstrap 5, Pinia, and DataTables on the frontend, and Node.js with Express.js on the backend. Authentication was implemented using Express Sessions and bcrypt.

The main difference lies in the scale and specific features. Phase 1 envisioned a more complex system for a larger organization, while Phase 2 prioritized a streamlined, functional application for individual use. Future development could revisit the multi-user aspect and expand on the authentication system with features like password complexity requirements, accounts integrated with an Active Directory from Windows, and using MSSQL instead of MariaDB to fit in a corporate context.

## License
MIT License
