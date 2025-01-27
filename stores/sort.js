import { defineStore } from 'pinia'

export const useSortStore = defineStore('sort', {
  state: () => ({
    sortByHot: false, // false 表示按最新排序，true 表示按热度排序
  }),
  actions: {
    toggleSortByHot() {
      this.sortByHot = !this.sortByHot
    },
  },
})
