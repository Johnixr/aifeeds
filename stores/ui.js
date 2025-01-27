import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    showModalBackdrop: false
  }),

  actions: {
    setModalBackdrop(show) {
      this.showModalBackdrop = show
    }
  }
})
