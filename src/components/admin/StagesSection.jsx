// src/components/admin/StagesSection.jsx
import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { 
  Layers, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Edit3,
  AlertCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Badge } from '../ui/Badge.jsx'
import { createContractIO } from '../../lib/contract.js'
import { createTransactionHandler } from '../../lib/transactions.js'

export function StagesSection({ isOwner }) {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editStages, setEditStages] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [importData, setImportData] = useState('')
  const [showImport, setShowImport] = useState(false)
  
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { handleTransaction } = createTransactionHandler()

  const fetchStages = async () => {
    if (!publicClient) return

    try {
      setLoading(true)
      const contract = createContractIO(publicClient)
      
      const stagesLength = await contract.getStagesLength()
      const stagePromises = []
      
      for (let i = 0; i < Number(stagesLength); i++) {
        stagePromises.push(contract.getStage(i))
      }
      
      const stageResults = await Promise.all(stagePromises)
      const formattedStages = stageResults.map((stage, index) => ({
        index,
        capWave: stage[0],
        priceNativeWeiPerWave: stage[1],
        priceUsdtUnitsPerWave: stage[2]
      }))
      
      setStages(formattedStages)
      setEditStages(formattedStages.map(stage => ({
        capWave: formatUnits(stage.capWave, 18),
        priceNative: formatUnits(stage.priceNativeWeiPerWave, 18),
        priceUsdt: formatUnits(stage.priceUsdtUnitsPerWave, 18)
      })))
    } catch (err) {
      console.error('Error fetching stages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStages()
  }, [publicClient])

  const handleExport = () => {
    const exportData = {
      caps: stages.map(s => formatUnits(s.capWave, 18)),
      priceNative: stages.map(s => formatUnits(s.priceNativeWeiPerWave, 18)),
      priceUsdt: stages.map(s => formatUnits(s.priceUsdtUnitsPerWave, 18))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'presale-stages.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)
      
      if (!data.caps || !data.priceNative || !data.priceUsdt) {
        throw new Error('Invalid format: missing required fields')
      }
      
      if (data.caps.length !== data.priceNative.length || 
          data.caps.length !== data.priceUsdt.length) {
        throw new Error('Array lengths must match')
      }

      // Validate caps are strictly increasing
      for (let i = 1; i < data.caps.length; i++) {
        if (parseFloat(data.caps[i]) <= parseFloat(data.caps[i-1])) {
          throw new Error(`Cap at stage ${i+1} must be greater than stage ${i}`)
        }
      }

      const newStages = data.caps.map((cap, i) => ({
        capWave: cap,
        priceNative: data.priceNative[i],
        priceUsdt: data.priceUsdt[i]
      }))

      setEditStages(newStages)
      setShowImport(false)
      setImportData('')
      setEditMode(true)
    } catch (err) {
      alert(`Import error: ${err.message}`)
    }
  }

  const addStage = () => {
    const lastCap = editStages.length > 0 
      ? parseFloat(editStages[editStages.length - 1].capWave)
      : 0
    
    setEditStages([...editStages, {
      capWave: (lastCap + 1000000).toString(),
      priceNative: '0.0001',
      priceUsdt: '0.1'
    }])
  }

  const removeStage = (index) => {
    setEditStages(editStages.filter((_, i) => i !== index))
  }

  const updateStage = (index, field, value) => {
    const updated = [...editStages]
    updated[index] = { ...updated[index], [field]: value }
    setEditStages(updated)
  }

  const validateStages = () => {
    if (editStages.length === 0) return 'At least one stage required'
    
    for (let i = 0; i < editStages.length; i++) {
      const stage = editStages[i]
      if (!stage.capWave || !stage.priceNative || !stage.priceUsdt) {
        return `Stage ${i+1}: All fields required`
      }
      
      if (parseFloat(stage.capWave) <= 0 || 
          parseFloat(stage.priceNative) <= 0 || 
          parseFloat(stage.priceUsdt) <= 0) {
        return `Stage ${i+1}: All values must be positive`
      }
      
      if (i > 0 && parseFloat(stage.capWave) <= parseFloat(editStages[i-1].capWave)) {
        return `Stage ${i+1}: Cap must be greater than previous stage`
      }
    }
    
    return null
  }

  const handleSave = async () => {
    if (!isOwner || !address) return

    const error = validateStages()
    if (error) {
      alert(error)
      return
    }

    try {
      setActionLoading(true)
      const contract = createContractIO(publicClient, { account: address })
      
      const caps = editStages.map(s => parseUnits(s.capWave, 18))
      const priceNative = editStages.map(s => parseUnits(s.priceNative, 18))
      const priceUsdt = editStages.map(s => parseUnits(s.priceUsdt, 18))
      
      await handleTransaction(
        contract.adminReplaceAllStages(caps, priceNative, priceUsdt, address),
        {
          pendingMessage: 'Updating stages...',
          successMessage: 'Stages updated successfully!',
          onSuccess: () => {
            fetchStages()
            setEditMode(false)
          }
        }
      )
    } catch (err) {
      console.error('Error updating stages:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditMode(false)
    setEditStages(stages.map(stage => ({
      capWave: formatUnits(stage.capWave, 18),
      priceNative: formatUnits(stage.priceNativeWeiPerWave, 18),
      priceUsdt: formatUnits(stage.priceUsdtUnitsPerWave, 18)
    })))
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Stages Configuration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {isOwner && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowImport(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                {!editMode ? (
                  <Button
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Import Dialog */}
        {showImport && (
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <h4 className="text-lg font-medium text-white mb-3">Import Stages</h4>
            <div className="space-y-3">
              <textarea
                className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-400 text-sm font-mono"
                placeholder='{"caps": ["1000000", "2000000"], "priceNative": ["0.0001", "0.0002"], "priceUsdt": ["0.1", "0.2"]}'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleImport}>
                  Import
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setShowImport(false)
                    setImportData('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stages Table */}
        <div className="space-y-4">
          {editMode ? (
            <>
              {/* Edit Mode */}
              <div className="space-y-3">
                {editStages.map((stage, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-xl">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Stage {index + 1} - Cap (WAVE)
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={stage.capWave}
                        onChange={(e) => updateStage(index, 'capWave', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Price (BNB per WAVE)
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={stage.priceNative}
                        onChange={(e) => updateStage(index, 'priceNative', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Price (USDT per WAVE)
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={stage.priceUsdt}
                        onChange={(e) => updateStage(index, 'priceUsdt', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeStage(index)}
                        disabled={editStages.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="secondary"
                onClick={addStage}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>

              {/* Validation Warning */}
              {(() => {
                const error = validateStages()
                return error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                  </div>
                )
              })()}
            </>
          ) : (
            <>
              {/* View Mode */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Stage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Cap (WAVE)</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">BNB Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">USDT Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map((stage, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="py-3 px-4">
                          <Badge variant="gradient">
                            Stage {index + 1}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-white font-mono">
                          {formatUnits(stage.capWave, 18)}
                        </td>
                        <td className="py-3 px-4 text-white font-mono">
                          {formatUnits(stage.priceNativeWeiPerWave, 18)}
                        </td>
                        <td className="py-3 px-4 text-white font-mono">
                          {formatUnits(stage.priceUsdtUnitsPerWave, 18)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="default">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {stages.length === 0 && (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No stages configured</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
