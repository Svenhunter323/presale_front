import { formatTokenAmount, formatBNB, formatUSDT } from '../lib/format.js'
import { useRefund } from '../hooks/useRefund.js'
import { useToast } from './Toasts.jsx'
import { clsx } from 'clsx'

export const RefundPanel = ({ 
  userData, 
  finalized, 
  refundsEnabled, 
  usdtDecimals,
  isValidChain 
}) => {
  const { success, error: showError, loading: showLoading } = useToast()
  
  const {
    refund,
    isLoading: isRefunding,
    isSuccess: refundSuccess,
    error: refundError,
    txUrl: refundTxUrl,
    reset: resetRefund
  } = useRefund()

  if (!userData || !finalized || !refundsEnabled) {
    return null
  }

  const hasPaidNative = userData.paidNative > 0n
  const hasPaidUSDT = userData.paidUSDT > 0n
  const hasRefundableAmount = hasPaidNative || hasPaidUSDT

  const handleRefund = async () => {
    try {
      const loadingToastId = showLoading('Processing refund...')
      const result = await refund()
      showError('', { id: loadingToastId }) // Remove loading toast
      success('Refund processed successfully!', { txUrl: result.txUrl })
    } catch (err) {
      showError(err.message || 'Failed to process refund')
    }
  }

  const isDisabled = !isValidChain || !hasRefundableAmount || isRefunding

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Refund Available</h3>
      
      {/* Refund Status */}
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">💰</span>
          <div>
            <h4 className="font-medium text-red-100">Soft Cap Not Met</h4>
            <p className="text-sm text-red-200">
              The presale did not reach its soft cap. You can claim a full refund of your contributions.
            </p>
          </div>
        </div>
      </div>

      {/* Refundable Amounts */}
      {hasRefundableAmount ? (
        <div className="space-y-4 mb-6">
          <div className="text-sm text-gray-300 mb-3">Your refundable amounts:</div>
          
          <div className="grid gap-3">
            {hasPaidNative && (
              <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">BNB Paid</div>
                  <div className="text-lg font-bold text-white">
                    {formatBNB(userData.paidNative)} BNB
                  </div>
                </div>
                <div className="text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            
            {hasPaidUSDT && (
              <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">USDT Paid</div>
                  <div className="text-lg font-bold text-white">
                    {formatUSDT(userData.paidUSDT, usdtDecimals)} USDT
                  </div>
                </div>
                <div className="text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Total Tokens Purchased (for reference) */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Tokens Purchased</div>
              <div className="text-lg font-medium text-gray-300">
                {formatTokenAmount(userData.purchasedWave)} WAVE
              </div>
              <div className="text-xs text-gray-500 mt-1">
                (Will not be received due to failed soft cap)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-medium text-gray-100">No Refund Available</h4>
              <p className="text-sm text-gray-300">
                You don't have any contributions eligible for refund.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refund Button */}
      <button
        onClick={handleRefund}
        disabled={isDisabled}
        className={clsx(
          'w-full py-3 px-4 rounded-lg font-medium transition-colors',
          isDisabled
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        )}
      >
        {isRefunding ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing Refund...</span>
          </div>
        ) : !isValidChain ? (
          'Wrong Network'
        ) : !hasRefundableAmount ? (
          'No Refund Available'
        ) : (
          'Claim Refund'
        )}
      </button>

      {/* Important Notice */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
        <div className="text-xs text-yellow-200">
          <strong>Important:</strong> Once you claim your refund, you will receive back all your BNB and USDT contributions. 
          This action cannot be undone.
        </div>
      </div>
    </div>
  )
}
