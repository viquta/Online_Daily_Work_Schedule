<!-- filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\client\src\components\Dashboard.vue -->
<template>
  <div class="container mt-4">
    <div class="card shadow">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2>Work Schedule</h2>
        <div>
          <div class="btn-group me-3">
            <button 
              :class="['btn', viewMode === 'daily' ? 'btn-primary' : 'btn-outline-primary']" 
              @click="viewMode = 'daily'"
            >
              Daily View
            </button>
            <button 
              :class="['btn', viewMode === 'monthly' ? 'btn-primary' : 'btn-outline-primary']" 
              @click="viewMode = 'monthly'"
            >
              Monthly View
            </button>
          </div>
          <button class="btn btn-outline-danger" @click="handleLogout">Logout</button>
        </div>
      </div>
      <div class="card-body">
        <!-- Replace existing content with our new schedule views -->
        <div v-if="viewMode === 'daily'">
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

            <div v-else class="alert alert-info">
              No tasks scheduled for this day.
            </div>

            <!-- Update the Add New Task button to navigate to the daily schedule editor -->
            <div class="text-center mt-4">
              <button class="btn btn-success" @click="router.push(`/daily-schedule?date=${selectedDate.value.toISOString().split('T')[0]}`)">
                <i class="bi bi-plus-circle"></i> Add New Task
              </button>
            </div>
          </div>
        </div>
        
        <div v-else>
          <!-- Monthly Schedule -->
          <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
              <button class="btn btn-outline-secondary" @click="goToPreviousMonth">
                Previous Month
              </button>
              <h3 class="mb-0">{{ monthYear }}</h3>
              <button class="btn btn-outline-secondary" @click="goToNextMonth">
                Next Month
              </button>
            </div>
            
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <table v-else class="table table-bordered">
              <thead class="bg-light">
                <tr>
                  <th v-for="day in weekDays" :key="day" class="text-center">{{ day }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, weekIndex) in calendar" :key="weekIndex">
                  <td 
                    v-for="(day, dayIndex) in week" 
                    :key="dayIndex"
                    class="position-relative"
                    style="height: 100px; vertical-align: top;"
                  >
                    <template v-if="day !== null">
                      <div class="fw-bold mb-2">{{ day }}</div>
                      <div v-for="(event, idx) in eventsForDay(day)" :key="idx" class="mb-1">
                        <span 
                          :class="[
                            'badge',
                            event.type === 'work' ? 'bg-primary' : 
                            event.type === 'meeting' ? 'bg-warning' : 
                            event.type === 'deadline' ? 'bg-danger' : 
                            event.type === 'vacation' ? 'bg-success' : 'bg-info'
                          ]"
                        >
                          {{ event.title }}
                        </span>
                      </div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add buttons to access the editable tables -->
        <div class="mt-4 d-flex justify-content-center gap-3">
          <router-link to="/schedules" class="btn btn-primary">
            <i class="bi bi-table"></i> Edit Monthly Schedule
          </router-link>
          <router-link to="/daily-schedule" class="btn btn-primary">
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
const viewMode = ref('daily'); // Default to daily view
const loading = ref(false);

// For daily schedule
const selectedDate = ref(new Date());
const dailySchedule = ref([]);

// Replace hardcoded data with API fetching
const fetchDailySchedule = async () => {
  loading.value = true;
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0];
    const response = await api.scheduleApi.getScheduleById(formattedDate);
    
    if (response.data && Array.isArray(response.data.tasks)) {
      dailySchedule.value = response.data.tasks.map(task => ({
        time: task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : '',
        task: task.taskDescription || task.Task_Name,
        priority: task.priority || 'normal'
      }));
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

// For monthly schedule
const currentMonth = ref(new Date());
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthlyEvents = ref({});

// Fetch monthly events from API
const fetchMonthlyEvents = async () => {
  loading.value = true;
  try {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth() + 1;
    const response = await api.scheduleApi.getSchedules({ 
      year, 
      month 
    });

    // Transform API data into the format your calendar expects
    const events = {};
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(schedule => {
        const day = new Date(schedule.date).getDate();
        if (!events[day]) events[day] = [];
        
        // Map each task to an event
        schedule.tasks.forEach(task => {
          events[day].push({
            title: task.taskDescription,
            type: mapPriorityToType(task.priority)
          });
        });
      });
    }
    monthlyEvents.value = events;
  } catch (error) {
    console.error('Failed to fetch monthly events:', error);
    monthlyEvents.value = {};
  } finally {
    loading.value = false;
  }
};

// Helper function to map task priority to event type
const mapPriorityToType = (priority) => {
  switch(priority) {
    case 'high': return 'deadline';
    case 'medium': return 'meeting';
    case 'normal': return 'work';
    default: return 'info';
  }
};

// Update eventsForDay to use the reactive monthlyEvents
const eventsForDay = (day) => {
  return monthlyEvents.value[day] || [];
};

// Watch for date/month changes and update data
watch(selectedDate, () => {
  fetchDailySchedule();
});

watch(currentMonth, () => {
  fetchMonthlyEvents();
});

// Fetch initial data on component mount
onMounted(() => {
  fetchDailySchedule();
  fetchMonthlyEvents();
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



const monthYear = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
});

const calendar = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  
  // First day of month
  const firstDay = new Date(year, month, 1);
  // Last day of month
  const lastDay = new Date(year, month + 1, 0);
  
  // Day of week for first day (0 = Sunday)
  const firstDayOfWeek = firstDay.getDay();
  
  // Total days in month
  const daysInMonth = lastDay.getDate();
  
  // Build calendar grid
  const calendarArray = [];
  let week = [];
  
  // Fill in empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push(null);
  }
  
  // Fill in days of month
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    
    // Start new week when we reach Sunday or end of month
    if ((firstDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
      calendarArray.push(week);
      week = [];
    }
  }
  
  // Fill in empty cells at end if needed
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    calendarArray.push(week);
  }
  
  return calendarArray;
});

const goToPreviousMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentMonth.value = newDate;
};

const goToNextMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentMonth.value = newDate;
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