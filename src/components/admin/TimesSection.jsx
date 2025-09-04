// src/components/admin/TimesSection.jsx
import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { Clock, Calendar, Copy, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { createContractIO } from '../../lib/contract.js'
import { createTransactionHandler } from '../../lib/transactions.js'

export function TimesSection({ isOwner }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    unlockTime: ''
  })
  
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { handleTransaction } = createTransactionHandler()

  const fetchData = async () => {
    if (!publicClient) return

    try {
      setLoading(true)
      const contract = createContractIO(publicClient)
      
      const saleData = await contract.getSaleData()
      
      setData({
        startTs: saleData.startTs,
        endTs: saleData.endTs,
        unlockTs: saleData.unlockTs
      })

      // Convert to local datetime strings for inputs
      setFormData({
        startTime: timestampToDatetimeLocal(saleData.startTs),
        endTime: timestampToDatetimeLocal(saleData.endTs),
        unlockTime: timestampToDatetimeLocal(saleData.unlockTs)
      })
    } catch (err) {
      console.error('Error fetching times data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [publicClient])

  const timestampToDatetimeLocal = (timestamp) => {
    if (!timestamp || timestamp === 0n) return ''
    const date = new Date(Number(timestamp) * 1000)
    return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format
  }

  const datetimeLocalToTimestamp = (datetimeLocal) => {
    if (!datetimeLocal) return 0
    return Math.floor(new Date(datetimeLocal).getTime() / 1000)
  }

  const formatDateTime = (timestamp) => {
    if (!timestamp || timestamp === 0n) return 'Not set'
    const date = new Date(Number(timestamp) * 1000)
    return {
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      unix: Number(timestamp)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateTimes = () => {
    const { startTime, endTime, unlockTime } = formData
    
    if (!startTime || !endTime || !unlockTime) {
      return 'All times are required'
    }

    const start = datetimeLocalToTimestamp(startTime)
    const end = datetimeLocalToTimestamp(endTime)
    const unlock = datetimeLocalToTimestamp(unlockTime)

    if (start >= end) {
      return 'End time must be after start time'
    }

    if (end > unlock) {
      return 'Unlock time must be after or equal to end time'
    }

    return null
  }

  const handleSave = async () => {
    if (!isOwner || !address) return

    const error = validateTimes()
    if (error) {
      alert(error)
      return
    }

    const start = datetimeLocalToTimestamp(formData.startTime)
    const end = datetimeLocalToTimestamp(formData.endTime)
    const unlock = datetimeLocalToTimestamp(formData.unlockTime)

    const confirmed = window.confirm(
      `Confirm time update:\n` +
      `Start: ${new Date(start * 1000).toLocaleString()} (${start})\n` +
      `End: ${new Date(end * 1000).toLocaleString()} (${end})\n` +
      `Unlock: ${new Date(unlock * 1000).toLocaleString()} (${unlock})`
    )

    if (!confirmed) return

    try {
      setActionLoading(true)
      const contract = createContractIO(publicClient, { account: address })
      
      await handleTransaction(
        contract.adminSetTimes(start, end, unlock, address),
        {
          pendingMessage: 'Updating times...',
          successMessage: 'Times updated successfully!',
          onSuccess: () => {
            fetchData()
            setEditMode(false)
          }
        }
      )
    } catch (err) {
      console.error('Error updating times:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditMode(false)
    if (data) {
      setFormData({
        startTime: timestampToDatetimeLocal(data.startTs),
        endTime: timestampToDatetimeLocal(data.endTs),
        unlockTime: timestampToDatetimeLocal(data.unlockTs)
      })
    }
  }

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getTimeRemaining = (timestamp) => {
    if (!timestamp || timestamp === 0n) return null
    const now = Math.floor(Date.now() / 1000)
    const target = Number(timestamp)
    const diff = target - now
    
    if (diff <= 0) return 'Passed'
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Configuration
          </CardTitle>
          {isOwner && (
            <div className="flex gap-2">
              {!editMode ? (
                <Button size="sm" onClick={() => setEditMode(true)}>
                  Edit Times
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    loading={actionLoading}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={cancelEdit}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Start Time */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Start Time</h3>
                <p className="text-sm text-zinc-400">Sale begins</p>
              </div>
            </div>

            {editMode ? (
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">
                    {formatDateTime(data.startTs).local}
                  </div>
                  <div className="text-xs text-zinc-400">
                    UTC: {formatDateTime(data.startTs).utc}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono">
                    {formatDateTime(data.startTs).unix}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatDateTime(data.startTs).unix.toString(), 'start')}
                  >
                    {copiedField === 'start' ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-cyan-400">
                  {getTimeRemaining(data.startTs)}
                </div>
              </div>
            )}
          </div>

          {/* End Time */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">End Time</h3>
                <p className="text-sm text-zinc-400">Sale ends</p>
              </div>
            </div>

            {editMode ? (
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">
                    {formatDateTime(data.endTs).local}
                  </div>
                  <div className="text-xs text-zinc-400">
                    UTC: {formatDateTime(data.endTs).utc}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono">
                    {formatDateTime(data.endTs).unix}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatDateTime(data.endTs).unix.toString(), 'end')}
                  >
                    {copiedField === 'end' ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-orange-400">
                  {getTimeRemaining(data.endTs)}
                </div>
              </div>
            )}
          </div>

          {/* Unlock Time */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Unlock Time</h3>
                <p className="text-sm text-zinc-400">Tokens claimable</p>
              </div>
            </div>

            {editMode ? (
              <Input
                type="datetime-local"
                value={formData.unlockTime}
                onChange={(e) => handleInputChange('unlockTime', e.target.value)}
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">
                    {formatDateTime(data.unlockTs).local}
                  </div>
                  <div className="text-xs text-zinc-400">
                    UTC: {formatDateTime(data.unlockTs).utc}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono">
                    {formatDateTime(data.unlockTs).unix}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatDateTime(data.unlockTs).unix.toString(), 'unlock')}
                  >
                    {copiedField === 'unlock' ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-purple-400">
                  {getTimeRemaining(data.unlockTs)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Rules */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Time Validation Rules</h4>
          <ul className="text-sm text-blue-300/80 space-y-1">
            <li>• Start time must be before end time</li>
            <li>• Unlock time must be after or equal to end time</li>
            <li>• All times are converted to UTC for blockchain storage</li>
            <li>• Unix timestamps are shown for verification</li>
          </ul>
        </div>

        {/* Preview in Edit Mode */}
        {editMode && formData.startTime && formData.endTime && formData.unlockTime && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-sm font-medium text-white mb-3">Preview (Local Time)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-zinc-400">Start:</span>
                <div className="text-white font-mono">
                  {new Date(formData.startTime).toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">
                  Unix: {datetimeLocalToTimestamp(formData.startTime)}
                </div>
              </div>
              <div>
                <span className="text-zinc-400">End:</span>
                <div className="text-white font-mono">
                  {new Date(formData.endTime).toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">
                  Unix: {datetimeLocalToTimestamp(formData.endTime)}
                </div>
              </div>
              <div>
                <span className="text-zinc-400">Unlock:</span>
                <div className="text-white font-mono">
                  {new Date(formData.unlockTime).toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">
                  Unix: {datetimeLocalToTimestamp(formData.unlockTime)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {editMode && (() => {
          const error = validateTimes()
          return error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}
