<!-- filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule_2.0\work-schedule-frontend-new\src\components\Schedule.vue -->
<template>
  <div class="container mt-4">
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
        <div class="d-flex justify-content-between align-items-center mb-4">
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
              <th style="width: 15%">Time</th>
              <th style="width: 65%">Task</th>
              <th style="width: 20%">Description</th>
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
              <label for="taskTime" class="form-label">Time</label>
              <input type="time" class="form-control" id="taskTime" v-model="newTask.startTime" required>
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
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
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
          time: formatTime(task.start_time),
          task: task.task_name || 'No name',
          description: task.task_description || 'No description',
          id: task.task_id,
          scheduleId: schedule.schedule_id,
          startTime: task.start_time,
          endTime: task.end_time
        }));
        
        scheduleTasks.sort((a, b) => {
          return a.time.localeCompare(b.time);
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

// DataTable options
const tableOptions = computed(() => ({
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
    { title: 'Time', width: '15%' },
    { title: 'Task', width: '45%' },
    { title: 'Description', width: '25%' },
    { title: 'Actions', width: '15%' }
  ],
  responsive: true,
  dom: 'frtip', // filter, processing indicator, table, information, pagination
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

// Date navigation
const goToPreviousDay = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() - 1);
  selectedDate.value = newDate;
};

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
  // Reset the form
  newTask.value = {
    startTime: new Date().toTimeString().slice(0, 5), // Default to current time (HH:MM)
    taskName: '',
    taskDescription: ''
  };
  
  // Open the modal
  if (!taskModal.value) {
    taskModal.value = new Modal(document.getElementById('addTaskModal'));
  }
  taskModal.value.show();
};

// Save new task from modal
const saveNewTask = async () => {
  try {
    if (!newTask.value.startTime || !newTask.value.taskName) {
      alert('Please enter a time and task name');
      return;
    }
    
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    
    // Check if we already have a schedule
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
    
    // Calculate end time (1 hour after start time)
    const [hours, minutes] = newTask.value.startTime.split(':').map(Number);
    const endHour = (hours + 1) % 24;
    const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    
    // Format start time
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    
    // Add task to schedule
    await api.scheduleApi.addTaskToSchedule(scheduleId, {
      taskName: newTask.value.taskName,
      startTime: startTime,
      endTime: endTime,
      taskDescription: newTask.value.taskDescription || ''
    });
    
    // Close the modal
    taskModal.value.hide();
    
    // Refresh the data
    await fetchDailySchedule();
    
  } catch (error) {
    console.error('Failed to save new task:', error);
    alert('Failed to create new task. Please try again.');
  }
};

// Edit task (make row editable)
const editTask = (taskName, taskId) => {
  // Find the task index by ID
  const index = dailySchedule.value.findIndex(item => String(item.id) === String(taskId));
  
  if (index !== -1 && dataTable.value?.dt) {
    const dt = dataTable.value.dt;
    const row = dt.row(function(idx, data) {
      return data[1] === taskName;
    });
    
    // Toggle editing state for this row
    const $row = $(row.node());
    
    if ($row.hasClass('editing')) {
      // Save the changes
      saveRowChanges(index, $row);
    } else {
      // Enable editing - replace cells with input fields
      const rowData = row.data();
      
      // Replace time cell with input
      const $timeCell = $row.find('td:eq(0)');
      $timeCell.html(`<input type="text" class="form-control form-control-sm edit-input" value="${rowData[0]}">`);
      
      // Replace task cell with input
      const $taskCell = $row.find('td:eq(1)');
      $taskCell.html(`<input type="text" class="form-control form-control-sm edit-input" value="${rowData[1]}">`);
      
      // Replace description cell with input
      const $descCell = $row.find('td:eq(2)');
      $descCell.html(`<input type="text" class="form-control form-control-sm edit-input" value="${rowData[2]}">`);
      
      // Update action buttons
      const $actionsCell = $row.find('td:eq(3)');
      $actionsCell.html(`
        <div class="action-buttons">
          <button class="btn btn-sm btn-success me-1 btn-save" data-task="${taskName}" data-id="${taskId}">
            <i class="bi bi-check-lg"></i> Save
          </button>
          <button class="btn btn-sm btn-outline-secondary btn-cancel" data-task="${taskName}" data-id="${taskId}">
            <i class="bi bi-x-lg"></i> Cancel
          </button>
        </div>
      `);
      
      // Add event listeners for the new buttons
      $actionsCell.find('.btn-save').on('click', function() {
        saveRowChanges(index, $row);
      });
      
      $actionsCell.find('.btn-cancel').on('click', function() {
        cancelEditing();
      });
      
      // Mark row as being edited
      $row.addClass('editing');
    }
  }
};

// Save task changes
const saveRowChanges = async (index, $row) => {
  try {
    // Get values from inputs
    const newTime = $row.find('td:eq(0) input').val();
    const newTask = $row.find('td:eq(1) input').val();
    const newDesc = $row.find('td:eq(2) input').val();
    
    // Get the task ID and scheduleId
    const taskId = dailySchedule.value[index].id;
    
    // Since our backend doesn't support task updates yet, we'll need to:
    // 1. Delete the old task
    // 2. Create a new task with the updated information
    
    // First, delete the old task
    await api.scheduleApi.removeTask(taskId);
    
    // Then create a new task with the updated information
    const scheduleId = dailySchedule.value[index].scheduleId;
    
    // Format the time from "12:30 PM" to "12:30:00" format
    let timeComponents = newTime.match(/(\d+):(\d+)\s*([AP]M)?/i);
    let hours = parseInt(timeComponents[1]);
    const minutes = parseInt(timeComponents[2]);
    
    // Handle AM/PM conversion
    if (timeComponents[3] && timeComponents[3].toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (timeComponents[3] && timeComponents[3].toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    const endTime = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    
    // Add the new task
    await api.scheduleApi.addTaskToSchedule(scheduleId, {
      taskName: newTask,
      startTime: startTime,
      endTime: endTime,
      taskDescription: newDesc
    });
    
    // Refresh data
    await fetchDailySchedule();
    
  } catch (error) {
    console.error('Error updating task:', error);
    alert('Failed to update task. Please try again.');
  }
};

// Cancel editing
const cancelEditing = () => {
  // Refresh the table to discard changes
  if (dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
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
.card {
  border-radius: 8px;
}

.card-header {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.8rem;
  padding: 0.35em 0.65em;
}

table td {
  vertical-align: middle;
}

.action-buttons {
  display: flex;
  justify-content: center;
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

/* Editing mode styles */
:deep(tr.editing) {
  background-color: rgba(0, 123, 255, 0.05) !important;
}

:deep(.edit-input) {
  width: 100%;
  padding: 4px 8px;
  font-size: 0.875rem;
}

:deep(.form-select.edit-input) {
  padding-right: 24px;
}
</style>