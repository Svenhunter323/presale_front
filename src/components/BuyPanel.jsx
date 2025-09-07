import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { formatTokenAmount, formatTokenAmountForInput, formatUSDT, parseTokenInput, getMaxPurchaseForStage } from '../lib/format.js'
import { useBuyNative } from '../hooks/useBuyNative.js'
import { useBuyUSDT } from '../hooks/useBuyUSDT.js'
import { useToast } from './Toasts.jsx'
import { clsx } from 'clsx'
import { AlertTriangle, X } from 'lucide-react'

export const BuyPanel = ({ 
  currentStage, 
  usdtDecimals, 
  usdtBalance, 
  usdtAllowance, 
  referrer,
  isValidChain,
  status,
  termsAccepted,
  onTermsChange 
}) => {
  const { address, isConnected } = useAccount()
  const { success, error: showError, loading: showLoading, dismiss } = useToast()
  
  const [activeTab, setActiveTab] = useState('bnb')
  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  
  const {
    buyWithNative,
    isLoading: isBuyingNative,
    isSuccess: nativeBuySuccess,
    error: nativeBuyError,
    txUrl: nativeTxUrl,
    reset: resetNative
  } = useBuyNative()
  
  const {
    approveUSDT,
    buyWithUSDT,
    isLoading: isBuyingUSDT,
    isSuccess: usdtBuySuccess,
    error: usdtBuyError,
    txUrl: usdtTxUrl,
    step: usdtStep,
    reset: resetUSDT
  } = useBuyUSDT()

  // Calculate receive amount when pay amount changes
  useEffect(() => {
    if (!payAmount || !currentStage) {
      setReceiveAmount('')
      return
    }

    setIsCalculating(true)
    
    try {
      const payAmountBigInt = parseTokenInput(payAmount, activeTab === 'bnb' ? 18 : usdtDecimals)

      if (payAmountBigInt === 0n) {
        setReceiveAmount('')
        return
      }

      let waveAmount = 0n
      
      if (activeTab === 'bnb') {
        // Calculate WAVE from BNB: payAmount / priceNative (e.g., 0.5 BNB / 0.0015 BNB per WAVE = 333.33 WAVE)
        waveAmount = (payAmountBigInt * parseUnits('1', 18)) / currentStage.priceNativeWeiPerWave
      } else {
        // Calculate WAVE from USDT: payAmount / priceUsdt (e.g., 500 USDT / 1.5 USDT per WAVE = 333.33 WAVE)
        waveAmount = (payAmountBigInt * parseUnits('1', 18)) / currentStage.priceUsdtUnitsPerWave
      }
      setReceiveAmount(formatTokenAmountForInput(waveAmount, 18, 4))
    } catch (err) {
      console.error('Error calculating receive amount:', err)
      setReceiveAmount('')
    } finally {
      setIsCalculating(false)
    }
  }, [payAmount, activeTab, currentStage, usdtDecimals])

  // Calculate pay amount when receive amount changes
  const handleReceiveAmountChange = (value) => {
    setReceiveAmount(value)
    
    if (!value || !currentStage) {
      setPayAmount('')
      return
    }

    try {
      const waveAmount = parseTokenInput(value, 18)
      
      if (waveAmount === 0n) {
        setPayAmount('')
        return
      }

      let payAmountBigInt = 0n
      
      if (activeTab === 'bnb') {
        // Calculate BNB needed: waveAmount * priceNative (e.g., 333.33 WAVE * 0.0015 BNB per WAVE = 0.5 BNB)
        payAmountBigInt = (waveAmount * currentStage.priceNativeWeiPerWave) / parseUnits('1', 18)
        setPayAmount(formatTokenAmountForInput(payAmountBigInt, 18, 6))
      } else {
        // Calculate USDT needed: waveAmount * priceUsdt (e.g., 333.33 WAVE * 1.5 USDT per WAVE = 500 USDT)
        payAmountBigInt = (waveAmount * currentStage.priceUsdtUnitsPerWave) / parseUnits('1', 18)
        setPayAmount(formatTokenAmountForInput(payAmountBigInt, usdtDecimals, 4))
      }
    } catch (err) {
      console.error('Error calculating pay amount:', err)
      setPayAmount('')
    }
  }

  // Check if purchase amount exceeds stage limit
  const checkStageLimit = () => {
    if (!receiveAmount || !currentStage) return { valid: true }
    
    try {
      const waveAmount = parseTokenInput(receiveAmount, 18)
      const maxWave = getMaxPurchaseForStage(currentStage)
      
      if (waveAmount > maxWave) {
        return {
          valid: false,
          message: `Amount exceeds current stage limit. Max: ${formatTokenAmount(maxWave)} WAVE`
        }
      }
      
      return { valid: true }
    } catch {
      return { valid: false, message: 'Invalid amount' }
    }
  }

  // Check if user has sufficient balance
  const checkBalance = () => {
    if (!payAmount) return { valid: true }
    
    try {
      const payAmountBigInt = parseTokenInput(payAmount, activeTab === 'bnb' ? 18 : usdtDecimals)
      
      if (activeTab === 'usdt') {
        if (payAmountBigInt > usdtBalance) {
          return {
            valid: false,
            message: 'Insufficient USDT balance'
          }
        }
      }
      
      return { valid: true }
    } catch {
      return { valid: false, message: 'Invalid amount' }
    }
  }

  // Check if USDT needs approval
  const needsApproval = () => {
    if (activeTab !== 'usdt' || !payAmount) return false
    try {
      const payAmountBigInt = parseTokenInput(payAmount, usdtDecimals)
      return payAmountBigInt > usdtAllowance
    } catch {
      return false
    }
  }

  const handleBuy = async () => {
    if (!termsAccepted) {
      showError('Please accept the terms and conditions')
      return
    }

    const stageCheck = checkStageLimit()
    if (!stageCheck.valid) {
      showError(stageCheck.message)
      return
    }

    const balanceCheck = checkBalance()
    if (!balanceCheck.valid) {
      showError(balanceCheck.message)
      return
    }

    try {
      const payAmountBigInt = parseTokenInput(payAmount, activeTab === 'bnb' ? 18 : usdtDecimals)
      
      if (activeTab === 'bnb') {
        const loadingToastId = showLoading('Confirming BNB purchase...')
        const result = await buyWithNative(payAmountBigInt, referrer)
        dismiss(loadingToastId)
        success('Purchase submitted successfully!', { txUrl: result.txUrl })
      } else {
        if (needsApproval()) {
          const loadingToastId = showLoading('Approving USDT spending...')
          await approveUSDT(payAmountBigInt)
          dismiss(loadingToastId)
          success('USDT approved! You can now purchase tokens.')
        } else {
          const loadingToastId = showLoading('Confirming USDT purchase...')
          const result = await buyWithUSDT(payAmountBigInt, referrer)
          dismiss(loadingToastId)
          success('Purchase submitted successfully!', { txUrl: result.txUrl })
        }
      }
      
      // Clear form on success
      setPayAmount('')
      setReceiveAmount('')
      
    } catch (err) {
      showError(err.message || 'Transaction failed')
    }
  }

  const isDisabled = !isConnected || !isValidChain || status !== 1 || !currentStage || !payAmount || !receiveAmount

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Buy Tokens</h3>
      
      {/* Tab Selector */}
      <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('bnb')}
          className={clsx(
            'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
            activeTab === 'bnb'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:text-white'
          )}
        >
          BNB
        </button>
        <button
          onClick={() => setActiveTab('usdt')}
          className={clsx(
            'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
            activeTab === 'usdt'
              ? 'bg-primary-600 text-white'
              : 'text-gray-300 hover:text-white'
          )}
        >
          USDT
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        {/* You Pay */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            You pay ({activeTab.toUpperCase()})
          </label>
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {activeTab === 'usdt' && (
            <div className="text-xs text-gray-400 mt-1">
              Balance: {formatUSDT(usdtBalance, usdtDecimals)} USDT
            </div>
          )}
        </div>

        {/* You Receive */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            You receive (WAVE)
          </label>
          <input
            type="number"
            value={receiveAmount}
            onChange={(e) => handleReceiveAmountChange(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {isCalculating && (
            <div className="text-xs text-gray-400 mt-1">Calculating...</div>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {payAmount && receiveAmount && (
        <div className="mb-4 space-y-2">
          {(() => {
            const stageCheck = checkStageLimit()
            const balanceCheck = checkBalance()
            
            if (!stageCheck.valid) {
              return <div className="flex items-center space-x-1 text-yellow-400 text-sm"><AlertTriangle className="w-4 h-4" /><span>{stageCheck.message}</span></div>
            }
            
            if (!balanceCheck.valid) {
              return <div className="flex items-center space-x-1 text-red-400 text-sm"><X className="w-4 h-4" /><span>{balanceCheck.message}</span></div>
            }
            
            return null
          })()}
        </div>
      )}

      {/* Terms Checkbox */}
      <div className="mb-6">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">
            I accept the{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300 underline">
              terms and conditions
            </a>
          </span>
        </label>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleBuy}
        disabled={isDisabled || isBuyingNative || isBuyingUSDT}
        className={clsx(
          'w-full py-3 px-4 rounded-lg font-medium transition-colors',
          isDisabled || isBuyingNative || isBuyingUSDT
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : needsApproval() && activeTab === 'usdt'
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        )}
      >
        {isBuyingNative || isBuyingUSDT ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>
              {usdtStep === 'approving' ? 'Approving...' : 
               usdtStep === 'buying' ? 'Buying...' : 'Processing...'}
            </span>
          </div>
        ) : !isConnected ? (
          'Connect Wallet'
        ) : !isValidChain ? (
          'Wrong Network'
        ) : status !== 1 ? (
          'Sale Not Active'
        ) : !termsAccepted ? (
          'Accept Terms'
        ) : needsApproval() && activeTab === 'usdt' ? (
          'Approve USDT'
        ) : (
          `Buy with ${activeTab.toUpperCase()}`
        )}
      </button>
    </div>
  )
}
