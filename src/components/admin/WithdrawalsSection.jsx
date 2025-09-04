// src/components/admin/WithdrawalsSection.jsx
import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { formatUnits, parseUnits, formatEther } from 'viem'
import { 
  Coins, 
  DollarSign, 
  AlertTriangle, 
  ExternalLink,
  Trash2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Badge } from '../ui/Badge.jsx'
import { createContractIO } from '../../lib/contract.js'
import { createTransactionHandler } from '../../lib/transactions.js'
import { PRESALE_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS } from '../../lib/contract.js'

export function WithdrawalsSection({ isOwner }) {
  const [balances, setBalances] = useState({
    bnb: 0n,
    usdt: 0n,
    wave: 0n
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    bnbAmount: '',
    tokenAddress: USDT_CONTRACT_ADDRESS,
    tokenAmount: ''
  })
  
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { handleTransaction } = createTransactionHandler()

  const fetchBalances = async () => {
    if (!publicClient) return

    try {
      setLoading(true)
      const contract = createContractIO(publicClient)
      
      const [bnbBalance, usdtBalance] = await Promise.all([
        publicClient.getBalance({ address: PRESALE_CONTRACT_ADDRESS }),
        contract.getUSDTBalance(PRESALE_CONTRACT_ADDRESS)
      ])

      setBalances({
        bnb: bnbBalance,
        usdt: usdtBalance,
        wave: 0n // Will be updated after we can read WAVE balance
      })
    } catch (err) {
      console.error('Error fetching balances:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalances()
    const interval = setInterval(fetchBalances, 30000)
    return () => clearInterval(interval)
  }, [publicClient])

  const handleWithdrawBNB = async () => {
    if (!isOwner || !address || !withdrawForm.bnbAmount) return

    const amount = parseFloat(withdrawForm.bnbAmount)
    if (amount <= 0) {
      alert('Amount must be positive')
      return
    }

    const amountWei = parseUnits(withdrawForm.bnbAmount, 18)
    if (amountWei > balances.bnb) {
      alert('Insufficient BNB balance')
      return
    }

    const confirmed = window.confirm(
      `Withdraw ${withdrawForm.bnbAmount} BNB from contract?`
    )
    if (!confirmed) return

    try {
      setActionLoading(true)
      const contract = createContractIO(publicClient, { account: address })
      
      await handleTransaction(
        contract.adminWithdrawNative(amountWei, address),
        {
          pendingMessage: 'Withdrawing BNB...',
          successMessage: `Successfully withdrew ${withdrawForm.bnbAmount} BNB!`,
          onSuccess: () => {
            fetchBalances()
            setWithdrawForm(prev => ({ ...prev, bnbAmount: '' }))
          }
        }
      )
    } catch (err) {
      console.error('Error withdrawing BNB:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdrawToken = async () => {
    if (!isOwner || !address || !withdrawForm.tokenAddress || !withdrawForm.tokenAmount) return

    const amount = parseFloat(withdrawForm.tokenAmount)
    if (amount <= 0) {
      alert('Amount must be positive')
      return
    }

    // Assume 18 decimals for most tokens
    const amountUnits = parseUnits(withdrawForm.tokenAmount, 18)
    
    const confirmed = window.confirm(
      `Withdraw ${withdrawForm.tokenAmount} tokens from ${withdrawForm.tokenAddress}?`
    )
    if (!confirmed) return

    try {
      setActionLoading(true)
      const contract = createContractIO(publicClient, { account: address })
      
      await handleTransaction(
        contract.adminWithdrawToken(withdrawForm.tokenAddress, amountUnits, address),
        {
          pendingMessage: 'Withdrawing tokens...',
          successMessage: `Successfully withdrew ${withdrawForm.tokenAmount} tokens!`,
          onSuccess: () => {
            fetchBalances()
            setWithdrawForm(prev => ({ ...prev, tokenAmount: '' }))
          }
        }
      )
    } catch (err) {
      console.error('Error withdrawing tokens:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSweepWave = async () => {
    if (!isOwner || !address) return

    const confirmed = window.confirm(
      'Sweep all WAVE tokens from contract? This should only be done after finalization.'
    )
    if (!confirmed) return

    try {
      setActionLoading(true)
      const contract = createContractIO(publicClient, { account: address })
      
      await handleTransaction(
        contract.adminSweepAllWave(address),
        {
          pendingMessage: 'Sweeping WAVE tokens...',
          successMessage: 'Successfully swept all WAVE tokens!',
          onSuccess: () => fetchBalances()
        }
      )
    } catch (err) {
      console.error('Error sweeping WAVE:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setWithdrawForm(prev => ({ ...prev, [field]: value }))
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Withdrawals & Treasury
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contract Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">BNB Balance</h3>
                <p className="text-sm text-zinc-400">Contract native balance</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white font-mono">
                {formatEther(balances.bnb)}
              </div>
              <div className="text-sm text-zinc-400">BNB</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">USDT Balance</h3>
                <p className="text-sm text-zinc-400">Contract USDT balance</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white font-mono">
                {formatUnits(balances.usdt, 18)}
              </div>
              <div className="text-sm text-zinc-400">USDT</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">WAVE Balance</h3>
                <p className="text-sm text-zinc-400">Remaining tokens</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white font-mono">
                {formatUnits(balances.wave, 18)}
              </div>
              <div className="text-sm text-zinc-400">WAVE</div>
            </div>
          </div>
        </div>

        {isOwner ? (
          <div className="space-y-6">
            {/* BNB Withdrawal */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Withdraw BNB
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <Input
                    label="Amount (BNB)"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={withdrawForm.bnbAmount}
                    onChange={(e) => handleInputChange('bnbAmount', e.target.value)}
                  />
                  <div className="text-xs text-zinc-500 mt-1">
                    Available: {formatEther(balances.bnb)} BNB
                  </div>
                </div>
                <Button
                  onClick={handleWithdrawBNB}
                  disabled={!withdrawForm.bnbAmount || actionLoading}
                  loading={actionLoading}
                >
                  Withdraw BNB
                </Button>
              </div>
            </div>

            {/* Token Withdrawal */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Withdraw Tokens
              </h3>
              <div className="space-y-4">
                <Input
                  label="Token Address"
                  placeholder="0x..."
                  value={withdrawForm.tokenAddress}
                  onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Input
                      label="Amount"
                      type="number"
                      step="0.000001"
                      placeholder="0.000000"
                      value={withdrawForm.tokenAmount}
                      onChange={(e) => handleInputChange('tokenAmount', e.target.value)}
                    />
                    <div className="text-xs text-zinc-500 mt-1">
                      {withdrawForm.tokenAddress === USDT_CONTRACT_ADDRESS && 
                        `Available: ${formatUnits(balances.usdt, 18)} USDT`
                      }
                    </div>
                  </div>
                  <Button
                    onClick={handleWithdrawToken}
                    disabled={!withdrawForm.tokenAddress || !withdrawForm.tokenAmount || actionLoading}
                    loading={actionLoading}
                  >
                    Withdraw Token
                  </Button>
                </div>
                
                {/* Quick USDT Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setWithdrawForm(prev => ({ 
                    ...prev, 
                    tokenAddress: USDT_CONTRACT_ADDRESS,
                    tokenAmount: formatUnits(balances.usdt, 18)
                  }))}
                  disabled={balances.usdt === 0n}
                >
                  Withdraw All USDT
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Sweep All WAVE</h4>
                    <p className="text-sm text-zinc-400">
                      Remove all remaining WAVE tokens from contract. Only use after finalization.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleSweepWave}
                    loading={actionLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sweep WAVE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-300">
              Connect owner wallet to perform withdrawal operations
            </span>
          </div>
        )}

        {/* Contract Addresses */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white mb-3">Contract Addresses</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Presale Contract:</span>
              <div className="flex items-center gap-2">
                <code className="bg-white/10 px-2 py-1 rounded font-mono text-xs">
                  {PRESALE_CONTRACT_ADDRESS?.slice(0, 6)}...{PRESALE_CONTRACT_ADDRESS?.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://bscscan.com/address/${PRESALE_CONTRACT_ADDRESS}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">USDT Contract:</span>
              <div className="flex items-center gap-2">
                <code className="bg-white/10 px-2 py-1 rounded font-mono text-xs">
                  {USDT_CONTRACT_ADDRESS?.slice(0, 6)}...{USDT_CONTRACT_ADDRESS?.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://bscscan.com/address/${USDT_CONTRACT_ADDRESS}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
