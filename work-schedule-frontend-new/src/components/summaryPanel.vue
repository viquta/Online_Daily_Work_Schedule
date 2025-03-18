<template>
    <div class="summary-panel">
      <div class="user-section">
        <select v-model="selectedUser" class="user-select">
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
        
        <div class="month-select">
          <button @click="previousMonth">&lt;</button>
          <span>{{ formattedMonth }}</span>
          <button @click="nextMonth">&gt;</button>
        </div>
        
        <div class="action-buttons">
          <button class="btn primary">Work Time Settings</button>
          <button class="btn secondary">BV</button>
        </div>
      </div>
      
      <!-- Ready for Review Section -->
      <div class="review-section">
        <div class="review-checkbox">
          <input type="checkbox" id="readyForReview" v-model="readyForReview">
          <label for="readyForReview">Ready for Review</label>
        </div>
        <button v-if="readyForReview" class="btn submit-btn">Submit for Review</button>
      </div>

      <div class="summary-section">
        <h3>Overtime</h3>
        <div class="summary-row">
          <span>Month:</span>
          <span>{{ overtimeMonth }}</span>
        </div>
        <div class="summary-row">
          <span>Year:</span>
          <span>{{ overtimeYear }}</span>
        </div>
        
        <h3>Vacation Days</h3>
        <div class="summary-row">
          <span>Entitlement:</span>
          <span>{{ vacationEntitlement }}</span>
        </div>
        <div class="summary-row">
          <span>Used in Month:</span>
          <span>{{ vacationUsedMonth }}</span>
        </div>
        <div class="summary-row">
          <span>Used in Year:</span>
          <span>{{ vacationUsedYear }}</span>
        </div>
        <div class="summary-row">
          <span>Remaining Balance:</span>
          <span :class="{ negative: vacationBalance < 0 }">{{ vacationBalance }}</span>
        </div>
        <button class="btn full-width">Vacation Request Form</button>
        
        <h3>Total Hours</h3>
        <div class="summary-row">
          <span>Required Total Hours:</span>
          <span>{{ requiredTotalHours }}</span>
        </div>
        <div class="summary-row">
          <span>Previous Carryover:</span>
          <span>{{ previousCarryover }}</span>
        </div>
        <div class="summary-row">
          <span>Actual Worked Hours:</span>
          <span>{{ actualWorkedHours }}</span>
        </div>
        <div class="summary-row">
          <span>Difference:</span>
          <span :class="{ negative: isDifferenceNegative }">{{ totalDifference }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useScheduleStore } from '../stores/schedule'
  import { useUserStore } from '../stores/user'
  
  const scheduleStore = useScheduleStore()
  const userStore = useUserStore()
  
  const selectedUser = ref(userStore.currentUser)
  const currentMonth = ref(new Date().getMonth())
  const currentYear = ref(new Date().getFullYear())
  const readyForReview = ref(false)
  
  const users = computed(() => userStore.users)
  
  const formattedMonth = computed(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${monthNames[currentMonth.value]} ${currentYear.value}`
  })
  
  const previousMonth = () => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }
  
  const nextMonth = () => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }
  
  // Get summary data from stores
  const overtimeMonth = computed(() => scheduleStore.getMonthOvertime(currentMonth.value, currentYear.value))
  const overtimeYear = computed(() => scheduleStore.getYearOvertime(currentYear.value))
  
  const vacationEntitlement = computed(() => userStore.getVacationEntitlement(selectedUser.value))
  const vacationUsedMonth = computed(() => scheduleStore.getVacationUsedInMonth(selectedUser.value, currentMonth.value, currentYear.value))
  const vacationUsedYear = computed(() => scheduleStore.getVacationUsedInYear(selectedUser.value, currentYear.value))
  const vacationBalance = computed(() => vacationEntitlement.value - vacationUsedYear.value)
  
  const requiredTotalHours = computed(() => scheduleStore.getRequiredHoursForMonth(currentMonth.value, currentYear.value))
  const previousCarryover = computed(() => scheduleStore.getPreviousMonthCarryover(currentMonth.value, currentYear.value))
  const actualWorkedHours = computed(() => scheduleStore.getActualWorkedHours(currentMonth.value, currentYear.value))
  const totalDifference = computed(() => scheduleStore.getTotalDifference(currentMonth.value, currentYear.value))
  const isDifferenceNegative = computed(() => totalDifference.value.startsWith('-'))
  </script>
  
  <style scoped>
  .summary-panel {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    height: 100%;
    width: 100%;
    overflow-y: auto;
  }
  
  .user-section {
    margin-bottom: 20px;
  }
  
  .user-select {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  
  .month-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  
  /* Review section styles */
  .review-section {
    margin: 15px 0;
    padding: 15px;
    background-color: #e9f5e9;
    border-radius: 5px;
    border-left: 4px solid #4caf50;
  }
  
  .review-checkbox {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .review-checkbox input {
    margin-right: 8px;
  }
  
  .submit-btn {
    background-color: #4caf50;
    color: white;
    width: 100%;
  }
  
  .summary-section h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  
  .negative {
    color: red;
  }
  
  .btn {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .primary {
    background-color: #4c6ef5;
    color: white;
  }
  
  .secondary {
    background-color: #eee;
    color: #333;
  }
  
  .full-width {
    width: 100%;
    margin-top: 10px;
    background-color: #4caf50;
    color: white;
  }
  </style>