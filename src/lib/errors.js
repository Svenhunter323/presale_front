// Map contract error names to user-friendly messages
export const ERROR_MESSAGES = {
  StageOverflow: 'Amount exceeds current stage cap. Please reduce your purchase amount.',
  CapExceeded: 'Sale cap has been reached. No more tokens available.',
  MinNotMet: 'Purchase amount is below the minimum required.',
  MaxExceeded: 'Purchase amount exceeds your wallet limit.',
  SaleNotLive: 'Sale is not currently active.',
  PausedErr: 'Sale is temporarily paused.',
  BadAmount: 'Invalid purchase amount.',
  BadConfig: 'Invalid configuration detected.',
  
  // Additional common errors
  InsufficientBalance: 'Insufficient balance for this transaction.',
  InsufficientAllowance: 'Please approve USDT spending first.',
  UserRejectedRequest: 'Transaction was rejected by user.',
  TransactionFailed: 'Transaction failed. Please try again.',
  NetworkError: 'Network error. Please check your connection.',
  ChainMismatch: 'Please switch to the correct network.',
}

// Extract error message from various error types
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred'
  
  // Handle string errors
  if (typeof error === 'string') {
    return error
  }
  
  // Handle contract revert errors
  if (error.name && ERROR_MESSAGES[error.name]) {
    return ERROR_MESSAGES[error.name]
  }
  
  // Handle wagmi/viem errors
  if (error.shortMessage) {
    return error.shortMessage
  }
  
  if (error.message) {
    const message = error.message.toLowerCase()
    
    // User rejected transaction
    if (message.includes('user rejected') || message.includes('user denied')) {
      return ERROR_MESSAGES.UserRejectedRequest
    }
    
    // Insufficient balance
    if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
      return ERROR_MESSAGES.InsufficientBalance
    }
    
    // Network errors
    if (message.includes('network') || message.includes('connection')) {
      return ERROR_MESSAGES.NetworkError
    }
    
    // Chain mismatch
    if (message.includes('chain') || message.includes('network')) {
      return ERROR_MESSAGES.ChainMismatch
    }
    
    return error.message
  }
  
  // Handle error objects with details
  if (error.details) {
    return getErrorMessage(error.details)
  }
  
  // Handle nested errors
  if (error.cause) {
    return getErrorMessage(error.cause)
  }
  
  return 'An unexpected error occurred'
}

// Check if error is user-actionable
export const isUserActionableError = (error) => {
  const message = getErrorMessage(error).toLowerCase()
  
  const actionableKeywords = [
    'insufficient balance',
    'approve',
    'allowance',
    'switch network',
    'connect wallet',
    'rejected',
    'denied',
    'reduce',
    'increase',
  ]
  
  return actionableKeywords.some(keyword => message.includes(keyword))
}

// Get error severity level
export const getErrorSeverity = (error) => {
  const message = getErrorMessage(error).toLowerCase()
  
  // High severity - system/contract issues
  if (message.includes('contract') || message.includes('network') || message.includes('failed')) {
    return 'high'
  }
  
  // Medium severity - user action required
  if (message.includes('insufficient') || message.includes('approve') || message.includes('switch')) {
    return 'medium'
  }
  
  // Low severity - user choice/validation
  if (message.includes('rejected') || message.includes('invalid') || message.includes('exceed')) {
    return 'low'
  }
  
  return 'medium'
}
