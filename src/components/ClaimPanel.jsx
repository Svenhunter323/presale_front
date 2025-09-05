import { formatTokenAmount } from '../lib/format.js'
import { useCountdown } from '../hooks/useCountdown.js'
import { useClaim } from '../hooks/useClaim.js'
import { useToast } from './Toasts.jsx'
import { clsx } from 'clsx'

export const ClaimPanel = ({ 
  userData, 
  unlockTs, 
  finalized, 
  successful, 
  isValidChain 
}) => {
  const { timeRemaining, isExpired: canClaim } = useCountdown(unlockTs)
  const { success, error: showError, loading: showLoading, dismiss } = useToast()
  
  const {
    claim,
    isLoading: isClaiming,
    isSuccess: claimSuccess,
    error: claimError,
    txUrl: claimTxUrl,
    reset: resetClaim
  } = useClaim()

  if (!userData || !finalized || !successful) {
    return null
  }

  const claimableAmount = userData.claimable
  const hasClaimableTokens = claimableAmount > 0n

  const handleClaim = async () => {
    try {
      const loadingToastId = showLoading('Claiming tokens...')
      const result = await claim()
      dismiss(loadingToastId)
      success('Tokens claimed successfully!', { txUrl: result.txUrl })
    } catch (err) {
      showError(err.message || 'Failed to claim tokens')
    }
  }

  const isDisabled = !isValidChain || !canClaim || !hasClaimableTokens || isClaiming

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Claim Tokens</h3>
      
      {/* Claim Status */}
      <div className="space-y-4 mb-6">
        {!canClaim ? (
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h4 className="font-medium text-yellow-100">Claim Locked</h4>
                <p className="text-sm text-yellow-200">
                  Tokens unlock in: {timeRemaining}
                </p>
              </div>
            </div>
          </div>
        ) : !hasClaimableTokens ? (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h4 className="font-medium text-gray-100">No Tokens to Claim</h4>
                <p className="text-sm text-gray-300">
                  You don't have any tokens available for claiming.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-medium text-green-100">Ready to Claim</h4>
                <p className="text-sm text-green-200">
                  Your tokens are now available for claiming.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Claimable Amount */}
      {hasClaimableTokens && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Available to Claim</div>
            <div className="text-2xl font-bold text-white">
              {formatTokenAmount(claimableAmount)} WAVE
            </div>
          </div>
        </div>
      )}

      {/* User Purchase Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 mb-1">Purchased</div>
          <div className="font-medium text-white">
            {formatTokenAmount(userData.purchasedWave)} WAVE
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 mb-1">Already Claimed</div>
          <div className="font-medium text-white">
            {formatTokenAmount(userData.claimedWave)} WAVE
          </div>
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={isDisabled}
        className={clsx(
          'w-full py-3 px-4 rounded-lg font-medium transition-colors',
          isDisabled
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        )}
      >
        {isClaiming ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Claiming...</span>
          </div>
        ) : !isValidChain ? (
          'Wrong Network'
        ) : !canClaim ? (
          `Unlock in ${timeRemaining}`
        ) : !hasClaimableTokens ? (
          'No Tokens to Claim'
        ) : (
          'Claim Tokens'
        )}
      </button>
    </div>
  )
}
