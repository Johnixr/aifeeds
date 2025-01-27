import { defineStore } from 'pinia'

export const useDropdownStore = defineStore('dropdown', {
  state: () => ({
    activeDropdown: null
  }),
  actions: {
    setActiveDropdown(id) {
      this.activeDropdown = id
    },
    closeAll() {
      this.activeDropdown = null
    }
  }
})
