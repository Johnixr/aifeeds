// Payment related API calls
import { getHeaders, handleResponse } from './index'

/**
 * Get WeChat payment information
 * @param {string} openid - User's WeChat openid
 * @returns {Promise<Object>} Payment information
 */
export async function getWxPayInfo(openid) {
  const response = await fetch('/api/subscribe/wxpay/payinfo', {
    headers: getHeaders(openid)
  })
  return handleResponse(response)
}
