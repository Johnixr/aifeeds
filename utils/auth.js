// Check if running in WeChat browser
export function isWechat() {
  if (process.client) {
    return /MicroMessenger/i.test(navigator.userAgent)
  }
  return false
}

// Get and remove URL parameter
export function getUrlParamAndRemove(param) {
  if (!process.client) return null
  
  const url = new URL(window.location.href)
  const value = url.searchParams.get(param)
  url.searchParams.delete(param)
  window.history.replaceState({}, '', url)
  return value
}

// Redirect for WeChat OAuth
export function redirect4WXCode() {
  if (!process.client) return
  
  const currentUrl = window.location.href
  const encodedUrl = encodeURIComponent(currentUrl)
  const newUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb8f3b3a83e59d5eb&redirect_uri=${encodedUrl}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`
  window.location.href = newUrl
}

// Fetch OpenID from server
export async function fetchOpenid(code) {
  try {
    const response = await fetch(`/api/openid/${code}`, {
      method: 'POST'
    })
    const data = await response.json()
    
    if (data.code === 1) {
      return data.data.openid
    } else {
      throw new Error(data.msg)
    }
  } catch (error) {
    console.error('Error fetching openid:', error)
    throw error
  }
}

// Get user info from server
export async function fetchUserInfo(openid) {
  if (!openid) {
    return {
      isVip: 0,
      vipExpire: null,
      token: null
    }
  }

  try {
    const response = await getUserInfo(openid)
    const userStore = useUserStore()
    const userInfo = {
      isVip: response.data.isVip,
      vipExpire: response.data.vipExpireAt,
      token: response.data.token
    }
    userStore.setUserInfo(userInfo)
    return userInfo
  } catch (error) {
    console.error('Error fetching user info:', error)
    throw error
  }
}

// Process QR code token
export async function processQrcodeToken(openid) {
  const qrcodeToken = getUrlParamAndRemove('qrcodeToken')
  if (!qrcodeToken) return
  
  try {
    const response = await fetch(`/api/login/qrcode/${qrcodeToken}`, {
      headers: {
        'X-Openid': openid
      }
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to process QR code')
    }
  } catch (error) {
    console.error('Error processing QR code:', error)
    throw error
  }
}

import { getWxPayInfo } from '~/api/payment'
import { getUserInfo } from '~/api/user'

// Process subscription trigger
export async function processSubscriptionTrigger(openid) {
  const trigSubscribe = getUrlParamAndRemove('trigSubscribe')
  if (trigSubscribe !== '1' || !isWechat()) return false

  try {
    const data = await getWxPayInfo(openid)
    if (data.code === 1) {
      return await triggerWechatPay(data.data.payInfo)
    }
    return false
  } catch (error) {
    console.error('Error getting payment info:', error)
    return false
  }
}

// Trigger WeChat payment
export function triggerWechatPay(payInfo) {
  if (!process.client) return Promise.reject(new Error('Not in client'))
  
  return new Promise((resolve, reject) => {
    if (typeof WeixinJSBridge === 'undefined') {
      reject(new Error('WeixinJSBridge not found'))
      return
    }

    WeixinJSBridge.invoke(
      'getBrandWCPayRequest',
      payInfo,
      function(res) {
        if (res.err_msg === "get_brand_wcpay_request:ok") {
          resolve(true)
        } else {
          reject(new Error('Payment failed'))
        }
      }
    )
  })
}

// Generate random token
export function generateToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36)
}
