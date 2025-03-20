import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Adjust if your API is at a different path
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // Important for session-based authentication
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle unauthorized errors (redirect to login)
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Schedule-related API methods
const scheduleApi = {
  // Get all schedules with optional filters
  getSchedules(filters = {}) {
    return api.get('/schedules', { params: filters });
  },
  
  // Get a specific schedule by ID
  getScheduleById(scheduleId) {
    return api.get(`/schedules/${scheduleId}`);
  },
  
  // Create a new schedule with tasks
  createSchedule(scheduleData) {
    return api.post('/schedules', scheduleData);
  },
  
  // Update an existing schedule
  updateSchedule(scheduleId, scheduleData) {
    return api.put(`/schedules/${scheduleId}`, scheduleData);
  },
  
  // Delete a schedule
  deleteSchedule(scheduleId) {
    return api.delete(`/schedules/${scheduleId}`);
  },
  
  // Add a task to a schedule
  addTaskToSchedule(scheduleId, taskData) {
    return api.post(`/schedules/${scheduleId}/tasks`, taskData);
  },
  
  // Update a task in a schedule
  updateScheduleTask(scheduleId, taskId, taskData) {
    return api.put(`/schedules/${scheduleId}/tasks/${taskId}`, taskData);
  },
  
  // Remove a task from a schedule
  removeTaskFromSchedule(scheduleId, taskId) {
    return api.delete(`/schedules/${scheduleId}/tasks/${taskId}`);
  },
  
  // Mark a month's schedules as ready for review
  markMonthAsReady(month) {
    return api.post('/schedules/mark-month-ready', { month });
  }
};

// Task-related API methods
const taskApi = {
  // Get all available tasks
  getTasks() {
    return api.get('/tasks');
  },
  
  // Get a specific task
  getTaskById(taskId) {
    return api.get(`/tasks/${taskId}`);
  }
};

// User-related API methods
const userApi = {
  // Login
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  
  // Logout
  logout() {
    return api.post('/auth/logout');
  },
  
  // Get current user
  getCurrentUser() {
    return api.get('/users/me');
  }
};

export default {
  ...scheduleApi,
  ...taskApi,
  ...userApi
};