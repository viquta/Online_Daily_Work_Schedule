<template>
  <div>
     <!-- Add this nav/header section at the top -->
     <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Work Schedule</h2>
      <button class="btn btn-secondary" @click="goBackToSchedule">
        <i class="bi bi-arrow-left"></i> Back to Schedule
      </button>
    </div>
    
    <div class="alert alert-info mb-3">
      <i class="bi bi-info-circle me-2"></i> 
      Click on any cell to edit its value. Press Enter to save or Escape to cancel.
    </div>
   
    
    <div class="schedule-table-container">
      <!-- DataTable Component -->
      <DataTable 
        :options="tableOptions"
        class="display schedule-table"
        ref="dataTable"
      />
    </div>

    <!-- Keep your form section unchanged -->
    <div class="schedule-form-container">
      <h2>Create New Schedule</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="scheduleType">Schedule Type:</label>
          <select id="scheduleType" v-model="scheduleData.scheduleType">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div v-if="scheduleData.scheduleType === 'daily'" class="form-group">
          <label for="date">Date:</label>
          <input 
            type="date" 
            id="date" 
            v-model="scheduleData.date" 
            required
          />
        </div>
        
        <div v-else class="form-group">
          <label for="month">Month:</label>
          <input 
            type="month" 
            id="month" 
            v-model="scheduleData.month" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="startTime">Start Time:</label>
          <input type="time" id="startTime" v-model="scheduleData.startTime" />
        </div>
        
        <div class="form-group">
          <label for="endTime">End Time:</label>
          <input type="time" id="endTime" v-model="scheduleData.endTime" />
        </div>
        
        <div class="form-group">
          <label for="breakTime">Break Time:</label>
          <input type="time" id="breakTime" v-model="scheduleData.breakTime" />
        </div>
        
        <h3>Tasks</h3>
        <div v-for="(task, index) in scheduleData.tasks" :key="index" class="task-item">
          <div class="form-group">
            <label :for="`taskId-${index}`">Task:</label>
            <select 
              :id="`taskId-${index}`" 
              v-model="task.taskId" 
              required
            >
              <option value="">Select a task</option>
              <option v-for="taskOption in availableTasks" :key="taskOption.Task_Id" :value="taskOption.Task_Id">
                {{ taskOption.Task_Name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label :for="`description-${index}`">Description:</label>
            <input 
              type="text" 
              :id="`description-${index}`" 
              v-model="task.description" 
              placeholder="Custom description for this task"
            />
          </div>
          
          <div class="form-group">
            <label :for="`completion-${index}`">Completion (%):</label>
            <input 
              type="number" 
              :id="`completion-${index}`" 
              v-model.number="task.completionPercentage" 
              min="0" 
              max="100" 
            />
          </div>
          
          <div class="form-group">
            <label :for="`notes-${index}`">Notes:</label>
            <textarea 
              :id="`notes-${index}`" 
              v-model="task.notes" 
              placeholder="Additional notes"
            ></textarea>
          </div>
          
          <button type="button" @click="removeTask(index)" class="btn-remove">
            Remove Task
          </button>
        </div>
        
        <div class="buttons-container">
          <button type="button" @click="addTask" class="btn-add">
            Add Task
          </button>
          <button type="submit" class="btn-submit">
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useWorkHours } from '../composables/useWorkHours'
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net-bs5'
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import $ from 'jquery' // Add jQuery import for DataTables editing

// Initialize DataTables
DataTable.use(DataTablesCore)

// Replace your existing props definition with this
const props = defineProps({
  month: {
    type: Number,
    default: () => new Date().getMonth() + 1 // Current month (1-12)
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear() // Current year
  }
})

const scheduleStore = useScheduleStore()
const router = useRouter()
const { calculateWorkedHours, calculateDifference, calculateOvertime } = useWorkHours()
const dataTable = ref(null)

const daysInMonth = computed(() => {
  return scheduleStore.getDaysForMonth(props.month, props.year)
})

// Format data for DataTables
const tableOptions = computed(() => {
  const data = daysInMonth.value.map(day => {
    const isWeekendDay = isWeekend(day);
    const isHolidayDay = isHoliday(day);
    const disabled = isWeekendDay || isHolidayDay;
    
    return [
      formatDay(day),
      formatDate(day),
      `<input type="text" value="${day.requiredHours || ''}" ${disabled ? 'disabled' : ''} class="hours-input" data-field="requiredHours" data-date="${day.date}">
       ${!disabled ? '<i class="bi bi-pencil edit-icon"></i>' : ''}`,
      `<input type="time" value="${day.startTime || ''}" ${disabled ? 'disabled' : ''} class="time-input" data-field="startTime" data-date="${day.date}">
       ${!disabled ? '<i class="bi bi-pencil edit-icon"></i>' : ''}`,
      `<input type="time" value="${day.endTime || ''}" ${disabled ? 'disabled' : ''} class="time-input" data-field="endTime" data-date="${day.date}">
       ${!disabled ? '<i class="bi bi-pencil edit-icon"></i>' : ''}`,
      `<input type="text" value="${day.breakTime || ''}" placeholder="00:00" ${disabled ? 'disabled' : ''} class="break-input" data-field="breakTime" data-date="${day.date}">
       ${!disabled ? '<i class="bi bi-pencil edit-icon"></i>' : ''}`,
      calculateWorkedHours(day),
      calculateDifference(day),
      `<input type="text" value="${day.taskDescription || ''}" ${disabled ? 'disabled' : ''} class="task-input" data-field="taskDescription" data-date="${day.date}">
       ${!disabled ? '<i class="bi bi-pencil edit-icon"></i>' : ''}`,
      calculateOvertime(day)
    ];
  });

  return {
    data: data,
    columns: [
      { title: 'Day' },
      { title: 'Date' },
      { title: 'Required Hours' },
      { title: 'Start Time' },
      { title: 'End Time' },
      { title: 'Break Time' },
      { title: 'Worked Hours' },
      { title: 'Difference' },
      { title: 'Task Description' },
      { title: 'Overtime' }
    ],
    responsive: true,
    createdRow: function(row, data, index) {
      const day = daysInMonth.value[index];
      if (isWeekend(day)) {
        $(row).addClass('weekend');
      }
      
      // Add cell classes
      const diffCell = row.children[7]; // Difference column
      if (isDifferenceNegative(day)) {
        $(diffCell).addClass('negative');
      }
    }
  };
});

// Your existing helper functions
const formatDay = (day) => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return days[new Date(day.date).getDay()];
}

const formatDate = (day) => {
  const date = new Date(day.date)
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
}

const isWeekend = (day) => {
  const dayOfWeek = new Date(day.date).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
}

const isHoliday = (day) => {
  return scheduleStore.holidays.some(holiday => 
    holiday.date === day.date
  )
}

const isDifferenceNegative = (day) => {
  const diff = calculateDifference(day)
  return diff.startsWith('-')
}

const scheduleData = ref({
  scheduleType: 'daily',
  date: '',
  month: '',
  startTime: '',
  endTime: '',
  breakTime: '',
  tasks: [
    { taskId: '', description: '', completionPercentage: 0, notes: '' }
  ]
});
const availableTasks = ref([])

const addTask = () => {
  scheduleData.value.tasks.push({ taskId: '', description: '', completionPercentage: 0, notes: '' });
}

const removeTask = (index) => {
  scheduleData.value.tasks.splice(index, 1);
  // Ensure there's at least one task in the list
  if (scheduleData.value.tasks.length === 0) {
    addTask();
  }
}

// Add fetchTasks function from second script
const fetchTasks = async () => {
  try {
    const response = await api.get('/tasks');
    availableTasks.value = response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

// Update submitForm to include router navigation
const submitForm = async () => {
  try {
    // Prepare the payload based on the schedule type
    const payload = {
      scheduleType: scheduleData.value.scheduleType,
      startTime: scheduleData.value.startTime || null,
      endTime: scheduleData.value.endTime || null,
      breakTime: scheduleData.value.breakTime || null,
      tasks: scheduleData.value.tasks
    };

    if (scheduleData.value.scheduleType === 'daily') {
      payload.date = scheduleData.value.date;
    } else {
      payload.month = scheduleData.value.month;
    }

    // Send the data to the API
    const response = await api.post('/schedules', payload);
    console.log('Schedule created successfully:', response.data);

    // Add the new schedule to the store
    scheduleStore.addSchedule(response.data);

    // Reset the form
    scheduleData.value.scheduleType = 'daily';
    scheduleData.value.date = '';
    scheduleData.value.month = '';
    scheduleData.value.startTime = '';
    scheduleData.value.endTime = '';
    scheduleData.value.breakTime = '';
    scheduleData.value.tasks = [{ taskId: '', description: '', completionPercentage: 0, notes: '' }];
    
    // Navigate to schedules page to see the updated list
    router.push('/schedules');
  } catch (error) {
    console.error('Error creating schedule:', error);
    alert('Failed to create schedule. Please try again.');
  }
};

// Define these functions at component scope, not inside onMounted
const saveEdit = ($cell, value, dt, cellIndex, rowData, columnIndex) => {
  if (!$cell.hasClass('editing')) return;
  
  // Get the date and field from the data attributes
  const $input = $cell.find('input, select');
  const date = rowData[1]; // Assuming date is in the second column
  
  // Determine which field to update based on column index
  let field;
  switch (columnIndex) {
    case 2: field = 'requiredHours'; break;
    case 3: field = 'startTime'; break;
    case 4: field = 'endTime'; break;
    case 5: field = 'breakTime'; break;
    case 8: field = 'taskDescription'; break;
    default: field = null;
  }
  
  if (field) {
    // Find the day in your data and update it
    const dayIndex = daysInMonth.value.findIndex(day => day.date === date);
    if (dayIndex !== -1) {
      // Update the data in your store
      scheduleStore.updateDayField(date, field, value);
      
      // Update the cell display
      dt.cell(cellIndex).data(value).draw(false);
      
      // If this affects calculated fields, update those too
      if (['startTime', 'endTime', 'breakTime', 'requiredHours'].includes(field)) {
        const day = daysInMonth.value[dayIndex];
        dt.cell(cellIndex.row, 6).data(calculateWorkedHours(day)).draw(false);
        dt.cell(cellIndex.row, 7).data(calculateDifference(day)).draw(false);
        dt.cell(cellIndex.row, 9).data(calculateOvertime(day)).draw(false);
      }
    }
  }
  
  // Remove editing class
  $cell.removeClass('editing');
}



const goBackToSchedule = () => {
  // Navigate back to the schedule view
  router.push('/schedules');
}


const cancelEdit = ($cell) => {
  if (!$cell.hasClass('editing')) return;
  
  // Restore original content
  $cell.html($cell.data('original'));
  $cell.removeData('original');
  $cell.removeClass('editing');
}

onMounted(() => {
  fetchTasks();
  
  // Setup DataTable interactions after render
  setTimeout(() => {
    if (dataTable.value?.dt) {
      const dt = dataTable.value.dt;
      
      // Handle focus/blur for visual feedback
      dt.on('focus', 'input', function(e) {
        $(e.target).closest('td').addClass('editing-cell');
      });

      dt.on('blur', 'input', function(e) {
        $(e.target).closest('td').removeClass('editing-cell');
      });

      // Enable click-to-edit functionality
      dt.on('click', 'td:not(:first-child):not(:nth-child(2)):not(:nth-child(7)):not(:nth-child(8)):not(:last-child)', function(e) {
        // Skip if already editing or if clicked on an input
        if ($(this).hasClass('editing') || $(e.target).is('input, select')) {
          return;
        }
        
        const $cell = $(this);
        const cellData = dt.cell(this).data();
        const cellIndex = dt.cell(this).index();
        const columnIndex = cellIndex.column;
        const rowData = dt.row(cellIndex.row).data();
        
        // Determine which type of editor to show based on the column
        let editorHtml = '';
        
        if (columnIndex === 2) { // Required Hours column
          editorHtml = `<input type="text" class="form-control form-control-sm edit-input hours-input" value="${cellData.replace(/[^0-9:]/g, '')}" />`;
        } 
        else if (columnIndex === 3) { // Start Time column
          editorHtml = `<input type="time" class="form-control form-control-sm edit-input time-input" value="${cellData.replace(/[^0-9:]/g, '')}" />`;
        }
        else if (columnIndex === 4) { // End Time column
          editorHtml = `<input type="time" class="form-control form-control-sm edit-input time-input" value="${cellData.replace(/[^0-9:]/g, '')}" />`;
        }
        else if (columnIndex === 5) { // Break Time column
          editorHtml = `<input type="text" class="form-control form-control-sm edit-input break-input" value="${cellData.replace(/[^0-9:]/g, '')}" placeholder="00:00" />`;
        }
        else if (columnIndex === 8) { // Task Description with options
          editorHtml = `<select class="form-control form-control-sm edit-input">
            <option value="">Select task</option>
            ${availableTasks.value.map(task => 
              `<option value="${task.id}" ${cellData === task.name ? 'selected' : ''}>${task.name}</option>`
            ).join('')}
            <option value="custom">Custom...</option>
          </select>`;
          
          // Handle custom option (need to defer this until after element creation)
          setTimeout(() => {
            $cell.on('change', 'select', function() {
              if (this.value === 'custom') {
                const customInput = `<input type="text" class="form-control form-control-sm edit-input" placeholder="Enter custom task..." />`;
                $(this).replaceWith(customInput);
                $cell.find('input').focus();
              }
            });
          }, 0);
        }
        
        // Replace cell content with editor
        const originalContent = $cell.html();
        $cell.data('original', originalContent);
        $cell.html(editorHtml);
        $cell.addClass('editing');
        
        // Focus the input
        const $input = $cell.find('input, select');
        $input.focus();
        
        // Save on blur and enter key
        $input.on('blur', function() {
          saveEdit($cell, this.value, dt, cellIndex, rowData, columnIndex);
        });
        
        $input.on('keydown', function(e) {
          if (e.key === 'Enter') {
            saveEdit($cell, this.value, dt, cellIndex, rowData, columnIndex);
          } else if (e.key === 'Escape') {
            cancelEdit($cell);
          }
        });
      });
    }
  }, 0);
});
</script>

<style scoped>
/* Table styles */
.schedule-table-container {
  position: relative;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.schedule-table-container::before {
  content: "Click on cells with pencil icons to edit values";
  display: block;
  margin-bottom: 10px;
  font-style: italic;
  color: #6c757d;
}

/* DataTable styles */
:deep(.dataTables_wrapper) {
  padding: 0;
  width: 100%;
}

/* Cell styles */
:deep(input.time-input, input.break-input, input.task-input, input.hours-input) {
  width: calc(100% - 20px);
  border: none;
  background: transparent;
  text-align: center;
  padding: 4px;
  border-bottom: 1px dashed #ccc;
}

:deep(input.time-input:focus, input.break-input:focus, input.task-input:focus, input.hours-input:focus) {
  outline: none;
  background: #f0f7ff;
  border-bottom: 2px solid #007bff;
}

:deep(.edit-icon) {
  font-size: 12px;
  color: #6c757d;
  opacity: 0.5;
  margin-left: 4px;
  vertical-align: middle;
}

:deep(td:hover .edit-icon) {
  opacity: 1;
  color: #007bff;
}

/* State styling */
:deep(.weekend) {
  background-color: #f8f8f8;
}

:deep(.negative) {
  color: red;
}

/* Interaction styling */
:deep(td:has(input:not([disabled]))) {
  cursor: pointer;
  position: relative;
}

:deep(.editing-cell) {
  background-color: rgba(0, 123, 255, 0.1);
  box-shadow: inset 0 0 0 2px #007bff;
}

:deep(td.editing) {
  padding: 0 !important;
}

:deep(.edit-input) {
  width: 100%;
  height: 100%;
  padding: 6px;
  box-sizing: border-box;
  border: 2px solid #007bff;
  background-color: #f8f9fa;
}

:deep(td:not(.editing):hover) {
  cursor: pointer;
  background-color: rgba(0, 123, 255, 0.05);
}

/* Form styles (unmodified) */
.schedule-form-container {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.task-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.buttons-container {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.btn-add, .btn-remove, .btn-submit {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-add {
  background-color: #28a745;
  color: white;
}

.btn-remove {
  background-color: #dc3545;
  color: white;
}

.btn-submit {
  background-color: #007bff;
  color: white;
}
</style>