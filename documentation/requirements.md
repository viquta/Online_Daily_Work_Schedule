# Requirements for the Online Daily Workschedule

I expect the app to do the following: 

#1 user logs in with user name and password 
#2 user sees their schedule for the day AND they can click their way to go to other days
#3 user can add or delete tasks for the schedule for that day --> tasks get saved in database



For goal nr 1: (done)
- I need hashed password mecahnism (use bcrypt)
- a session OR token so that the user can stay in their page
- user credentials that are already in the database



For goal nr 2: 
- I need to see the current schedule -->the database sends schedule for the correct date: 
        DONE: If it's the 28th March 2025, then that schedule should be there and it should show the tasks (if there are any) 
            --> task properties: hh:mm time, task name, task description
        If no schedule for this date ? --> user presses "create schedule" --> database gets a query to INSERT a new schedule for that date
        If user wishes to go to a different date ? --> clickable left and right buttons for going to next date or previous date.

For goal nr 3: 
- For the created schedule:
    - a working "add task" button --> sending an INSERT query to database
        - property of task to fill after btn "add task": hh:mm time, task name, task description  
    - a working "delete task" button --> sending a DELETE query to database



Additional goals:
- style of schedule
- mobile responsiveness
 


 Future requirements:
 For a complete authentication system:

        Password complexity requirements
        Rate limiting for login attempts
        Account locking after failed attempts
        Password reset functionality