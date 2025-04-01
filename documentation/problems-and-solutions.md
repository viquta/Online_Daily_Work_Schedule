# Problems and Solutions

## Problem 1:
- **Description**: I tried to use mssql but I kept getting connectivity problems.
- **Solution**: Decided to test with MariaDB

## Problem 2: 
- **Description**: my repo was getting thousands of clutter files which slowed down my development IDE.
- **Solution**: I made a new repo and included .gitignore


## Problem 3: Installation mariadb
- **Description**: when using the app for production, you should allow remote connection. However, you'll need to set up SSL/TLS to encrypt the connection. Further, you should also configure your firewall to allow connections from trusted sources.
- **Solution**: For development purposes, I did not allow remote connections so that I can focus on building the app first. I will look into encrypted connection in later stages of the development.


## Problem 4: Connection to database
- **Description**: I had a problem connecting to the database. I tried different extensions and uninstalled the mssql extensions. Finally, it worked with the MySQL extension together with the appropriate driver.
- **Solution**: Use the MySQL extension and ensure the appropriate driver is installed. --> SQLTools + SQLTools MySQL/MariaDB/TiDB extensions


## Problem 5: Node.js database connection
- **Description**: I had a problem connecting Node.js to my database. The connection kept failing due to incorrect configuration.
- **Solution**: Resolved the issue by properly configuring the '.env' file with the correct database credentials.


## Problem 6: JWT (token) vs. Sessions
- **Description**: A secure way to connect between client and server. A JWT is stored on the client and would work great for cloud based services. However, I want my app to be locally based, so maybe creating sessions could be better than tokens...
- **Solution**: I think I will go with sessions since my app is locally based and it is not designed to scale its users in the thousands, so I think a normal server should be able to handle the session load without too big of a bottle-neck. Sessions are also easier to handle and can be securely managed in a local environment. With that said, I will probably recommend admins to run their copy of the app with a VPN, or at least use HTTPS (in either case https...). 


## Problem 7: Missing N:M Relationship Between Work Schedule and Tasks
- **Description**: The database schema needed a junction table to represent the many-to-many relationship between work schedules and tasks. A single work schedule could have multiple tasks, and tasks could be assigned to different schedules.
- **Solution**: Created a `Work_Schedule_Tasks` junction table with foreign keys to both the `Work_Schedule` and `Tasks` tables. Added additional fields like `Task_Description`, `Completion_Percentage`, and `Notes` to store instance-specific information about each task assignment.

## Problem 8: Implementing Editable DataTables
- **Description**: Needed a way for users to edit schedule information directly in the table cells without requiring separate forms for each edit.
- **Solution**: 
  - Implemented DataTables with jQuery integration:
    - Added click-to-edit functionality using DataTables and jQuery.
    - Configured input types based on column data (time inputs, text inputs).
    - Added visual feedback during editing with CSS styles.
    - Implemented keyboard shortcuts (Enter to save, Escape to cancel).
    - Connected cell edits to Pinia store for state management.

## (copy paste to pranav...) Problem 9: Frontend-Backend API Connection Issues
- **Description**: The frontend wasn't properly connecting to the backend API, resulting in failure to load tasks and save changes to schedules.
- **Solution**: Fixed the API service export to include direct Axios methods alongside the specialized API objects:
  ```javascript
  export default {
    scheduleApi,
    taskApi,
    userApi,
    // Direct Axios methods
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
  ```
## Problem 10: Missing Required Props in Component
- **Description**: The `WorkScheduleTable` component required `month` and `year` props, but these weren't provided when navigating to the route, causing Vue warnings.
- **Solution**: Added default prop values to use the current month and year when not explicitly provided:
  ```javascript
  const props = defineProps({
    month: {
      type: Number,
      default: () => new Date().getMonth() + 1
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  });
  ```

## Problem 11: No Tasks Available for Selection
- **Description**: The task dropdown was empty, preventing users from assigning tasks to schedules.
- **Solution**:
  - Fixed the API connection to correctly fetch tasks
  - Added sample task data to the database
  - Ensured proper data format for task objects

## Problem 12: Navigation and User Experience
- **Description**: Users needed a way to navigate between the dashboard and schedule editors, and clear feedback on editing capabilities.
- **Solution**:
  - Added "Back to Dashboard" buttons for navigation
  - Included visual indicators for editable cells
  - Added help text to explain editing functionality
  - Improved styling to highlight interactive elements

## Problem 13: Code Bloat
- **Description**: I realized that I had a lot of code that was not being used for my app.
- **Solution**: Performed code cleanup by identifying and removing unused functions, components, and dependencies to improve maintainability and performance.

## Problem 14: Daily Schedule API Button Issues
- **Description**: The buttons to edit, delete, and add tasks on the `/dailyschedule` route weren't responding correctly. When they did respond, I would get Axios errors.
- **Solution**:  Investigating the API connection issues. Need to check if the API endpoints are correct and if the request payload is properly formatted. Also need to verify that the backend routes are properly handling these requests.
- Creating the components diagram also helped immensely! See it here: documentation\frontendandbackend.drawio.png 
- Going back to my requirements was also a pivotal part in this journey. See it here: documentation\requirements.md





