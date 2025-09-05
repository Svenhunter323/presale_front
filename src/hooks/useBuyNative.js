import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { PRESALE_CONTRACT_ADDRESS } from '../lib/contract.js'
import { getErrorMessage } from '../lib/errors.js'
import { getTxUrl } from '../lib/chains.js'
import { logTransaction } from '../lib/api.js'
import PresaleStagesABI from '../abi/PresaleStages.json'

export const useBuyNative = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [txHash, setTxHash] = useState(null)
  
  const { writeContractAsync } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const buyWithNative = async (amount, referrer = null) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!amount || amount === 0n) {
      throw new Error('Invalid amount')
    }

    try {
      setIsLoading(true)
      setError(null)
      setTxHash(null)

      // Use zero address if no referrer
      const ref = referrer && referrer !== '0x0000000000000000000000000000000000000000' 
        ? referrer 
        : '0x0000000000000000000000000000000000000000'

      const hash = await writeContractAsync({
        address: PRESALE_CONTRACT_ADDRESS,
        abi: PresaleStagesABI,
        functionName: 'buyWithNative',
        args: [ref],
        value: amount,
      })

      // console.log("hash------>", hash);

      // if (!hash) {
      //   throw new Error('Transaction failed: No transaction hash received')
      // }

      setTxHash(hash)

      // // Log initial transaction (don't await to avoid blocking)
      // logTransaction({
      //   type: 'buy_native',
      //   hash,
      //   address: address,
      //   amount: amount.toString(),
      //   token: 'BNB',
      //   referrer: ref !== '0x0000000000000000000000000000000000000000' ? ref : null,
      //   blockNumber: null,
      //   gasUsed: null,
      //   gasPrice: null,
      //   status: 'pending'
      // }).catch(console.error)

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

  // Update transaction log when receipt is available
  useEffect(() => {
    if (receipt && txHash) {
      logTransaction({
        type: 'buy_native',
        hash: txHash,
        address: address,
        amount: null, // Amount already logged in initial transaction
        token: 'BNB',
        referrer: null, // Referrer already logged in initial transaction
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: receipt.effectiveGasPrice?.toString(),
        status: receipt.status === 'success' ? 'confirmed' : 'failed'
      }).catch(console.error)
    }
  }, [receipt, txHash, address])

  const reset = () => {
    setIsLoading(false)
    setError(null)
    setTxHash(null)
  }

  return {
    buyWithNative,
    isLoading: isLoading || isConfirming,
    isConfirming,
    isSuccess,
    error,
    txHash,
    txUrl: txHash ? getTxUrl(txHash) : null,
    reset,
  }
}
