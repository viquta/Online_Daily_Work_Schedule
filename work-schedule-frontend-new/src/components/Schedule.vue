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
            <i class="bi bi-plus-circle"></i> Create Schedule
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

// Initialize DataTables
DataTable.use(DataTablesCore);

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const editMode = ref(false);
const selectedDate = ref(new Date());
const dailySchedule = ref([]);
const dataTable = ref(null);

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
    
    // In the fetchDailySchedule function
    const response = await api.scheduleApi.getSchedulesByDate(formattedDate);    
    console.log('Raw response data:', response.data);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Don't filter again - backend already filtered by date
      const todaysSchedules = response.data;
      
      console.log('Found schedules for today:', todaysSchedules.length);
      
      if (todaysSchedules.length > 0) {
        let allTasks = [];
        
        todaysSchedules.forEach(schedule => {
          console.log('Processing schedule:', schedule.schedule_id || schedule.id);
          
          if (schedule.tasks && Array.isArray(schedule.tasks) && schedule.tasks.length > 0) {
            const scheduleTasks = schedule.tasks.map(task => ({
              time: formatTime(task.start_time),
              task: task.task_name || 'No name',
              description: task.task_description || 'No description',
              id: task.task_id,
              scheduleId: schedule.schedule_id,
            }));
            
            allTasks = [...allTasks, ...scheduleTasks];
          }
        });
        
        allTasks.sort((a, b) => {
          return a.time.localeCompare(b.time);
        });
        
        dailySchedule.value = allTasks;
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
    item.description,
    `<div class="action-buttons">
      <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-task="${item.task}" data-id="${item.id}">
        <i class="bi bi-pencil"></i> Edit
      </button>
      <button class="btn btn-sm btn-outline-danger btn-delete" data-task="${item.task}" data-id="${item.id}">
        <i class="bi bi-trash"></i> Delete
      </button>
    </div>`
  ]),
  columns: [
    { title: 'Time', width: '15%' },
    { title: 'Task', width: '50%' },
    { title: 'Actions', width: '20%' }
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
      $(document).off('click', '.btn-edit').on('click', '.btn-edit', function(e) {
        const taskName = $(this).attr('data-task');
        const taskId = $(this).attr('data-id');
        editTask(taskName, taskId);
      });
      
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
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    
    // Check if we already have a schedule loaded
    let scheduleId;
    const todaysSchedules = await api.scheduleApi.getSchedules({ date: formattedDate });
    
    if (todaysSchedules.data && todaysSchedules.data.length > 0) {
      // Use existing schedule
      scheduleId = todaysSchedules.data[0].WS_Id || todaysSchedules.data[0].id;
    } else {
      // Create a new schedule for today
      const newSchedule = await api.scheduleApi.createSchedule({
        date: formattedDate,
        scheduleType: 'single',
        tasks: []
      });
      scheduleId = newSchedule.data.WS_Id || newSchedule.data.id;
    }
    
    // Use the current time as default start time
    const now = new Date();
    const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${(now.getHours() + 1).toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Add task to schedule
    await api.scheduleApi.addTaskToSchedule(scheduleId, {
      description: 'New Task',
      startTime: startTime,
      endTime: endTime,
      completionPercentage: 0,
      notes: ''
    });
    
    // Refresh the data
    await fetchDailySchedule();
    
    // Switch to edit mode if not already in edit mode
    if (!editMode.value) {
      editMode.value = true;
    }
    
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
  // Get values from inputs
  const newTime = $row.find('td:eq(0) input').val();
  const newTask = $row.find('td:eq(1) input').val();
  
  // Update data model
  dailySchedule.value[index].time = newTime;
  dailySchedule.value[index].task = newTask;
  
  // Extract start and end times
  const [startTime, endTime] = newTime.split(' - ');
  
  // Get the actual task ID from your data model
  const taskId = dailySchedule.value[index].id;
  const scheduleId = dailySchedule.value[index].scheduleId;
  
  // Save to API
  try {
    // Update with proper IDs and field names
    await api.scheduleApi.updateScheduleTask(scheduleId, taskId, {
      startTime: startTime,
      endTime: endTime,
      description: newTask,
    });
    
    // Refresh the data to ensure we have latest from server
    await fetchDailySchedule();
  } catch (error) {
    console.error('Failed to update task:', error);
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
      // Find the task in our local data to get the schedule ID
      const task = dailySchedule.value.find(item => String(item.id) === String(taskId));
      
      if (!task) {
        alert('Could not find the task. Please refresh and try again.');
        return;
      }
      
      const scheduleId = task.scheduleId;
      
      // Call the API to delete the task
      await api.scheduleApi.removeTaskFromSchedule(scheduleId, taskId);
      
      // Refresh the data
      await fetchDailySchedule();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(`Failed to delete task: ${error.message}. Please try again.`);
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