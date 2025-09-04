import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { PRESALE_CONTRACT_ADDRESS } from '../lib/contract.js'
import { getErrorMessage } from '../lib/errors.js'
import { getTxUrl } from '../lib/chains.js'
import { logTransaction } from '../lib/api.js'
import PresaleStagesABI from '../abi/PresaleStages.json'

export const useClaim = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txHash, setTxHash] = useState(null)
  
  const { writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const claim = async () => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setIsLoading(true)
      setError(null)
      setTxHash(null)

      const hash = await writeContract({
        address: PRESALE_CONTRACT_ADDRESS,
        abi: PresaleStagesABI,
        functionName: 'claim',
        args: [],
      })

      setTxHash(hash)

      // Log transaction (don't await to avoid blocking)
      logTransaction({
        type: 'claim',
        hash,
        address: address,
      }).catch(console.error)

      return {
        hash,
        txUrl: getTxUrl(hash),
      }

    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setIsLoading(false)
    setError(null)
    setTxHash(null)
  }

  return {
    claim,
    isLoading: isLoading || isConfirming,
    isConfirming,
    isSuccess,
    error,
    txHash,
    txUrl: txHash ? getTxUrl(txHash) : null,
    reset,
  }
}
