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

## How my goals from phase 1 had changed in phase 2
The aim for this project is to have a functioning work schedule – where a user can log in their time for
work – on a web browser that is connected to a relational database. The intended user for this project
is for a middle- to large-sized company (20 – hundreds of employees). The first dynamic aspect of the
system is a log-in function that requires a work account and password. This user account will be part of
the database. Second, is the actual work schedule where the user can log their working hours. It will be
a table that has relevant columns and rows. This table will be indirectly connected to the database. The
user interface (UI) will be responsive enough to adapt to browsers on mobile devices as well as
desktops. The overall benefit of this online work schedule for the user is that they can log in for their
working hours at any place and any device.
For the frontend, the login page will be done with Vue.js or HTML, CSS, JavaScript, and an AJAX
enabled table structure, such as jGrid or DataTables.js, will be in use. There will be custom CSS to
make the table page responsive for mobile devices, in case jGrid or DataTabels.js does not have this
feature. The user should be able to put in their data in the table without page reload. The backend will
consist of Node.js, Express.js and a relational database. Node.js will keep the workload balance and
server-side logic. Express.js will be used as a framework to make the connection between the frontend
and the database secure. The database will hold user account information, and work schedule tables.
Additionally, it should store structured data securely and should only respond to authorized backend
requests to maintain referential integrity and uphold security. Hence, MariaDB would be a good starting
choice

## License

[License information]
