// src/components/AdminLoginDialog.jsx
import { useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, AlertTriangle } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './ui/Dialog.jsx'
import { Button } from './ui/Button.jsx'
import { useAdminAuth } from '../hooks/useAdminAuth.js'

export function AdminLoginDialog({ open, onClose, onAuthSuccess }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { authenticateWithSignature } = useAdminAuth()

  const checkWalletAuth = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const ok = await authenticateWithSignature()
      if (ok) {
        onAuthSuccess('wallet')
        onClose()
      }
    } catch (err) {
      console.error('Error checking owner:', err)
      setError(err?.message || 'Failed to verify owner status')
    } finally {
      setLoading(false)
    }
  }, [address, isConnected, authenticateWithSignature, onAuthSuccess, onClose])

  // Don't auto-trigger authentication to prevent errors
  // User must manually click "Verify & Sign"

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Admin Login</DialogTitle>
      </DialogHeader>

      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <div className="text-center">
            <div className="p-3 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 rounded-xl w-16 h-16 mx-auto mb-4">
              <Wallet className="w-10 h-10 text-white mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connect Owner Wallet</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Connect the contract owner wallet to access admin features
            </p>
          </div>

          {!isConnected ? (
            <div className="space-y-3">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="w-full"
                  disabled={loading}
                >
                  Connect {connector.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-zinc-400">Connected Wallet</div>
                <div className="text-sm font-mono text-white break-all">
                  {address}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={checkWalletAuth}
                  loading={loading}
                  className="flex-1"
                >
                  Verify & Sign
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => disconnect()}
                  disabled={loading}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
