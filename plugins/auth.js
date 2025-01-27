import { isWechat, getUrlParamAndRemove, redirect4WXCode, fetchOpenid, fetchUserInfo, processQrcodeToken, processSubscriptionTrigger, triggerWechatPay } from '~/utils/auth'
import { useUserStore } from '~/stores/user'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client-side
  if (!process.client) return

  const userStore = useUserStore()

  // Initialize user store from localStorage
  userStore.initFromStorage()

  // Get OpenID
  async function getOpenid() {
    // In WeChat browser, always try to get real openid
    if (isWechat()) {
      // If we already have a non-guest openid, use it
      const storedOpenid = localStorage.getItem('openid')
      if (storedOpenid) {
        userStore.setOpenid(storedOpenid)
        return storedOpenid
      }

      // Get code from URL if exists
      const code = getUrlParamAndRemove('code')
      if (!code) {
        redirect4WXCode()
        return null
      }

      try {
        const openid = await fetchOpenid(code)
        userStore.setOpenid(openid)
        return openid
      } catch (error) {
        console.error('Error getting openid:', error)
        return 'guest'  // 不存储 guest
      }
    }

    // If not in WeChat browser, use stored openid or set as guest
    if (userStore.openid) return userStore.openid
    userStore.setOpenid('guest')
    return 'guest'
  }

  // Initialize user data
  async function init() {
    try {
      const openid = await getOpenid()
      if (!openid) return // Redirecting for WeChat code

      // Process QR code token if exists
      await processQrcodeToken(openid)

      // Get user info
      const userInfo = await fetchUserInfo(openid)
      userStore.setUserInfo(userInfo)

      // Process subscription trigger
      const payInfo = await processSubscriptionTrigger(openid)
      if (payInfo) {
        try {
          await triggerWechatPay(payInfo)
          const language = document.documentElement.lang || 'zh'
          window.location.href = `https://agihunt.cuckoos.info/feeds/ai/${language}`
        } catch (error) {
          console.error('Payment failed:', error)
        }
      }
    } catch (error) {
      console.error('Error in init:', error)
    }
  }

  // Run initialization
  await init()
})
