// src/lib/api.js
import { API_BASE } from './env.js'

// Generic fetch wrapper with error handling
async function request(path, { method = 'GET', body, signal } = {}) {
  const url = `${API_BASE}${path}`
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // For admin JWT cookies
    signal,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)
    
    // Parse JSON response
    let data
    try {
      data = await response.json()
    } catch {
      data = { ok: false, message: 'Invalid response format' }
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }
    
    return { ok: true, data, ...data }
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// API client
export const api = {
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  post: (path, body, options = {}) => request(path, { method: 'POST', body, ...options }),
  del: (path, body, options = {}) => request(path, { method: 'DELETE', body, ...options }),
}

// Email subscription
export const subscribeEmail = async (data) => {
  return api.post('/v1/email/subscribe', {
    email: data.email,
    wallet: data.wallet || null,
    referrer: data.referrer || null,
    utm: data.utm || null,
  })
}

// Social connect
export const connectSocial = async (data) => {
  return api.post('/v1/social/connect', {
    platform: data.platform, // 'twitter', 'telegram', 'discord'
    wallet: data.wallet,
    username: data.username || null,
    userId: data.userId || null,
  })
}

// Referral registration
export const registerReferral = async (data) => {
  return api.post('/v1/referrals/register', {
    referrer: data.referrer,
    referee: data.referee,
    txHash: data.txHash || null,
  })
}

// Log referral touch
export const logReferralTouch = async (data) => {
  try {
    return api.post('/v1/referrals/touch', {
      referrer: data.referrer,
      visitor: data.visitor || null,
      userAgent: navigator.userAgent,
    })
  } catch (error) {
    console.error('Failed to log referral touch:', error)
    // Don't throw error for referral logging failures
    return null
  }
}

// Log transaction
export const logTransaction = async (data) => {
  try {
    return api.post('/v1/transactions/log', {
      type: data.type, // 'buy_native', 'buy_usdt', 'claim', 'refund'
      hash: data.hash,
      address: data.address,
      amount: data.amount || null,
      token: data.token || null,
      referrer: data.referrer || null,
    })
  } catch (error) {
    console.error('Failed to log transaction:', error)
    // Don't throw error for logging failures
    return null
  }
}

// Admin authentication functions
export const adminAuth = {
  // Get challenge for wallet signature
  async getChallenge(address) {
    return api.post('/v1/admin/auth/challenge', { address })
  },

  // Verify signature and get JWT
  async verify(address, signature, message) {
    return api.post('/v1/admin/auth/verify', {
      address,
      signature,
      message
    })
  },

  // Check current auth status
  async status() {
    try {
      return api.get('/v1/admin/auth/status')
    } catch {
      return { ok: false, authenticated: false }
    }
  },

  // Logout
  async logout() {
    return api.post('/v1/admin/auth/logout')
  }
}

// Admin metrics and data
export const adminData = {
  // Get overview metrics
  async getMetrics() {
    return api.get('/v1/admin/metrics')
  },

  // Get transaction logs
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/v1/admin/transactions${query ? `?${query}` : ''}`)
  },

  // Get user data
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/v1/admin/users${query ? `?${query}` : ''}`)
  },

  // Get referral data
  async getReferrals(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/v1/admin/referrals${query ? `?${query}` : ''}`)
  }
}

// Error handling for admin calls
export const handleAdminError = (err) => {
  if (err.message?.includes('401') || err.message?.includes('403')) {
    // Force re-login on auth errors
    window.location.reload()
    return
  }
  throw err
}

// Wrapper for admin API calls with error handling
export const adminCall = async (fn) => {
  try {
    return await fn()
  } catch (err) {
    handleAdminError(err)
  }
}

export default api
