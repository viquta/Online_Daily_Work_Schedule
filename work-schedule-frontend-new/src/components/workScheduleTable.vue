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
  </style>