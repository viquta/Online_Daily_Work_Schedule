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
      <button class="btn btn-secondary ms-2" @click="router.push('/schedules')">
        <i class="bi bi-arrow-left"></i> Back to Schedule
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

// Function to fetch schedule data from API
const fetchDailySchedule = async () => {
  loading.value = true;
  try {
    // Format date as YYYY-MM-DD for API
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    
    // Use your API service to fetch schedule data
    const response = await api.scheduleApi.getScheduleById(formattedDate);
    
    if (response.data && Array.isArray(response.data.tasks)) {
      // Transform API data to match your component's structure
      dailySchedule.value = response.data.tasks.map(task => ({
        time: task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : '',
        task: task.taskDescription || task.Task_Name,
        priority: task.priority || 'normal'
      }));
    } else {
      // If no data, show empty array
      dailySchedule.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    dailySchedule.value = []; // Reset to empty on error
  } finally {
    loading.value = false;
  }
};

// Call this when component mounts
onMounted(() => {
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
      <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-task="${item.task}">
        <i class="bi bi-pencil"></i> Edit
      </button>
      <button class="btn btn-sm btn-outline-danger btn-delete" data-task="${item.task}">
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
  setTimeout(() => {
    if (dataTable.value?.dt) {
      const dt = dataTable.value.dt;
      
      // Add event listeners for edit and delete buttons
      dt.on('click', '.btn-edit', function(e) {
        const taskName = e.currentTarget.getAttribute('data-task');
        editTask(taskName);
      });
      
      dt.on('click', '.btn-delete', function(e) {
        const taskName = e.currentTarget.getAttribute('data-task');
        deleteTask(taskName);
      });
    }
  }, 0);
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
  // Add a new empty task to the beginning of the array
  const newTask = {
    time: '00:00 - 00:00', 
    task: 'New Task', 
    priority: 'normal'
  };
  
  dailySchedule.value.unshift(newTask);
  
  // Save to API
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    await api.scheduleApi.addTaskToSchedule(formattedDate, {
      startTime: '00:00',
      endTime: '00:00',
      taskDescription: 'New Task',
      priority: 'normal'
    });
  } catch (error) {
    console.error('Failed to save new task:', error);
    // Could add error handling here
  }
  
  // Refresh the table and immediately edit the new task
  if (dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
    
    // Get the first row and trigger edit
    setTimeout(() => {
      editTask('New Task');
    }, 50);
  }
};

// Update the editTask function to enable inline editing:

const editTask = (taskName) => {
  // Find the task row index
  const index = dailySchedule.value.findIndex(item => item.task === taskName);
  
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
  
  // Save to API
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    const taskId = index; // You may need to store actual task IDs in your data
    await api.scheduleApi.updateScheduleTask(formattedDate, taskId, {
      startTime,
      endTime,
      taskDescription: newTask,
      priority: newPriority
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    // Could add error handling here
  }
  
  // Refresh the table
  if (dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
  }
};

const cancelEditing = () => {
  // Simply refresh the table to discard changes
  if (dataTable.value?.dt) {
    dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
  }
};

// Update deleteTask to call the API
const deleteTask = async (taskName) => {
  if (confirm(`Are you sure you want to delete task: ${taskName}?`)) {
    // Find the task index
    const index = dailySchedule.value.findIndex(item => item.task === taskName);
    
    if (index !== -1) {
      // Remove from UI
      dailySchedule.value.splice(index, 1);
      
      // Delete from API
      try {
        const formattedDate = selectedDate.value.toISOString().split('T')[0];
        const taskId = index; // You may need to store actual task IDs
        await api.scheduleApi.removeTaskFromSchedule(formattedDate, taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        // Could add error handling or rollback UI change
      }
      
      // Update the DataTable
      if (dataTable.value?.dt) {
        dataTable.value.dt.clear().rows.add(tableOptions.value.data).draw();
      }
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