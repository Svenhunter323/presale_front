// src/lib/transactions.js
import { toast } from 'sonner'
import { getBscScanTxUrl } from './env.js'

export function createTransactionHandler() {
  const handleTransaction = async (txPromise, options = {}) => {
    const {
      pendingMessage = 'Transaction pending...',
      successMessage = 'Transaction successful!',
      errorMessage = 'Transaction failed',
      onSuccess,
      onError
    } = options

    let toastId = null

    try {
      // Show pending toast
      toastId = toast.loading(pendingMessage)

      // Wait for transaction
      const hash = await txPromise
      
      // Update to success toast with BSC scan link
      toast.success(successMessage, {
        id: toastId,
        description: 'Transaction completed successfully',
        action: {
          label: 'View on BSCScan',
          onClick: () => window.open(getBscScanTxUrl(hash), '_blank')
        }
      })

      onSuccess?.(hash)
      return hash
    } catch (error) {
      console.error('Transaction error:', error)
      
      // Parse error message
      let message = errorMessage
      if (error?.message) {
        if (error.message.includes('User rejected')) {
          message = 'Transaction cancelled by user'
        } else if (error.message.includes('insufficient funds')) {
          message = 'Insufficient funds'
        } else if (error.message.includes('gas')) {
          message = 'Gas estimation failed'
        } else {
          // Try to extract revert reason
          const revertMatch = error.message.match(/revert (.+?)(?:\n|$)/)
          if (revertMatch) {
            message = `Transaction reverted: ${revertMatch[1]}`
          }
        }
      }

      toast.error(message, { id: toastId })
      onError?.(error)
      throw error
    }
  }

  return { handleTransaction }
}
