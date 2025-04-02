# Online Daily Work Schedule

A simple page application that uses Vue for managing work schedules efficiently.

## Project Overview

This is my third attempt at creating an online work scheduling system. The first attempt lacked a proper gitignore file, and in the second attempt, I wanted too many features (so I got lost in the process). In this third attmempt, I managed to create a simple yet reliable daily schedule for individual users. The server is by default setup to manage up to 10 users but I think that this can be increased. 

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
- **Backend**: Node.js, Express.js
- **Database**: MariaDB
- **Authentication**: Express Sessions, bcrypt
- **Build Tools**: Vite

## Installation

### Option 1: Using Docker (Coming soon...)
...
### Option 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/viquta/Online_Daily_WorkSchedule.git

# Navigate to the project directory
cd Online_Work_Schedule_2.0

# Install backend dependencies
cd work-schedule-app/backend
npm install

# Install frontend dependencies
cd ../../work-schedule-frontend-new
npm install

# Set up the database
# 1. Install MariaDB
# 2. Create a database
# 3. Import the schema from ./database/schema.sql and uncomment + run the INSERT users for \database\seed_data.sql (instructions in the document)
# 4. Update your database.js and .env to match the user and database

# Start the backend
cd ../work-schedule-app/backend
npm start

# Start the frontend (in a new terminal)
cd ../../work-schedule-frontend-new
npm run dev
```

## Usage

[Instructions on how to use the application]

### How my goals from phase 1 had changed in phase 2

In phase 1, my vision was to create a work schedule application suitable for a middle- to large-sized company, focusing on accessibility from various devices. The core features included a login system and a work schedule table where users could log their working hours. I planned to use Vue.js for the frontend, potentially with jGrid or DataTables.js for the schedule display, and Node.js with Express.js for the backend, connected to a MariaDB database.

In phase 2, while the core goals remained the same, the scope was adjusted to focus on a reliable daily schedule for individual users. The multi-user aspect for a larger company was scaled back. I successfully implemented the login system with encrypted passwords, a daily schedule view, and the ability to add and delete tasks, all connected to a MariaDB database.

The technology stack remained largely consistent with the initial plan, utilizing Vue.js 3, Bootstrap 5, Pinia, and DataTables on the frontend, and Node.js with Express.js on the backend. Authentication was implemented using Express Sessions and bcrypt.

The main difference lies in the scale and specific features. Phase 1 envisioned a more complex system for a larger organization, while Phase 2 prioritized a streamlined, functional application for individual use. Future development could revisit the multi-user aspect and expand on the authentication system with features like password complexity requirements, accounts integrated with an Active Directory from Windows, and using MSSQL instead of MariaDB to fit in a corporate context.

## License
MIT License 
