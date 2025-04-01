


graph TD
    A[Schedule.vue Component] --> B[api.js Service]
    B -->|HTTP Requests| --> C[Backend Routes]
    C --> D[Schedule Controller]
    D --> E[Schedule Model]
    E -->|SQL Queries| F[MySQL Database]
    F -->|Results| E
    E -->|Response Data| D
    D -->|JSON Response| C
    C -->|HTTP Response| B
    B -->|Processed Data| A




    User selects a date in UI
↓
fetchDailySchedule() in Schedule.vue is called
↓
api.scheduleApi.getSchedulesByDate(formattedDate) in api.js
↓
GET /api/schedules/date/:date HTTP request
↓
scheduleRoutes.js routes request to scheduleController.getSchedulesByDate
↓
scheduleController calls Schedule.getSchedulesByUserAndDate(userId, date)
↓
Model performs SQL query: SELECT s.*, t.* FROM schedules s LEFT JOIN tasks t...
↓
Database returns schedule + task records
↓
Model formats data into nested structure (schedules with tasks arrays)
↓
Data flows back through controller → routes → API → Schedule.vue
↓
Schedule.vue processes data and displays in UI





User clicks "Add New Task"
↓
addNewTask() in Schedule.vue is called
↓
First checks if schedule exists via api.scheduleApi.getSchedules({date})
↓
If no schedule, creates one via api.scheduleApi.createSchedule(...)
↓
Calls api.scheduleApi.addTaskToSchedule(scheduleId, taskData)
↓
POST /api/schedules/:id/tasks HTTP request
↓
scheduleRoutes.js routes to scheduleController.addTaskToSchedule
↓
Controller calls Schedule.addTaskToSchedule(scheduleId, taskData)
↓
Model performs SQL INSERT into tasks table
↓
Response flows back to frontend
↓
Schedule.vue calls fetchDailySchedule() to refresh the UI






User clicks "Delete" button for a task
↓
deleteTask() in Schedule.vue is called after confirmation
↓
Calls api.scheduleApi.removeTaskFromSchedule(scheduleId, taskId)
↓
DELETE /api/schedules/:scheduleId/tasks/:taskId HTTP request
↓
scheduleRoutes.js routes to scheduleController.removeTaskFromSchedule
↓
Controller calls Schedule.removeTaskFromSchedule(scheduleId, taskId)
↓
Model performs SQL DELETE from tasks table
↓
Response flows back to frontend
↓
Schedule.vue calls fetchDailySchedule() to refresh the UI

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

