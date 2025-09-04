import { useEffect, useState } from 'react'
import { usePublicClient, useAccount, useChainId } from 'wagmi'
import { createContractReads } from '../lib/contract.js'
import { isTargetChain } from '../lib/chains.js'
import { getCurrentStage } from '../lib/format.js'

export const useSaleReads = () => {
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const chainId = useChainId()
  
  const [data, setData] = useState({
    // Sale data
    status: 0,
    soldWave: 0n,
    capWave: 0n,
    startTs: 0n,
    endTs: 0n,
    unlockTs: 0n,
    
    // Stages
    stages: [],
    currentStage: null,
    
    // Soft cap
    softCapUsdtUnits: 0n,
    raisedUsdtUnits: 0n,
    
    // Finalize status
    finalized: false,
    successful: false,
    refundsEnabled: false,
    
    // User data
    userData: null,
    
    // USDT data
    usdtDecimals: 18,
    usdtBalance: 0n,
    usdtAllowance: 0n,
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    if (!publicClient || !isTargetChain(chainId)) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const contractReads = createContractReads(publicClient)
      
      // Fetch basic sale data
      const saleData = await contractReads.getSaleData()
      const softCapData = await contractReads.getSoftCapData()
      const finalizeData = await contractReads.getFinalizeData()
      
      // Fetch stages
      const stagesLength = await contractReads.getStagesLength()
      const stages = []
      
      for (let i = 0; i < Number(stagesLength); i++) {
        const stage = await contractReads.getStage(i)
        stages.push({
          capWave: stage[0],
          priceNativeWeiPerWave: stage[1],
          priceUsdtUnitsPerWave: stage[2],
        })
      }
      
      // Calculate current stage
      const currentStage = getCurrentStage(stages, saleData.soldWave)
      
      // Fetch USDT data
      const usdtDecimals = await contractReads.getUSDTDecimals()
      
      // Fetch user-specific data if connected
      let userData = null
      let usdtBalance = 0n
      let usdtAllowance = 0n
      
      if (address) {
        userData = await contractReads.getUserData(address)
        usdtBalance = await contractReads.getUSDTBalance(address)
        usdtAllowance = await contractReads.getUSDTAllowance(address, contractReads.presale.address)
      }
      
      setData({
        ...saleData,
        ...softCapData,
        ...finalizeData,
        stages,
        currentStage,
        userData,
        usdtDecimals,
        usdtBalance,
        usdtAllowance,
      })
      
    } catch (err) {
      console.error('Error fetching sale data:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData()
  }, [publicClient, address, chainId])

  // Refetch data periodically
  useEffect(() => {
    if (!publicClient || !isTargetChain(chainId)) return

    const interval = setInterval(fetchData, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [publicClient, chainId])

  return {
    ...data,
    loading,
    error,
    refetch: fetchData,
    isValidChain: isTargetChain(chainId),
  }
}
