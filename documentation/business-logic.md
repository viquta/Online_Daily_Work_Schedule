
┌─────────────┐     ┌─────────────────┐     ┌───────────┐     ┌──────────┐
│  HTTP       │     │  auth.js        │     │  auth     │     │  user.js │
│  Request    │───▶│  (Routes)        │───▶│  Controller│-─▶│  (Model) │
│             │     │                 │     │           │     │          │
└─────────────┘     └─────────────────┘     └───────────┘     └──────────┘
                            │                      │                │
                            │                      │                │
                            ▼                      ▼                ▼
                    ┌─────────────┐     ┌─────────────────┐     ┌──────────┐
                    │  HTTP       │     │  Session        │     │ Database │
                    │  Response   │◀────│  Management     │◀───│ Queries  │
                    │             │     │                 │     │          │
                    └─────────────┘     └─────────────────┘     └──────────┘




┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Controllers │     │ Audit Logger│     │  Database   │
│ (Auth/Task/ │────▶│   Utility   │────▶│ (audit_log  │
│  Schedule)  │     │             │     │   table)    │
└─────────────┘     └─────────────┘     └─────────────┘

My prompt: 
    "I need to create business logic for my application.

    What is the main functionality of your application? --> user story: users should be able to login to the site, see their schedule for the month and fill in what they have done for each day. The schedule should save the data to a server that can then be opened later. The boss and admin should have access to the employee input.

    core features: Authentication: Login, password reset. Schedules: Create, update, delete, and view schedules. Users: Manage user profiles and roles. Notifications: Send reminders or alerts.

    when the user logs in, they should see rows that have the days of the month, and columns that include: day, date, status (sick, work, holiday), start-work, end-work, pause/break-time, job category, job desciption. On the same page, the user should see, to the right, the month that they are logging in for, they should be able to choose different months there, and there should also be a little tick-box that when ticked, the month is ready to be reviewed by the boss.



    i am using node.js with express.js for my mariadb as a backend. I'm thinking of using vue.js and maybe some framework for my tables as a front end"
---

### 1. **User Authentication and Authorization**

- **Login & Password Reset:**  
  Implement secure login functionality, including input validation and error handling. Support password reset workflows via email tokens or other secure methods.

- **Role-Based Access Control:**  
  - **Employees:** Can log in to view and manage their own schedules.  
  - **Boss/Admin:** Have extended permissions to view all employees’ schedules and perform administrative actions.  

---

### 2. **Schedule Management**

- **CRUD Operations:**  
  - **Create:** Employees can create daily entries for a month.  
  - **Read:** When logged in, users see a table with each day of the month.  
  - **Update/Delete:** Allow editing or removal of entries as needed.

- **Data Structure:**  
  Each schedule entry (i.e., a row in the table) should include:  
  - **Day & Date:** Auto-generated or validated input to ensure correct date formatting.  
  - **Status:** Options such as "sick," "work," "holiday."  
  - **Work Times:** Fields for start-work, end-work, and pause/break-time (with validations like ensuring break time is within working hours).  
  - **Job Details:** Job category and job description to capture the nature of the work performed.

- **Monthly View & Submission:**  
  - **Month Selection:** A dynamic UI element (likely a dropdown or calendar component) that allows the user to select the month to view/edit.  
  - **Review Toggle:** A tick-box that, when selected, flags the month as “ready for review” by the boss/admin. This should trigger additional backend validations or state changes to lock or flag the data for review.


### 3. **Backend and Frontend Integration**

- **Backend (Node.js/Express.js with MariaDB):**  
  - Design RESTful API endpoints to support all the above functionalities.  
  - Ensure robust data validations, error handling, and secure database interactions.  
  - Example endpoints might include:  
    - `POST /login` for authentication  
    - `POST /password-reset` for password management  
    - `GET/POST/PUT/DELETE /schedules` for schedule management  
    - `GET/POST/PUT/DELETE /users` for user management

- **Frontend (Vue.js with a Table Framework):**  
  - Use Vue.js to build a responsive UI that renders a dynamic table for the schedule.  
  - Consider leveraging libraries such as Vuetify or Element UI for table components, which can handle sorting, filtering, and pagination if needed.  
  - Ensure smooth integration with your RESTful endpoints for a seamless user experience.

---





----------------------------------------------------------------------
----------------------------------------------------------------------
----------------------------------------------------------------------
For later phases: //Victor
### 4. **User Management**

- **Profile Management:**  
  Create endpoints for managing user profiles (e.g., update personal details, change roles).

- **Role Assignments:**  
  Define roles (employee, boss, admin) within your data model and enforce access control accordingly.

---

### 5. **Notification System**

- **Reminders & Alerts:**  
  Implement business logic to send reminders for pending schedule entries or alerts when a month has been submitted for review. This might include email notifications or in-app alerts.

-------------------------------------------------------------------------


### 6. **Additional Considerations**

- **Data Validations:**  
  Validate data at both the frontend and backend to ensure the integrity of schedule entries (e.g., valid dates, proper work time intervals).

- **Concurrency & Consistency:**  
  Handle concurrent updates gracefully, especially when multiple roles are involved (employee updating versus admin reviewing).

- **Security:**  
  Protect sensitive data (like login credentials) and ensure that all endpoints are secured against common vulnerabilities (e.g., SQL injection, CSRF, XSS).

---


