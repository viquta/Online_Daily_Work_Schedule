<template>
  <div class="schedule-layout">
    <div class="schedule-content">
      <WorkScheduleTable 
        :month="currentMonth" 
        :year="currentYear" 
        class="schedule-table-container" 
      />
    </div>
    <div class="summary-container">
      <SummaryPanel />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import WorkScheduleTable from './workScheduleTable.vue';
import SummaryPanel from './summaryPanel.vue';

const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.schedule-layout {
  display: flex;
  height: calc(100vh - 60px); /* Adjust based on your app's header/footer */
  width: 100%;
  gap: 20px;
}

.schedule-content {
  flex: 1;
  min-width: 0; /* Ensures flex items can shrink below content size */
  overflow-x: auto;
}

.summary-container {
  width: 350px; /* Fixed width for the summary panel */
  min-width: 300px; /* Minimum width */
  border-left: 1px solid #ddd;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .schedule-layout {
    flex-direction: column;
    height: auto;
  }
  
  .schedule-content {
    width: 100%;
  }
  
  .summary-container {
    width: 100%;
    border-left: none;
    border-top: 1px solid #ddd;
  }
}
</style>
