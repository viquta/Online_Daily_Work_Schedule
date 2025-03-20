<!-- filepath: c:\Users\Victo\Documents\GitHub\Online_Work_Schedule2\client\src\components\MonthlySchedule.vue -->
<template>
  <div>
    <div class="month-navigation d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="goToPreviousMonth">
        <i class="bi bi-chevron-left"></i> Previous
      </button>
      <h3 class="mb-0">{{ monthYearDisplay }}</h3>
      <button class="btn btn-outline-secondary" @click="goToNextMonth">
        Next <i class="bi bi-chevron-right"></i>
      </button>
    </div>
    
    <div class="calendar-container">
      <table class="table table-bordered calendar">
        <thead>
          <tr>
            <th v-for="day in weekDays" :key="day" class="text-center">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in calendarDays" :key="'week-' + weekIndex">
            <td 
              v-for="(day, dayIndex) in week" 
              :key="'day-' + dayIndex"
              :class="[
                'calendar-day', 
                day ? '' : 'empty-day',
                isToday(day) ? 'today' : ''
              ]"
            >
              <div v-if="day" class="day-content">
                <div class="day-number">{{ day.getDate() }}</div>
                <div class="day-events">
                  <div 
                    v-for="(event, eventIndex) in getEventsForDay(day)" 
                    :key="'event-' + eventIndex" 
                    :class="['event-pill', 'bg-' + event.color]"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentMonth = ref(new Date());
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Create a date object from current year and month plus specified day
const createDate = (day) => {
  return new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth(),
    day
  );
};

// Sample events data
const events = ref([
  { date: createDate(5), title: 'Team Meeting', color: 'primary' },
  { date: createDate(12), title: 'Project Deadline', color: 'danger' },
  { date: createDate(15), title: 'Client Call', color: 'warning' },
  { date: createDate(20), title: 'Training', color: 'info' },
  { date: createDate(25), title: 'Vacation', color: 'success' },
  { date: createDate(26), title: 'Vacation', color: 'success' }
]);

const monthYearDisplay = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
});

const calendarDays = computed(() => {
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
  const calendar = [];
  let week = [];
  
  // Fill in empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push(null);
  }
  
  // Fill in days of month
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    
    // Start new week when we reach Sunday or end of month
    if ((firstDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
      calendar.push(week);
      week = [];
    }
  }
  
  // Fill in empty cells at end if needed
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    calendar.push(week);
  }
  
  return calendar;
});

const isToday = (day) => {
  if (!day) return false;
  
  const today = new Date();
  return day.getDate() === today.getDate() && 
         day.getMonth() === today.getMonth() && 
         day.getFullYear() === today.getFullYear();
};

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

const getEventsForDay = (day) => {
  if (!day) return [];
  return events.value.filter(event => isSameDay(event.date, day));
};

const goToPreviousMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentMonth.value = newDate;
  updateEvents();
};

const goToNextMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentMonth.value = newDate;
  updateEvents();
};

// Update events when month changes
const updateEvents = () => {
  events.value = [
    { date: createDate(5), title: 'Team Meeting', color: 'primary' },
    { date: createDate(12), title: 'Project Deadline', color: 'danger' },
    { date: createDate(15), title: 'Client Call', color: 'warning' },
    { date: createDate(20), title: 'Training', color: 'info' },
    { date: createDate(25), title: 'Vacation', color: 'success' },
    { date: createDate(26), title: 'Vacation', color: 'success' }
  ];
};
</script>

<style scoped>
.calendar {
  table-layout: fixed;
}

.calendar-day {
  height: 100px;
  width: 14.28%;
  padding: 5px;
  vertical-align: top;
}

.empty-day {
  background-color: #f9f9f9;
}

.today {
  background-color: #e6f7ff;
}

.day-number {
  font-weight: bold;
  margin-bottom: 5px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-pill {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.75rem;
  color: white;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>