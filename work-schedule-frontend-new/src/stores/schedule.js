import { defineStore } from 'pinia'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    holidays: [],
    days: [], // Add this missing property
    // Add other state properties as needed
  }),
  actions: {
    // Add this method
    async fetchDaysForMonth(month, year) {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/schedules/month/${year}/${month}`);
        if (response.ok) {
          const data = await response.json();
          this.days = data;
        }
      } catch (error) {
        console.error('Failed to fetch days:', error);
      }
    },
    getDaysForMonth(month, year) {
      // Implement logic to fetch or calculate days for the given month and year
      return []
    },
    getMonthOvertime(month, year) {
      // Implement logic to calculate overtime for the month
      return 0
    },
    getYearOvertime(year) {
      // Implement logic to calculate overtime for the year
      return 0
    },
    getRequiredHoursForMonth(month, year) {
      // Implement logic to calculate required hours
      return 0
    },
    getPreviousMonthCarryover(month, year) {
      // Implement logic to calculate carryover
      return 0
    },
    getActualWorkedHours(month, year) {
      // Implement logic to calculate worked hours
      return 0
    },
    getTotalDifference(month, year) {
      // Implement logic to calculate total difference
      return '0'
    },
    getVacationUsedInMonth(userId, month, year) {
      // Implement logic to calculate vacation used in the month
      return 0
    },
    getVacationUsedInYear(userId, year) {
      // Implement logic to calculate vacation used in the year
      return 0
    },
    updateDayField(date, field, value) {
      const dayIndex = this.days.findIndex(day => day.date === date);
      if (dayIndex !== -1) {
        this.days[dayIndex][field] = value;
        
        // Save to backend
        this.saveDayUpdate(this.days[dayIndex]);
      }
    },
    async saveDayUpdate(day) {
      try {
        await fetch(`/api/schedules/${day.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(day)
        });
      } catch (error) {
        console.error('Failed to save update:', error);
      }
    }
  },
})
