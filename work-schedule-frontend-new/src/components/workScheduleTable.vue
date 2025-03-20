<template>
    <div class="schedule-table-container">
      <table class="schedule-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            <th>Required Hours</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Break Time</th>
            <th>Worked Hours</th>
            <th>Difference</th>
            <th>Task Description</th>
            <th>Overtime</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(day, index) in daysInMonth" :key="index" :class="{ weekend: isWeekend(day) }">
            <td>{{ formatDay(day) }}</td>
            <td>{{ formatDate(day) }}</td>
            <td>{{ day.requiredHours }}</td>
            <td>
              <input v-model="day.startTime" type="time" :disabled="isWeekend(day) || isHoliday(day)" />
            </td>
            <td>
              <input v-model="day.endTime" type="time" :disabled="isWeekend(day) || isHoliday(day)" />
            </td>
            <td>
              <input v-model="day.breakTime" type="text" placeholder="00:00" :disabled="isWeekend(day) || isHoliday(day)" />
            </td>
            <td :class="{ 'hours-worked': true }">{{ calculateWorkedHours(day) }}</td>
            <td :class="{ 'negative': isDifferenceNegative(day) }">{{ calculateDifference(day) }}</td>
            <td>
              <input v-model="day.taskDescription" type="text" :disabled="isWeekend(day) || isHoliday(day)" />
            </td>
            <td>{{ calculateOvertime(day) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

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
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useScheduleStore } from '../stores/schedule'
  import { useWorkHours } from '../composables/useWorkHours'
  
  const props = defineProps({
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  })
  
  const scheduleStore = useScheduleStore()
  const { calculateWorkedHours, calculateDifference, calculateOvertime } = useWorkHours()
  
  const daysInMonth = computed(() => {
    return scheduleStore.getDaysForMonth(props.month, props.year)
  })
  
  const formatDay = (day) => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    return days[new Date(day.date).getDay()]
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
  </script>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

export default {
  setup() {
    const router = useRouter();
    const availableTasks = ref([]);
    const scheduleData = reactive({
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
    
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        availableTasks.value = response.data;
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    
    const addTask = () => {
      scheduleData.tasks.push({ taskId: '', description: '', completionPercentage: 0, notes: '' });
    };
    
    const removeTask = (index) => {
      scheduleData.tasks.splice(index, 1);
      // Make sure there's at least one task
      if (scheduleData.tasks.length === 0) {
        addTask();
      }
    };
    
    const submitForm = async () => {
      try {
        // Format the data for the API
        const payload = {
          scheduleType: scheduleData.scheduleType,
          startTime: scheduleData.startTime || null,
          endTime: scheduleData.endTime || null,
          breakTime: scheduleData.breakTime || null,
          tasks: scheduleData.tasks
        };
        
        // Add date or month based on schedule type
        if (scheduleData.scheduleType === 'daily') {
          payload.date = scheduleData.date;
        } else {
          payload.month = scheduleData.month;
        }
        
        const response = await api.post('/schedules', payload);
        console.log('Schedule created:', response.data);
        
        // Navigate to schedules list
        router.push('/schedules');
      } catch (error) {
        console.error('Error creating schedule:', error);
      }
    };
    
    onMounted(() => {
      fetchTasks();
    });
    
    return {
      scheduleData,
      availableTasks,
      addTask,
      removeTask,
      submitForm
    };
  }
};
</script>
  
  <style scoped>
  .schedule-table-container {
    overflow-x: auto;
    margin-bottom: 20px;
    height: 100%;
    width: 100%;
  }
  
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .schedule-table th, .schedule-table td {
    padding: 8px 12px;
    border: 1px solid #ddd;
    text-align: center;
  }
  
  .schedule-table thead {
    background-color: #f2f2f2;
  }
  
  .weekend {
    background-color: #f8f8f8;
  }
  
  .negative {
    color: red;
  }
  
  input {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
  }
  
  input:focus {
    outline: none;
    background: #f0f7ff;
  }

  .schedule-form-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .task-item {
    border: 1px solid #eee;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 4px;
    background-color: #f9f9f9;
  }
  
  .buttons-container {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-add {
    background-color: #4CAF50;
    color: white;
  }
  
  .btn-remove {
    background-color: #f44336;
    color: white;
  }
  
  .btn-submit {
    background-color: #2196F3;
    color: white;
    margin-left: auto;
  }
  </style>