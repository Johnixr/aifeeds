// User related API calls
import { getHeaders, handleResponse } from './index'

/**
 * Get user information
 * @param {string} openid - User's WeChat openid
 * @returns {Promise<Object>} User information
 */
export async function getUserInfo(openid) {
  const response = await fetch('/api/userinfo', {
    headers: getHeaders(openid)
  })
  return handleResponse(response)
}
