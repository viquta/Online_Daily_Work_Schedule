import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ],
    currentUser: 1,
  }),
  actions: {
    getVacationEntitlement(userId) {
      // Implement logic to fetch vacation entitlement for the user
      return 20
    },
  },
})
