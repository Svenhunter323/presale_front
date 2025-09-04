import { formatUnits, parseUnits } from 'viem'

// Format bigint values for display
export const formatTokenAmount = (value, decimals = 18, displayDecimals = 4) => {
  if (!value) return '0'
  
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  
  if (num === 0) return '0'
  if (num < 0.0001) return '<0.0001'
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  })
}

// Format native currency (BNB)
export const formatBNB = (value, displayDecimals = 4) => {
  return formatTokenAmount(value, 18, displayDecimals)
}

// Format USDT with dynamic decimals
export const formatUSDT = (value, decimals = 18, displayDecimals = 2) => {
  return formatTokenAmount(value, decimals, displayDecimals)
}

// Format bigint values for input fields (no commas)
export const formatTokenAmountForInput = (value, decimals = 18, displayDecimals = 4) => {
  if (!value) return '0'
  
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  
  if (num === 0) return '0'
  if (num < 0.0001) return '0.0001'
  
  return num.toFixed(displayDecimals).replace(/\.?0+$/, '')
}

// Format percentage
export const formatPercentage = (value, total, decimals = 2) => {
  if (!total || total === 0n) return '0'
  
  const percentage = (Number(value) / Number(total)) * 100
  return percentage.toFixed(decimals)
}

// Parse user input to bigint
export const parseTokenInput = (input, decimals = 18) => {
  if (!input || input === '') return 0n
  
  try {
    return parseUnits(input.toString(), decimals)
  } catch {
    return 0n
  }
}

// Clamp value between min and max
export const clampBigInt = (value, min = 0n, max = null) => {
  if (value < min) return min
  if (max !== null && value > max) return max
  return value
}

// Shorten address for display
export const shortenAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

// Format time remaining
export const formatTimeRemaining = (timestamp) => {
  const now = Math.floor(Date.now() / 1000)
  const target = Number(timestamp)
  const diff = target - now
  
  if (diff <= 0) return { expired: true, text: 'Expired' }
  
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  
  if (days > 0) {
    return { expired: false, text: `${days}d ${hours}h ${minutes}m` }
  } else if (hours > 0) {
    return { expired: false, text: `${hours}h ${minutes}m ${seconds}s` }
  } else if (minutes > 0) {
    return { expired: false, text: `${minutes}m ${seconds}s` }
  } else {
    return { expired: false, text: `${seconds}s` }
  }
}

// Format large numbers with K, M, B suffixes
export const formatCompactNumber = (value, decimals = 18) => {
  const num = Number(formatUnits(value, decimals))
  
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  
  return num.toFixed(2)
}

// Validate Ethereum address
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Convert status enum to string
export const getStatusText = (status) => {
  const statusMap = {
    0: 'Not Started',
    1: 'Live',
    2: 'Ended',
    3: 'Paused',
  }
  return statusMap[status] || 'Unknown'
}

// Calculate current stage from stages array and sold amount
export const getCurrentStage = (stages, soldWave) => {
  if (!stages || stages.length === 0) return null
  
  let cumulativeCap = 0n
  
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    cumulativeCap += stage.capWave
    
    if (soldWave < cumulativeCap) {
      return {
        index: i,
        ...stage,
        soldInStage: soldWave - (cumulativeCap - stage.capWave),
        remainingInStage: cumulativeCap - soldWave,
      }
    }
  }
  
  // All stages sold out
  return null
}

// Calculate maximum purchase for current stage
export const getMaxPurchaseForStage = (currentStage) => {
  if (!currentStage) return 0n
  return currentStage.remainingInStage
}
