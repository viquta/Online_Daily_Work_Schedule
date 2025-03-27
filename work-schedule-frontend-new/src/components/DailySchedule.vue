<!-- filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\client\src\components\DailySchedule.vue -->
<template>
  <div>
    <div class="date-navigation d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="goToPreviousDay">
        <i class="bi bi-chevron-left"></i> Previous
      </button>
      <h3 class="mb-0">{{ formattedDate }}</h3>
      <button class="btn btn-outline-secondary" @click="goToNextDay">
        Next <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- No data message -->
    <div v-else-if="dailySchedule.length === 0" class="text-center py-4">
      <p>No schedule data for this day. Add a new task to get started.</p>
    </div>

    <!-- DataTable Component -->
    <DataTable 
      v-else
      :options="tableOptions"
      class="display table table-striped table-bordered"
      ref="dataTable"
    />

    <div class="text-center mt-4">
      <button class="btn btn-success" @click="addNewTask">
        <i class="bi bi-plus-circle"></i> Add New Task
      </button>
      
      <!-- Back to Schedule button -->
      <button class="btn btn-secondary ms-2" @click="router.push('/')">
        <i class="bi bi-arrow-left"></i> Back to Dashboard
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import api from '../services/api'; // Make sure this is imported
import { useRouter } from 'vue-router';
const router = useRouter();

// Initialize DataTables
DataTable.use(DataTablesCore);

const authStore = useAuthStore();
const selectedDate = ref(new Date());
const dataTable = ref(null);
const loading = ref(true);

// Replace hard-coded data with an empty array that will be populated from API
const dailySchedule = ref([]);

// Add this function before the fetchDailySchedule function

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

// fetchDailySchedule function (corrected version):

const fetchDailySchedule = async () => {
  loading.value = true;
  try {
    // Format the date as YYYY-MM-DD
    const dateString = selectedDate.value.toISOString().split('T')[0];
    
    // Fetch schedules by date
    const response = await api.scheduleApi.getSchedules({ date: dateString });
    console.log(response);
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Find the schedule for the selected date
      const todaysSchedule = response.data.filter(schedule => { //was find instead of filter
        const scheduleDate = schedule.Date || schedule.date;
        if (!scheduleDate) return false;
        
        // Try different date formats for comparison
        if (scheduleDate === dateString) return true;
        if (scheduleDate.substring(0, 10) === dateString) return true;
        
        try {
          const dateObj = new Date(scheduleDate);
          const compareDate = new Date(dateString);
          return dateObj.toDateString() === compareDate.toDateString();
        } catch (e) {
          return false;
        }
      });
      console.log('After filtering - found schedules:', todaysSchedule.length);

      
      if (todaysSchedule) {
        // Process schedule data into task format for display
        dailySchedule.value = todaysSchedule.tasks?.map(task => ({
          time: `${formatTime(task.Start_Time || task.startTime)} - ${formatTime(task.End_Time || task.endTime)}`,
          task: task.Task_Description || task.description || 'No description',
          priority: task.Priority || task.priority || 'normal',
          id: task.WSTID || task.wstid || task.id, // <-- Use WSTID as primary choice
          // Optionally store the other IDs for reference
          taskId: task.Task_Id || task.taskId,
          scheduleId: task.WS_Id || task.scheduleId
        })) || [];
      } else {
        // No schedule found for this day
        dailySchedule.value = [];
      }
    } else {
      // No schedules found
      dailySchedule.value = [];
    }

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const firstSchedule = response.data[0];
      // Log ALL fields of the first task so we can see all available fields
      console.log('FULL TASK DATA STRUCTURE:', firstSchedule.tasks?.[0]);
      console.log('FULL SCHEDULE DATA:', firstSchedule);
    }
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    // Clear the schedule on error
    dailySchedule.value = [];
  } finally {
    loading.value = false;
  }
};

// Call this when component mounts
onMounted(() => {
  // Get date parameter from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date');
  
  if (dateParam) {
    try {
      // Parse the date parameter and set selectedDate
      selectedDate.value = new Date(dateParam);
    } catch (e) {
      console.error('Invalid date parameter:', dateParam);
      selectedDate.value = new Date();
    }
  }
  fetchDailySchedule();
});

// Update data when date changes
watch(selectedDate, () => {
  fetchDailySchedule();
});

// Format the data for DataTables and provide column definitions
const tableOptions = computed(() => ({
  data: dailySchedule.value.map(item => [
    item.time,
    item.task,
    `<span class="badge ${
      item.priority === 'high' ? 'bg-danger' : 
      item.priority === 'medium' ? 'bg-warning' : 'bg-info'
    }">${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}</span>`,
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
    { title: 'Priority', width: '15%' },
    { title: 'Actions', width: '20%' }
  ],
  responsive: true,
  dom: 'Bfrtip', // Buttons, filter, processing indicator, table, pagination
  language: {
    search: 'Search:',
    lengthMenu: 'Show _MENU_ entries per page',
    info: 'Showing _START_ to _END_ of _TOTAL_ entries'
  },
  createdRow: function(row, data, index) {
    // Additional row customization if needed
  }
}));

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Set up event listeners after the table is mounted
onMounted(() => {
  // First fetch is already called in onMounted above
  
  // Use a more reliable way to initialize DataTable events
  $(document).on('click', '.btn-edit', function(e) {
    const taskName = $(this).attr('data-task');
    editTask(taskName);
  });
  
  $(document).on('click', '.btn-delete', function(e) {
    const taskName = $(this).attr('data-task');
    deleteTask(taskName);
  });
});

// Update DataTable when the date changes
watch(selectedDate, () => {
  // In a real app, you would fetch the schedule for the new date here
  // and then update the DataTable instance
  if (dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
  }
});

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

const addNewTask = async () => {
  try {
    // Format the date as YYYY-MM-DD
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
    
    // Now add the task to the schedule
    const newTaskResponse = await api.scheduleApi.addTaskToSchedule(scheduleId, {
      description: 'New Task',
      startTime: startTime,
      endTime: endTime,
      priority: 'normal',
      completionPercentage: 0,
      notes: ''
    });
    
    // Refresh the data
    await fetchDailySchedule();
    
    // If DataTable is initialized, scroll to the new row and highlight it
    if (dataTable.value?.dt) {
      // Scroll to top where the new task is
      $('html, body').animate({
        scrollTop: $(dataTable.value.$el).offset().top - 100
      }, 300);
    }
    
  } catch (error) {
    console.error('Failed to save new task:', error);
    alert('Failed to create new task. Please try again.');
  }
};

// Update the editTask function to enable inline editing:

const editTask = (taskName) => {
  // Get the button that was clicked to find the task ID
  const taskId = $('.btn-edit[data-task="' + taskName + '"]').attr('data-id');
  
  // Find the task index by ID for more reliability
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
      
      // Replace priority cell with select
      const $priorityCell = $row.find('td:eq(2)');
      const currentPriority = dailySchedule.value[index].priority;
      $priorityCell.html(`
        <select class="form-select form-select-sm edit-input">
          <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="normal" ${currentPriority === 'normal' ? 'selected' : ''}>Normal</option>
        </select>
      `);
      
      // Update action buttons
      const $actionsCell = $row.find('td:eq(3)');
      $actionsCell.html(`
        <div class="action-buttons">
          <button class="btn btn-sm btn-success me-1 btn-save" data-task="${taskName}">
            <i class="bi bi-check-lg"></i> Save
          </button>
          <button class="btn btn-sm btn-outline-secondary btn-cancel" data-task="${taskName}">
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

// Add new functions for saving changes and canceling

// Update saveRowChanges to call the API
const saveRowChanges = async (index, $row) => {
  // Get values from inputs
  const newTime = $row.find('td:eq(0) input').val();
  const newTask = $row.find('td:eq(1) input').val();
  const newPriority = $row.find('td:eq(2) select').val();
  
  // Update data model
  dailySchedule.value[index].time = newTime;
  dailySchedule.value[index].task = newTask;
  dailySchedule.value[index].priority = newPriority;
  
  // Extract start and end times
  const [startTime, endTime] = newTime.split(' - ');
  
  // Get the actual task ID from your data model
  const taskId = dailySchedule.value[index].id;
  
  // Save to API
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    
    // Get the schedule ID first
    const todaysSchedules = await api.scheduleApi.getSchedules({ date: formattedDate });
    
    if (todaysSchedules.data && todaysSchedules.data.length > 0) {
      // Use the schedule ID from the response
      const scheduleId = todaysSchedules.data[0].WS_Id || todaysSchedules.data[0].id;
      
      // Now update with proper IDs and field names
      await api.scheduleApi.updateScheduleTask(scheduleId, taskId, {
        startTime: startTime,
        endTime: endTime,
        description: newTask, // Use 'description' instead of 'taskDescription'
        priority: newPriority
      });
      
      // Refresh the data to ensure we have latest from server
      await fetchDailySchedule();
    } else {
      console.error('No schedule found for date:', formattedDate);
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
};

const cancelEditing = () => {
  // Simply refresh the table to discard changes
  if (dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
  }
};

const deleteTask = async (taskName) => {
  if (confirm(`Are you sure you want to delete task: ${taskName}?`)) {
    try {
      // Get the WSTID from the button
      const wstid = $('.btn-delete[data-task="' + taskName + '"]').attr('data-id');
      
      if (!wstid) {
        alert('Could not find the task ID. Please refresh and try again.');
        return;
      }
      
      console.log('Task ID to delete:', wstid);
      
      // CRITICAL: Find the correct schedule ID for this specific task
      // First, get the WSTID
      const taskIdResponse = await fetch(`/api/tasks/schedule-id-by-task?wstid=${wstid}`);
      const taskIdData = await taskIdResponse.json();
      
      if (!taskIdData.scheduleId) {
        throw new Error('Could not determine the correct schedule ID for this task');
      }
      
      const correctScheduleId = taskIdData.scheduleId;
      console.log(`Found correct schedule ID for task ${wstid}: ${correctScheduleId}`);
      
      // Now delete using the CORRECT schedule ID
      await api.scheduleApi.removeTaskFromSchedule(correctScheduleId, wstid);
      
      console.log('Task deleted successfully');
      await fetchDailySchedule();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(`Failed to delete task: ${error.message}. Please try again.`);
    }
  }
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  justify-content: center;
}

.badge {
  font-size: 0.8rem;
  padding: 0.35em 0.65em;
}

/* DataTables custom styling */
:deep(.dataTables_wrapper) {
  padding: 0;
}

:deep(.dataTables_filter) {
  margin-bottom: 1rem;
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