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

            <table class="table table-striped table-bordered">
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

            <div class="text-center mt-4">
              <button class="btn btn-success">
                Add New Task
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
            
            <table class="table table-bordered">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const viewMode = ref('daily'); // Default to daily view

// For daily schedule
const selectedDate = ref(new Date());
const dailySchedule = ref([
  { time: '08:00 - 09:00', task: 'Team Meeting', priority: 'high' },
  { time: '09:00 - 10:30', task: 'Project Planning', priority: 'medium' },
  { time: '10:30 - 12:00', task: 'Development', priority: 'high' },
  { time: '12:00 - 13:00', task: 'Lunch Break', priority: 'normal' },
  { time: '13:00 - 15:30', task: 'Client Meeting', priority: 'high' },
  { time: '15:30 - 17:00', task: 'Code Review', priority: 'medium' }
]);

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

// For monthly schedule
const currentMonth = ref(new Date());
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

// Sample monthly events
const monthlyEvents = {
  5: [{ title: 'Team Meeting', type: 'work' }],
  12: [{ title: 'Project Deadline', type: 'deadline' }],
  15: [{ title: 'Client Call', type: 'meeting' }],
  20: [{ title: 'Training', type: 'work' }],
  25: [{ title: 'Vacation', type: 'vacation' }],
  26: [{ title: 'Vacation', type: 'vacation' }]
};

const eventsForDay = (day) => {
  return monthlyEvents[day] || [];
};

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