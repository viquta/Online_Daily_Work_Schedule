# Online Daily Work Schedule

An online application for managing work schedules efficiently.

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
# 3. Import the schema from ./database/schema.sql
# 4. Update your database.js and .env to match the user and database

For example:
    # Create database (after installing MariaDB)
    mysql -u root -p
    CREATE DATABASE work_schedule;
    exit;

    # Import schema
    mysql -u root -p work_schedule < ./database/schema.sql


# Start the backend
cd ../work-schedule-app/backend
npm start

# Start the frontend (in a new terminal)
cd ../../work-schedule-frontend-new
npm run dev
```


![Test connection to database](documentation\testing_and_reports\test2_database_connection.png "Test Connection to Database")

## Usage

[Instructions on how to use the application]

## Contributing

[Guidelines for contributing to the project]

## License

[License information]
