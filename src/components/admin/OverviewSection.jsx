// src/components/admin/OverviewSection.jsx
import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { Badge } from '../ui/Badge.jsx'
import { CircularProgress } from '../ui/ProgressBar.jsx'
import { Switch } from '../ui/Switch.jsx'
import { createContractReads, createContractWrites } from '../../lib/contract.js'
import { createTransactionHandler } from '../../lib/transactions.js'

const STATUS_LABELS = {
  0: 'Not Started',
  1: 'Active',
  2: 'Ended',
  3: 'Paused'
}

const STATUS_VARIANTS = {
  0: 'default',
  1: 'success',
  2: 'warning',
  3: 'error'
}

export function OverviewSection({ isOwner }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { handleTransaction } = createTransactionHandler()

  const fetchData = async () => {
    if (!publicClient) return

    try {
      setLoading(true)
      const contractReads = createContractReads(publicClient)
      const contractWrites = createContractWrites(publicClient)
      
      const [
        saleData,
        softCapData,
        finalizeData,
        stagesLength,
        currentStageIndex,
        paused,
        perWalletMin,
        perWalletMax
      ] = await Promise.all([
        contractReads.getSaleData(),
        contractReads.getSoftCapData(),
        contractReads.getFinalizeData(),
        contractReads.getStagesLength(),
        contractWrites.getCurrentStageIndex(),
        contractWrites.getPaused(),
        contractWrites.getPerWalletMinWave(),
        contractWrites.getPerWalletMaxWave()
      ])

      setData({
        ...saleData,
        ...softCapData,
        ...finalizeData,
        stagesLength,
        currentStageIndex,
        paused,
        perWalletMin,
        perWalletMax
      })
    } catch (err) {
      console.error('Error fetching overview data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [publicClient])

  const handlePauseToggle = async () => {
    if (!isOwner || !address) return

    try {
      setActionLoading(true)
      const contractWrites = createContractWrites({ account: address })
      
      const action = data.paused ? 'adminUnpause' : 'adminPause'
      const message = data.paused ? 'Unpausing sale...' : 'Pausing sale...'
      
      await handleTransaction(
        contractWrites[action](address),
        {
          pendingMessage: message,
          successMessage: `Sale ${data.paused ? 'unpaused' : 'paused'} successfully!`,
          onSuccess: () => fetchData()
        }
      )
    } catch (err) {
      console.error('Error toggling pause:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!isOwner || !address || data.finalized) return

    const confirmed = window.confirm(
      'Are you sure you want to finalize the sale? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      setActionLoading(true)
      const contractWrites = createContractWrites({ account: address })
      
      await handleTransaction(
        contractWrites.adminFinalize(address),
        {
          pendingMessage: 'Finalizing sale...',
          successMessage: 'Sale finalized successfully!',
          onSuccess: () => fetchData()
        }
      )
    } catch (err) {
      console.error('Error finalizing sale:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === 0n) return 'Not set'
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString()
  }

  const getTimeRemaining = (timestamp) => {
    if (!timestamp || timestamp === 0n) return null
    const now = Math.floor(Date.now() / 1000)
    const target = Number(timestamp)
    const diff = target - now
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const progressPercentage = data.capWave > 0n 
    ? Number((data.soldWave * 100n) / data.capWave)
    : 0

  const softCapProgress = data.softCapUsdtUnits > 0n
    ? Number((data.raisedUsdtUnits * 100n) / data.softCapUsdtUnits)
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sale Overview
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_VARIANTS[data.status]}>
              {STATUS_LABELS[data.status]}
            </Badge>
            {data.paused && (
              <Badge variant="error">
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </Badge>
            )}
            {data.finalized && (
              <Badge variant={data.successful ? 'success' : 'error'}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {data.successful ? 'Success' : 'Failed'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Ring */}
        <div className="flex justify-center">
          <CircularProgress 
            value={progressPercentage} 
            size={160}
            strokeWidth={12}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {progressPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-zinc-400">Sold</div>
            </div>
          </CircularProgress>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-zinc-400">Sold WAVE</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatUnits(data.soldWave, 18)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-zinc-400">Cap WAVE</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatUnits(data.capWave, 18)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-zinc-400">Raised USDT</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatUnits(data.raisedUsdtUnits, 18)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-zinc-400">Current Stage</span>
            </div>
            <div className="text-xl font-bold text-white">
              {Number(data.currentStageIndex) + 1} / {Number(data.stagesLength)}
            </div>
          </div>
        </div>

        {/* Soft Cap Progress */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Soft Cap Progress</span>
            <span className="text-sm font-medium text-white">
              {softCapProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(softCapProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>{formatUnits(data.raisedUsdtUnits, 18)} USDT</span>
            <span>{formatUnits(data.softCapUsdtUnits, 18)} USDT</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-1">Start Time</div>
            <div className="text-sm font-medium text-white">
              {formatTimestamp(data.startTs)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-1">End Time</div>
            <div className="text-sm font-medium text-white">
              {formatTimestamp(data.endTs)}
            </div>
            <div className="text-xs text-cyan-400 mt-1">
              {getTimeRemaining(data.endTs)}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-1">Unlock Time</div>
            <div className="text-sm font-medium text-white">
              {formatTimestamp(data.unlockTs)}
            </div>
            <div className="text-xs text-purple-400 mt-1">
              {getTimeRemaining(data.unlockTs)}
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {isOwner && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Pause Sale</span>
                <Switch
                  checked={data.paused}
                  onCheckedChange={handlePauseToggle}
                  disabled={actionLoading}
                />
              </div>
            </div>

            <Button
              variant="danger"
              onClick={handleFinalize}
              disabled={data.finalized || actionLoading}
              loading={actionLoading}
            >
              {data.finalized ? 'Finalized' : 'Finalize Sale'}
            </Button>
          </div>
        )}

        {/* Read-only warning */}
        {!isOwner && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              Connect owner wallet to perform admin actions
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
