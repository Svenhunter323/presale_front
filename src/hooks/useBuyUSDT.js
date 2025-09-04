import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { PRESALE_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS, ERC20_ABI } from '../lib/contract.js'
import { getErrorMessage } from '../lib/errors.js'
import { getTxUrl } from '../lib/chains.js'
import { logTransaction } from '../lib/api.js'
import PresaleStagesABI from '../abi/PresaleStages.json'

export const useBuyUSDT = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txHash, setTxHash] = useState(null)
  const [step, setStep] = useState('idle') // 'idle', 'approving', 'buying'
  
  const { writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const approveUSDT = async (amount) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!amount || amount === 0n) {
      throw new Error('Invalid amount')
    }

    try {
      setIsLoading(true)
      setError(null)
      setStep('approving')
      setTxHash(null)

      const hash = await writeContract({
        address: USDT_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PRESALE_CONTRACT_ADDRESS, amount],
      })

      setTxHash(hash)

      return {
        hash,
        txUrl: getTxUrl(hash),
      }

    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setStep('idle')
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const buyWithUSDT = async (amount, referrer = null) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!amount || amount === 0n) {
      throw new Error('Invalid amount')
    }

    try {
      setIsLoading(true)
      setError(null)
      setStep('buying')
      setTxHash(null)

      // Use zero address if no referrer
      const ref = referrer && referrer !== '0x0000000000000000000000000000000000000000' 
        ? referrer 
        : '0x0000000000000000000000000000000000000000'

      const hash = await writeContract({
        address: PRESALE_CONTRACT_ADDRESS,
        abi: PresaleStagesABI,
        functionName: 'buyWithUSDT',
        args: [amount, ref],
      })

      setTxHash(hash)

      // Log transaction (don't await to avoid blocking)
      logTransaction({
        type: 'buy_usdt',
        hash,
        address: address,
        amount: amount.toString(),
        token: 'USDT',
        referrer: ref !== '0x0000000000000000000000000000000000000000' ? ref : null,
      }).catch(console.error)

      return {
        hash,
        txUrl: getTxUrl(hash),
      }

    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setStep('idle')
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setIsLoading(false)
    setError(null)
    setTxHash(null)
    setStep('idle')
  }

  return {
    approveUSDT,
    buyWithUSDT,
    isLoading: isLoading || isConfirming,
    isConfirming,
    isSuccess,
    error,
    txHash,
    txUrl: txHash ? getTxUrl(txHash) : null,
    step,
    reset,
  }
}
