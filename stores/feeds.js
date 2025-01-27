import { defineStore } from 'pinia'
import { useUserStore } from '~/stores/user'

export const useFeedsStore = defineStore('feeds', {
  state: () => ({
    events: [],
    loading: false,
    error: null,
    currentDomain: null,
    sortBy: 'latest', // 'latest' or 'hot'
    selectedTag: '全部',
    scrollPositions: {}, // 存储每个路由的滚动位置
    // 添加数据缓存
    dataCache: new Map(), // 用于缓存已加载的数据
    currentKey: null, // 当前数据的缓存键
  }),

  getters: {
    getTags: (state) => {
      // Count tag frequencies and track first appearance
      const tagStats = new Map()
      let order = 0
      
      state.events.forEach(event => {
        if (event.tags) {
          event.tags.forEach(tag => {
            if (!tagStats.has(tag)) {
              tagStats.set(tag, { count: 1, firstAppearance: order++ })
            } else {
              const stat = tagStats.get(tag)
              stat.count++
            }
          })
        }
      })

      // Convert to array and sort by frequency and appearance order
      const sortedTags = Array.from(tagStats.entries())
        .sort(([, a], [, b]) => {
          if (b.count !== a.count) {
            return b.count - a.count
          }
          return a.firstAppearance - b.firstAppearance
        })
        .map(([tag]) => tag)

      // Add "全部" at the beginning
      return ['全部', ...sortedTags]
    },
    sortedEvents: (state) => {
      if (state.sortBy === 'latest') {
        return [...state.events].sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
      } else {
        return [...state.events].sort((a, b) => b.hotValue - a.hotValue)
      }
    },

    filteredEvents: (state) => {
      if (state.selectedTag === '全部') {
        return state.sortedEvents
      }
      // TODO: 根据tag过滤事件
      return state.sortedEvents
    }
  },

  actions: {
    async fetchEvents({ domain, date, language }) {
      this.loading = true
      this.error = null
      this.currentDomain = domain
      
      // 生成缓存键
      const cacheKey = `${domain}/${date}_${language}`
      this.currentKey = cacheKey

      // 检查缓存中是否已有数据
      if (this.dataCache.has(cacheKey)) {
        this.events = this.dataCache.get(cacheKey)
        this.loading = false
        return
      }
      
      try {
        // 在服务端和客户端都使用完整的 URL
        const baseUrl = process.client ? window.location.origin : 'http://localhost:3000'
        const url = `${baseUrl}/data/${domain}/${date}_${language}.json`
        
        // Get token from userStore
        const userStore = useUserStore()
        const headers = {
          'X-dtoken': userStore.userInfo ? userStore.userInfo.token || '' : ''
        }
        
        const response = await fetch(url, {
          headers
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        this.events = data
        // 将数据存入缓存
        this.dataCache.set(cacheKey, data)
      } catch (err) {
        console.error('Error fetching events:', err)
        this.error = err.message
        this.events = []
      } finally {
        this.loading = false
      }
    },

    // 检查并获取特定事件数据
    async fetchEventIfNeeded({ domain, date, language, eventId }) {
      // 如果当前没有事件数据，先获取该日期的所有事件
      if (this.events.length === 0) {
        await this.fetchEvents({ domain, date, language })
      }
      
      // 在现有事件中查找目标事件
      const event = this.events.find(e => e.eventId === eventId)
      if (!event) {
        this.error = '未找到对应的事件'
        return null
      }
      return event
    },

    setSortBy(sort) {
      this.sortBy = sort
    },

    setSelectedTag(tag) {
      this.selectedTag = tag
    },
    
    // 保存滚动位置
    saveScrollPosition(routeKey, position) {
      this.scrollPositions[routeKey] = position
    },

    // 获取滚动位置
    getScrollPosition(routeKey) {
      return this.scrollPositions[routeKey] || 0
    }
  }
})
