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
          <td>
            <div class="d-flex justify-content-between align-items-center">
              {{ item.task }}
              <div class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          </td>
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
        <i class="bi bi-plus-circle"></i> Add New Task
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const selectedDate = ref(new Date());

// Default daily schedule - this would normally be fetched from your API
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
  // In a real app, you would fetch schedule for the new date here
};

const goToNextDay = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() + 1);
  selectedDate.value = newDate;
  // In a real app, you would fetch schedule for the new date here
};

const addNewTask = () => {
  // This would open a modal or form to add a new task
  alert('Add new task functionality would go here');
};
</script>

<style scoped>
.action-buttons {
  visibility: hidden;
}

tr:hover .action-buttons {
  visibility: visible;
}

.table th, .table td {
  vertical-align: middle;
}

.badge {
  font-size: 0.8rem;
  padding: 0.35em 0.65em;
}
</style>