// API configuration and interceptors

/**
 * Common headers for API requests
 * @param {string} openid - User's WeChat openid
 * @returns {Object} Headers object
 */
export function getHeaders(openid) {
  return {
    'X-Openid': openid
  }
}

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Response data
 */
export async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }
  return data
}
