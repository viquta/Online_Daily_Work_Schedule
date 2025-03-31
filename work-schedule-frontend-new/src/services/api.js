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
  // Get schedule by date
  getScheduleByDate(date) {
    return api.get(`/schedules/date/${date}`);
  },
  
  // Create a new schedule
  createSchedule(scheduleData) {
    return api.post('/schedules', scheduleData);
  },
  
  // Add a task to a schedule
  addTaskToSchedule(scheduleId, taskData) {
    return api.post(`/schedules/${scheduleId}/tasks`, taskData);
  },
  
  // Remove a task from a schedule
  removeTask(taskId) {
    return api.delete(`/schedules/tasks/${taskId}`);
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

// Add these Axios instance methods to your export
export default {
  scheduleApi,
  userApi,
  // Direct Axios methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config)
};