<!-- filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\client\src\components\Dashboard.vue -->
<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header d-flex justify-content-between align-items-center">
  <h2>Work Schedule</h2>
  <div>
    <!-- Replace the button group with just a simple title -->
    <span class="me-3">Daily View</span>
    <button class="btn btn-outline-danger" @click="handleLogout">Logout</button>
  </div>
</div>
      <div class="card-body">
        <!-- Replace existing content with our new schedule views -->
        <div>
          <!-- Daily Schedule -->
          <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <button class="btn btn-outline-secondary" @click="goToPreviousDay">
                Previous Day
              </button>
              <h3 class="mb-0">{{ formattedDate }}</h3>
              <button class="btn btn-outline-secondary" @click="goToNextDay">
                Next Day
              </button>
            </div>

            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <table v-else-if="dailySchedule.length > 0" class="table table-striped table-bordered">
              <thead class="bg-light">
                <tr>
                  <th style="width: 15%">Time</th>
                  <th style="width: 65%">Task</th>
                  <th style="width: 20%">Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in dailySchedule" :key="index">
                  <td>{{ item.time }}</td>
                  <td>{{ item.task }}</td>
                  <td>
                    <span 
                      :class="[
                        'badge', 
                        item.priority === 'high' ? 'bg-danger' : 
                        item.priority === 'medium' ? 'bg-warning' : 'bg-info'
                      ]"
                    >
                      {{ item.priority.charAt(0).toUpperCase() + item.priority.slice(1) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-else class="alert alert-info text-center">
              <p>No tasks scheduled for {{ formattedDate }}.</p>
              <button class="btn btn-success mt-2" @click="createNewSchedule">
                <i class="bi bi-plus-circle"></i> Create Schedule
              </button>
            </div>
          </div>
        </div>

        <!-- Add buttons to access the editable tables -->
        <div class="mt-4 d-flex justify-content-center gap-3">
          <router-link 
            :to="`/daily-schedule?date=${selectedDate.value ? selectedDate.value.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}`"  
            class="btn btn-primary">
            <i class="bi bi-pencil-square"></i> Edit Daily Schedule
          </router-link>
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

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

// For daily schedule
const selectedDate = ref(new Date());
const dailySchedule = ref([]);

// Debug logging
console.log('scheduleApi methods:', Object.keys(api.scheduleApi));

const fetchDailySchedule = async () => {
  loading.value = true;
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    console.log('Fetching schedule for date:', formattedDate);
    
    // Debug: Check what API methods are available
    console.log('API methods:', Object.keys(api));
    
    // For daily view
    const response = await api.scheduleApi.getSchedules({ date: formattedDate });

    console.log('Raw response data:', response.data);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log('Before filtering - schedules in response:', response.data.length);
      console.log('Looking for date:', formattedDate);

      const todaysSchedules = response.data.filter(schedule => {
        const scheduleDate = schedule.Date || schedule.date;
        
        if (!scheduleDate) return false;
        
        console.log('Schedule:', {
          id: schedule.WS_Id, 
          date: scheduleDate,
          match: scheduleDate === formattedDate,
          includes: scheduleDate?.includes(formattedDate),
          dateStart: scheduleDate?.substring(0, 10)
        });
        
        if (scheduleDate === formattedDate) return true;
        
        if (scheduleDate.substring(0, 10) === formattedDate) return true;
        
        try {
          const dateObj = new Date(scheduleDate);
          const compareDate = new Date(formattedDate);
          return dateObj.toDateString() === compareDate.toDateString();
        } catch (e) {
          return false;
        }
      });

      console.log('After filtering - found schedules:', todaysSchedules.length);
      
      if (todaysSchedules.length > 0) {
        console.log(`Found ${todaysSchedules.length} schedules for today`);
        
        let allTasks = [];
        
        todaysSchedules.forEach(schedule => {
          console.log('Processing schedule:', schedule.WS_Id);
          
          if (schedule.tasks && Array.isArray(schedule.tasks) && schedule.tasks.length > 0) {
            const scheduleTasks = schedule.tasks.map(task => ({
              time: formatTime(schedule.Start_Time || schedule.startTime),
              task: task.Task_Description || task.description || 'No description',
              priority: getPriorityFromTask(task),
              scheduleId: schedule.WS_Id
            }));
            
            allTasks = [...allTasks, ...scheduleTasks];
          }
        });
        
        allTasks.sort((a, b) => {
          return a.time.localeCompare(b.time);
        });
        
        console.log(`Combined ${allTasks.length} tasks from all schedules`);
        dailySchedule.value = allTasks;
      } else {
        console.log('No schedule found for today in the data');
        dailySchedule.value = [];
      }
    } else {
      console.log('No schedule data returned from API');
      dailySchedule.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch daily schedule:', error);
    console.error('Error details:', error.response?.data || 'No error details');
    dailySchedule.value = [];
  } finally {
    loading.value = false;
  }
};

// Helper function to determine priority
const getPriorityFromTask = (task) => {
  // Implement your priority logic based on task attributes
  return 'normal';  // Default priority
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Watch for date changes and update data
watch(selectedDate, () => {
  fetchDailySchedule();
});

// Fetch initial data on component mount
onMounted(() => {
  fetchDailySchedule();
});

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

const createNewSchedule = () => {
  router.push(`/daily-schedule?date=${selectedDate.value.toISOString().split('T')[0]}`);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
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
</style>