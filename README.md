# Online Daily Work Schedule

A simple page application that uses Vue for managing work schedules efficiently.

## Project Overview

This is my third iteration at creating an online work scheduling system. The first attempt lacked a proper gitignore file, and in the second attempt, I wanted too many features (so I got lost in the process). In this third attmempt, I managed to create a simple yet reliable daily schedule for individual users. The server is by default setup to manage up to 10 users but I think that this can be increased.

## Why This Project Uses a Database

  - Easy to scale up --> I used normal forms for building the datase, meaning that new tables can safely be added for additional features. (Howeve, the backend logic would need to be updated.)
  - Robust structure
  - Can store large volumes of data
    (source: Mastering Node.js Web Development : Go on a Comprehensive Journey From the Fundamentals to Advanced Web Development with Node.js)

## Features

- [Feature 1] Login and log out with encrypted password
- [Feature 2] Daily schedule view per user per date
- [Feature 3] Add and delete tasks

## Technologies Used

- **Frontend**: Vue.js 3, Bootstrap 5, Pinia, DataTables
- **Backend**: Node.js, Express.js, CORS
- **Database**: MariaDB
- **Authentication**: Express Sessions, bcrypt
- **Build Tools**: Vite

## Installation

### Option 1: Using Docker (Recommended) 

You can run the entire application stack (backend, frontend, and database) using Docker Compose. This is the recommended way to get started quickly and ensures all dependencies and versions are set up correctly.

#### Requirements
- Docker and Docker Compose installed
- No other services running on ports 3001 (backend), 4173 (frontend), or 3306 (MariaDB)

#### Project-specific details
- **Node.js version**: 22.13.1 (as specified in Dockerfiles)
- **MariaDB**: Uses the latest official image
- **Environment variables**: For the Docker setup, database credentials (host, user, password, database name) for the backend service (`js-backend`) are configured directly within the `environment:` section of the `docker-compose.yml` file. Ensure these match the credentials used by the `mariadb` service definition in the same file.

#### Build and Run

From the project root directory, run:
```bash
#mariadb, docker, and node.js should be already installed
#1
git clone https://github.com/viquta/Online_Daily_Work_Schedule.git
#2
cd Online_Daily_Work_Schedule
#3
docker compose up --build
```
This will build and start the following services:
- **js-backend** (Node.js/Express backend) on port **3001**
- **js-frontend** (Vue.js frontend) on port **4173**
- **mariadb** (database) on port **3306**

You can access the frontend at [http://localhost:4173](http://localhost:4173).

#### Special configuration
- The backend and frontend containers run as non-root users for security.
- **Automatic Database Initialization**: On the first run, Docker automatically initializes the MariaDB database. It creates the `work_schedule` database, the `work_user`, and sets the password based on the environment variables in `docker-compose.yml`. It then executes the SQL scripts found in the `./work-schedule-app/database/initdb` directory (mounted to `/docker-entrypoint-initdb.d` inside the container). This includes creating the necessary tables (`00-schema.sql`) and inserting a demo user (`01-init-user.sql` - username: `testuser1`, password: `a`).
- Database data is persisted in a Docker volume (`mariadb_data`).

#### Ports
- **Frontend**: 4173
- **Backend**: 3001
- **Database**: 3306

### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/viquta/Online_Daily_Work_Schedule.git

# Navigate to the project directory
cd Online_Daily_Work_Schedule # Adjust if your top-level directory name is different

# Install backend dependencies
cd work-schedule-app/backend
npm install

# Install frontend dependencies
cd ../../work-schedule-frontend-new
npm install
# probably install vue-router also (i had to do this with my linux)

# Set up the database
# 1. Install MariaDB.
# 2. Create a database named 'work_schedule' and a user (e.g., 'work_user'). See the MariaDB command example below.
# 3. Manually execute the SQL scripts located in the `./work-schedule-app/database/initdb/` directory against your 'work_schedule' database in the following order:
#    - `00-schema.sql` (Creates the tables)
#    - `01-init-user.sql` (Creates the 'testuser1' demo user with password 'a')
# 4. Create a `.env` file in the root directory. Copy the example below into this file and update the values (DB_USER, DB_PASSWORD, etc.) to match your database setup.
# 5. The backend code in `work-schedule-app/backend/src/config/database.js` reads these `.env` variables.

# Start the backend
cd work-schedule-app/backend
npm start

# Start the frontend (in a new terminal)
cd work-schedule-frontend-new
npm run dev
```
How your `.env` file in `work-schedule-app/backend/` could look like:
```bash
# Database configuration for Manual Setup
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=work_schedule
DB_USER=work_user
DB_PASSWORD=yourpasswordofchoice
```


Example MariaDB commands to create the database and user:
```bash
MariaDB [(none)]> CREATE DATABASE work_schedule;
Query OK, 1 row affected (0.002 sec)

MariaDB [(none)]> CREATE USER 'work_user'@'localhost' IDENTIFIED BY 'yourpasswordofchoice';
Query OK, 0 rows affected (0.010 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON work_schedule.* TO 'work_user'@'localhost';
Query OK, 0 rows affected (0.009 sec)

MariaDB [(none)]> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.001 sec)

MariaDB [work_schedule]> -- Now connect to the work_schedule database and run the SQL scripts from ./work-schedule-app/database/initdb/
MariaDB [work_schedule]> SOURCE /path/to/your/clone/Online_Daily_Work_Schedule/work-schedule-app/database/initdb/00-schema.sql;
MariaDB [work_schedule]> SOURCE /path/to/your/clone/Online_Daily_Work_Schedule/work-schedule-app/database/initdb/01-init-user.sql;
```
And just like that, you have a running daily scheudle app on your local host!

## Usage

![App Screenshot](https://github.com/viquta/Online_Daily_WorkSchedule/blob/main/documentation/draft_phase2.pptx%20-%20PowerPoint%2002_04_2025%2010_43_13.png)

### How my goals from phase 1 had changed in phase 2

In phase 1, my vision was to create a work schedule application suitable for a middle- to large-sized company, focusing on accessibility from various devices. The core features included a login system and a work schedule table where users could log their working hours. I planned to use Vue.js for the frontend, potentially with jGrid or DataTables.js for the schedule display, and Node.js with Express.js for the backend, connected to a MariaDB database.

In phase 2, while the core goals remained the same, the scope was adjusted to focus on a reliable daily schedule for individual users. The multi-user aspect for a larger company was scaled back. I successfully implemented the login system with encrypted passwords, a daily schedule view, and the ability to add and delete tasks, all connected to a MariaDB database.

The technology stack remained largely consistent with the initial plan, utilizing Vue.js 3, Bootstrap 5, Pinia, and DataTables on the frontend, and Node.js with Express.js on the backend. Authentication was implemented using Express Sessions and bcrypt.

The main difference lies in the scale and specific features. Phase 1 envisioned a more complex system for a larger organization, while Phase 2 prioritized a streamlined, functional application for individual use. Future development could revisit the multi-user aspect and expand on the authentication system with features like password complexity requirements, accounts integrated with an Active Directory from Windows, and using MSSQL instead of MariaDB to fit in a corporate context.

## License
MIT License
