// src/components/admin/LimitsSection.jsx
import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { Shield, DollarSign, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { createContractReads, createContractWrites } from '../../lib/contract.js'
import { createTransactionHandler } from '../../lib/transactions.js'

export function LimitsSection({ isOwner }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState({
    perWalletMin: '',
    perWalletMax: '',
    softCapUsdt: ''
  })
  
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { handleTransaction } = createTransactionHandler()

  const fetchData = async () => {
    if (!publicClient) return

    try {
      setLoading(true)
      const contractReads = createContractReads(publicClient)
      const contractWrites = createContractWrites(publicClient)
      
      const [perWalletMin, perWalletMax, softCapUsdtUnits] = await Promise.all([
        contractWrites.getPerWalletMinWave(),
        contractWrites.getPerWalletMaxWave(),
        contractReads.getSoftCapData().then(data => data.softCapUsdtUnits)
      ])

      const fetchedData = {
        perWalletMin,
        perWalletMax,
        softCapUsdtUnits
      }

      setData(fetchedData)
      setFormData({
        perWalletMin: formatUnits(perWalletMin, 18),
        perWalletMax: formatUnits(perWalletMax, 18),
        softCapUsdt: formatUnits(softCapUsdtUnits, 18)
      })
    } catch (err) {
      console.error('Error fetching limits data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [publicClient])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { perWalletMin, perWalletMax, softCapUsdt } = formData
    
    if (!perWalletMin || !perWalletMax || !softCapUsdt) {
      return 'All fields are required'
    }

    const min = parseFloat(perWalletMin)
    const max = parseFloat(perWalletMax)
    const soft = parseFloat(softCapUsdt)

    if (min <= 0 || max <= 0 || soft <= 0) {
      return 'All values must be positive'
    }

    if (min >= max) {
      return 'Maximum must be greater than minimum'
    }

    return null
  }

  const handleSave = async () => {
    if (!isOwner || !address) return

    const error = validateForm()
    if (error) {
      alert(error)
      return
    }

    try {
      setActionLoading(true)
      const contractWrites = createContractWrites({ account: address })
      
      const perMin = parseUnits(formData.perWalletMin, 18)
      const perMax = parseUnits(formData.perWalletMax, 18)
      const softCap = parseUnits(formData.softCapUsdt, 18)
      
      await handleTransaction(
        contractWrites.adminSetCapsAndSoft(perMin, perMax, softCap, address),
        {
          pendingMessage: 'Updating limits...',
          successMessage: 'Limits updated successfully!',
          onSuccess: () => {
            fetchData()
            setEditMode(false)
          }
        }
      )
    } catch (err) {
      console.error('Error updating limits:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditMode(false)
    if (data) {
      setFormData({
        perWalletMin: formatUnits(data.perWalletMin, 18),
        perWalletMax: formatUnits(data.perWalletMax, 18),
        softCapUsdt: formatUnits(data.softCapUsdtUnits, 18)
      })
    }
  }

  const getWaveDecimals = () => 18 // WAVE token decimals
  const getUsdtDecimals = () => 18 // USDT token decimals

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/10 rounded"></div>
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
            <Shield className="w-5 h-5" />
            Limits & Soft Cap
          </CardTitle>
          {isOwner && (
            <div className="flex gap-2">
              {!editMode ? (
                <Button size="sm" onClick={() => setEditMode(true)}>
                  Edit Limits
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
          {/* Per Wallet Minimum */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Minimum Purchase</h3>
                <p className="text-sm text-zinc-400">Per wallet (WAVE)</p>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.perWalletMin}
                  onChange={(e) => handleInputChange('perWalletMin', e.target.value)}
                  placeholder="0.000000"
                />
                <div className="text-xs text-zinc-500">
                  Decimals: {getWaveDecimals()}
                  <br />
                  Wei: {formData.perWalletMin ? parseUnits(formData.perWalletMin || '0', 18).toString() : '0'}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-mono">
                  {formatUnits(data.perWalletMin, 18)}
                </div>
                <div className="text-sm text-zinc-400">WAVE</div>
              </div>
            )}
          </div>

          {/* Per Wallet Maximum */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Maximum Purchase</h3>
                <p className="text-sm text-zinc-400">Per wallet (WAVE)</p>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.perWalletMax}
                  onChange={(e) => handleInputChange('perWalletMax', e.target.value)}
                  placeholder="0.000000"
                />
                <div className="text-xs text-zinc-500">
                  Decimals: {getWaveDecimals()}
                  <br />
                  Wei: {formData.perWalletMax ? parseUnits(formData.perWalletMax || '0', 18).toString() : '0'}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-mono">
                  {formatUnits(data.perWalletMax, 18)}
                </div>
                <div className="text-sm text-zinc-400">WAVE</div>
              </div>
            )}
          </div>

          {/* Soft Cap */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Soft Cap</h3>
                <p className="text-sm text-zinc-400">Minimum raise (USDT)</p>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.softCapUsdt}
                  onChange={(e) => handleInputChange('softCapUsdt', e.target.value)}
                  placeholder="0.000000"
                />
                <div className="text-xs text-zinc-500">
                  Decimals: {getUsdtDecimals()}
                  <br />
                  Units: {formData.softCapUsdt ? parseUnits(formData.softCapUsdt || '0', 18).toString() : '0'}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white font-mono">
                  {formatUnits(data.softCapUsdtUnits, 18)}
                </div>
                <div className="text-sm text-zinc-400">USDT</div>
              </div>
            )}
          </div>
        </div>

        {/* Helper Information */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Configuration Notes</h4>
          <ul className="text-sm text-blue-300/80 space-y-1">
            <li>• Minimum purchase enforces the smallest allowed investment per wallet</li>
            <li>• Maximum purchase caps the largest allowed investment per wallet</li>
            <li>• Soft cap determines the minimum funds needed for a successful sale</li>
            <li>• If soft cap is not reached, users can claim refunds after finalization</li>
          </ul>
        </div>

        {/* Validation Error */}
        {editMode && (() => {
          const error = validateForm()
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
