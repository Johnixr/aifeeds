import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    openid: 'guest',  // 默认为 guest
    userInfo: null,
  }),

  getters: {
    isLoggedIn: (state) => state.openid !== 'guest',
    isVip: (state) => state.userInfo?.isVip === 1,
    avatarUrl: (state) => state.userInfo?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=guest',
    vipExpire: (state) => state.userInfo?.vipExpire,
    token: (state) => state.userInfo?.token,
  },

  actions: {
    setOpenid(openid) {
      this.openid = openid
      if (process.client && openid !== 'guest') {
        localStorage.setItem('openid', openid)
      }
    },

    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },

    clearUserData() {
      this.openid = 'guest'
      this.userInfo = null
      if (process.client) {
        localStorage.removeItem('openid')
      }
    },

    initFromStorage() {
      if (process.client) {
        const storedOpenid = localStorage.getItem('openid')
        this.openid = storedOpenid || 'guest'
      }
    }
  },
})
