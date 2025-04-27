<!-- filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule_2.0\work-schedule-frontend-new\src\components\Schedule.vue -->
<template>
  <!-- Change from container to container-fluid on larger screens -->
  <div class="schedule-container mt-4">
    <div class="card shadow">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2>Work Schedule</h2>
        <div>
          <button 
            :class="['btn me-2', editMode ? 'btn-outline-primary' : 'btn-primary']" 
            @click="toggleEditMode"
          >
            <i :class="['bi', editMode ? 'bi-eye' : 'bi-pencil-square']"></i>
            {{ editMode ? 'View Mode' : 'Edit Mode' }}
          </button>
          <button class="btn btn-outline-danger" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
      <div class="card-body">
        <!-- Date Navigation -->
        <div class="date-navigation d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-outline-secondary" @click="goToPreviousDay">
            <i class="bi bi-chevron-left"></i> Previous Day
          </button>
          <h3 class="mb-0">{{ formattedDate }}</h3>
          <button class="btn btn-outline-secondary" @click="goToNextDay">
            Next Day <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Empty state message -->
        <div v-else-if="dailySchedule.length === 0" class="alert alert-info text-center">
          <p>No tasks scheduled for {{ formattedDate }}.</p>
          <button class="btn btn-success mt-2" @click="addNewTask">
            <i class="bi bi-plus-circle"></i> Create Schedule and Tasks
          </button>
        </div>

        <!-- View Mode -->
        <table v-else-if="!editMode" class="table table-striped table-bordered">
          <thead class="bg-light">
            <tr>
              <th style="width: 60%">Time</th>
              <th style="width: 65%">Task</th>
              <th style="width: 50%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in dailySchedule" :key="index">
              <td>{{ item.time }}</td>
              <td>{{ item.task }}</td>
              <td>
                <div class="text-truncate" style="max-width: 200px;">
                  {{ item.description }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit Mode - DataTable -->
        <DataTable 
          v-else-if="editMode && dailySchedule.length > 0"
          :options="tableOptions"
          class="display table table-striped table-bordered"
          ref="dataTable"
        />

        <!-- Button row -->
        <div class="text-center mt-4" v-if="!loading">
          <button v-if="editMode || dailySchedule.length === 0" class="btn btn-success" @click="addNewTask">
            <i class="bi bi-plus-circle"></i> Add New Task
          </button>
          <button v-if="!editMode && dailySchedule.length > 0" class="btn btn-primary" @click="toggleEditMode">
            <i class="bi bi-pencil-square"></i> Edit Schedule
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Task Add Modal -->
  <div class="modal fade" id="addTaskModal" tabindex="-1" aria-labelledby="addTaskModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addTaskModalLabel">Add New Task</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
                <label for="taskTime" class="form-label">Start Time</label>
                <input type="time" class="form-control" id="taskTime" v-model="newTask.startTime" required>
              </div>
              <div class="mb-3">
                <label for="endTime" class="form-label">End Time</label>
                <input type="time" class="form-control" id="endTime" v-model="newTask.endTime" required>
              </div>
            <div class="mb-3">
              <label for="taskName" class="form-label">Task Name</label>
              <input type="text" class="form-control" id="taskName" v-model="newTask.taskName" 
                    placeholder="Enter task name" required>
            </div>
            <div class="mb-3">
              <label for="taskDescription" class="form-label">Description (Optional)</label>
              <textarea class="form-control" id="taskDescription" v-model="newTask.taskDescription" 
                       placeholder="Enter task description" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveNewTask">Save Task</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; //responsive app...
import $ from 'jquery';
import { Modal } from 'bootstrap';

// Initialize DataTables
DataTable.use(DataTablesCore);

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const editMode = ref(false);
const selectedDate = ref(new Date());
const dailySchedule = ref([]);
const dataTable = ref(null);
const taskModal = ref(null);
const newTask = ref({
  startTime: '',
  endTime: '',
  taskName: '',
  taskDescription: ''
});

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting time:', timeString, e);
    return timeString || 'N/A';
  }
};

// Fetch schedule data from API
const fetchDailySchedule = async () => {
  loading.value = true;
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    console.log('Fetching schedule for date:', formattedDate);
    
    // Updated to use correct API method name
    const response = await api.scheduleApi.getScheduleByDate(formattedDate);
    console.log('Raw response data:', response.data);
    
    if (response.data && response.data.tasks) {
      // Process schedule with tasks
      const schedule = response.data;
      
      if (schedule.tasks && Array.isArray(schedule.tasks) && schedule.tasks.length > 0) {
        const scheduleTasks = schedule.tasks.map(task => ({
          time: `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`, // Show both times
          task: task.task_name || 'No name',
          description: task.task_description || 'No description',
          id: task.task_id,
          scheduleId: schedule.schedule_id,
          startTime: task.start_time,
          endTime: task.end_time
        }));
        
        scheduleTasks.sort((a, b) => {
          // Compare the raw start_time values which are in 24-hour format (HH:MM:SS)
          return a.startTime.localeCompare(b.startTime);
        });
        
        dailySchedule.value = scheduleTasks;
      } else {
        dailySchedule.value = [];
      }
    } else {
      dailySchedule.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch daily schedule:', error);
    dailySchedule.value = [];
  } finally {
    loading.value = false;
  }
};

// DataTable options (reactive component)
const tableOptions = computed(() => ({
  //data maps the schedule info into a format that DataTable can use
  // each item in the array is an array of values for each column
  data: dailySchedule.value.map(item => [
    item.time,
    item.task,
    item.description || '',
    `<div class="action-buttons">
      <button class="btn btn-sm btn-outline-danger btn-delete" data-task="${item.task}" data-id="${item.id}">
        <i class="bi bi-trash"></i> Delete
      </button>
    </div>`
  ]),
  columns: [
    { title: 'Time', width: '35%' },
    { title: 'Task', width: '15%' },
    { title: 'Description', width: '40%' },
    { title: 'Actions', width: '10%' }
  ],
  responsive: true, //adapt to screen size --> responsive
  dom: 'frti', // filter, processing indicator, table, information, p for pagination
  language: {
    search: 'Search:',
    lengthMenu: 'Show _MENU_ entries per page',
    info: 'Showing _START_ to _END_ of _TOTAL_ entries'
  }
}));

// Date formatting
const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// previous day function
const goToPreviousDay = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() - 1);
  selectedDate.value = newDate;
};
//next day function
const goToNextDay = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() + 1);
  selectedDate.value = newDate;
};

// Toggle between view and edit modes
const toggleEditMode = () => {
  editMode.value = !editMode.value;
  
  // Initialize DataTable event handlers when switching to edit mode
  if (editMode.value) {
    setTimeout(() => {
      $(document).off('click', '.btn-delete').on('click', '.btn-delete', function(e) {
        const taskName = $(this).attr('data-task');
        const taskId = $(this).attr('data-id');
        deleteTask(taskName, taskId);
      });
    }, 100);
  }
};

// Add new task
const addNewTask = async () => {
  // Current time for start time
  const currentTime = new Date().toTimeString().slice(0, 5);
  
  // Default end time (1 hour later)
  const [hours, minutes] = currentTime.split(':').map(Number);
  const endHour = (hours + 1) % 24;
  const defaultEndTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // Reset the form
  newTask.value = {
    startTime: currentTime,
    endTime: defaultEndTime,  // Set default but user can change
    taskName: '',
    taskDescription: ''
  };
  
  // Open the modal safely
  if (taskModal.value) {
    taskModal.value.show();
  } else {
    const modalElement = document.getElementById('addTaskModal');
    if (modalElement) {
      taskModal.value = new Modal(modalElement);
      taskModal.value.show();
    }
  }
};

// Save new task from modal
const saveNewTask = async () => {
  try {
    // Update validation to check for end time too
    if (!newTask.value.startTime || !newTask.value.endTime || !newTask.value.taskName) {
      alert('Please enter start time, end time, and task name');
      return;
    }
    
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    
    // Keep all this schedule checking logic
    let scheduleId;
    try {
      const response = await api.scheduleApi.getScheduleByDate(formattedDate);
      if (response.data && response.data.schedule_id) {
        scheduleId = response.data.schedule_id;
      }
    } catch (error) {
      console.log('No existing schedule found, will create a new one');
    }
    
    // If no existing schedule, create a new one
    if (!scheduleId) {
      const newSchedule = await api.scheduleApi.createSchedule({
        date: formattedDate
      });
      scheduleId = newSchedule.data.schedule_id;
    }
    
    // Format start time
    const [startHours, startMinutes] = newTask.value.startTime.split(':').map(Number);
    const startTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;
    
    // Format end time from user input
    const [endHours, endMinutes] = newTask.value.endTime.split(':').map(Number);
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
    
    // Use the formatted times in API call
    await api.scheduleApi.addTaskToSchedule(scheduleId, {
      taskName: newTask.value.taskName,
      startTime: startTime,
      endTime: endTime,
      taskDescription: newTask.value.taskDescription || ''
    });
    
    // Close the modal safely
    if (taskModal.value) {
      taskModal.value.hide();
    } else {
      // Fallback if modal instance isn't available
      const modalElement = document.getElementById('addTaskModal');
      if (modalElement) {
        const bsModal = Modal.getInstance(modalElement) || new Modal(modalElement);
        bsModal.hide();
      }
    }
    
    // Refresh the data
    await fetchDailySchedule();
    
  } catch (error) {
    console.error('Failed to save new task:', error);
    alert('Failed to create new task. Please try again.');
  }
};

// Delete task
const deleteTask = async (taskName, taskId) => {
  if (confirm(`Are you sure you want to delete task: ${taskName}?`)) {
    try {
      console.log('Deleting task with ID:', taskId);
      
      // Call the API to delete the task
      await api.scheduleApi.removeTask(taskId);
      
      // Refresh the data
      await fetchDailySchedule();
      
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(`Failed to delete task. Please try again.`);
    }
  }
};

// Handle user logout
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Initialize component
onMounted(() => {
  // Fetch initial data
  fetchDailySchedule();
  
  // Initialize modal properly once DOM is ready
  setTimeout(() => {
    const modalElement = document.getElementById('addTaskModal');
    if (modalElement) {
      taskModal.value = new Modal(modalElement);
    }
  }, 100);
});

// Update data when date changes
watch(selectedDate, () => {
  fetchDailySchedule();
});

// Update DataTable when schedule changes in edit mode
watch(dailySchedule, () => {
  if (editMode.value && dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
  }
});
</script>

<style scoped>
/* Add this at the top of your style section */
.schedule-container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

/* Container sizing for different screens */
@media (min-width: 992px) {
  .schedule-container {
    max-width: 90%; /* Wider container on desktop */
  }
}

@media (min-width: 1200px) {
  .schedule-container {
    max-width: 85%; /* Even wider on large desktop */
  }
}

/* Base card styling */
.card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
}

.card-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  border-bottom: none;
}

.card-body {
  padding: 1.5rem;
}

/* Button styling */
.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #2980b9;
  border-color: #2980b9;
}

.btn-outline-primary {
  color: #3498db;
  border-color: #3498db;
}

.btn-outline-primary:hover, .btn-outline-primary:focus {
  background-color: #3498db;
  color: white;
}

.btn-success {
  background-color: #27ae60;
  border-color: #27ae60;
}

.btn-success:hover, .btn-success:focus {
  background-color: #219955;
  border-color: #219955;
}

.btn-outline-danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.btn-outline-danger:hover, .btn-outline-danger:focus {
  background-color: #e74c3c;
  color: white;
}

.btn-outline-secondary {
  color: #7f8c8d;
  border-color: #7f8c8d;
}

.btn-outline-secondary:hover, .btn-outline-secondary:focus {
  background-color: #7f8c8d;
  color: white;
}

/* Date navigation */
.date-navigation {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
}

/* Table styling */
table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

table thead {
  background-color: #34495e;
  color: white;
}

table th {
  padding: 0.75rem !important;
  font-weight: 600;
}

table td {
  vertical-align: middle;
  padding: 0.75rem !important;
}

table tbody tr:nth-child(odd) {
  background-color: #f8f9fa;
}

table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* Empty state styling */
.alert-info {
  background-color: #eef7fb;
  border-color: #3498db;
  color: #2c3e50;
}

/* DataTables custom styling */
:deep(.dataTables_wrapper) {
  padding: 0;
}

:deep(.dataTables_filter) {
  margin-bottom: 1rem;
  text-align: left;
}

:deep(.dataTables_info) {
  padding-top: 1rem;
}

:deep(.dataTables_paginate) {
  padding-top: 1rem;
}

:deep(.dataTables_filter input) {
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
}

/* Modal styling */
:deep(.modal-header) {
  background-color: #2c3e50;
  color: white;
  border-bottom: none;
}

:deep(.modal-footer) {
  border-top: none;
  padding: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

:deep(.modal-footer .btn) {
  min-width: 100px;
}

:deep(.modal-content) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.modal-body) {
  padding: 1.5rem;
}

:deep(.form-label) {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

:deep(.form-control) {
  padding: 0.625rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: border-color 0.2s ease;
}

:deep(.form-control:focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 0.25rem rgba(52, 152, 219, 0.25);
}

/* Responsive adjustments --> max-width 768px */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch !important;
    gap: 1rem;
  }
  
  .card-header h2 {
    text-align: center;
    margin-bottom: 0;
  }
  
  .card-header div {
    display: flex;
    justify-content: center;
  }
  
  .date-navigation h3 {
    font-size: 1.25rem;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
  
  :deep(.dataTables_filter) {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  :deep(.dataTables_filter input) {
    width: 100%;
  }
}
</style>