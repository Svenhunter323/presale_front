// src/contexts/AdminAuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { createContractReads } from '../lib/contract.js'
import { adminAuth } from '../lib/api.js'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const checkBackendAuth = useCallback(async () => {
    try {
      const result = await adminAuth.status()
      setIsAuthenticated(result.authenticated || false)
    } catch {
      // If backend is not available, check localStorage for mock auth
      const mockAuth = localStorage.getItem('admin_mock_auth')
      setIsAuthenticated(mockAuth === 'true')
    }
  }, [])

  // Check backend auth status on mount
  useEffect(() => {
    checkBackendAuth()
  }, [checkBackendAuth])

  const checkWalletAuth = useCallback(async () => {
    if (!address || !publicClient) return false
    
    try {
      setLoading(true)
      // Use createContractReads instead of createContractWrites for read operations
      const contractReads = createContractReads(publicClient)
      const owner = await contractReads.getOwner()
      
      const isOwner = address.toLowerCase() === owner.toLowerCase()
      return isOwner
    } catch (error) {
      console.error('Error checking wallet auth:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [address, publicClient])

  const authenticateWithSignature = useCallback(async () => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)
      
      // Check if wallet is contract owner first
      const isOwner = await checkWalletAuth()
      if (!isOwner) {
        throw new Error('Connected wallet is not the contract owner')
      }

      try {
        // Try backend authentication first
        const challengeResult = await adminAuth.getChallenge(address)

        const { message } = challengeResult.data;

        // Sign the challenge
        const signature = await walletClient.signMessage({
          message,
          account: address
        })

        // Verify signature with backend
        const verifyResult = await adminAuth.verify(address, signature, message)
        if (verifyResult.ok) {
          setIsAuthenticated(true)
          return true
        } else {
          throw new Error('Authentication failed')
        }
      } catch (backendError) {
        console.warn('Backend auth failed, using mock auth for owner wallet:', backendError)
        // If backend fails but wallet is owner, use mock auth
        localStorage.setItem('admin_mock_auth', 'true')
        setIsAuthenticated(true)
        return true
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, checkWalletAuth])

  const logout = useCallback(async () => {
    try {
      await adminAuth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_mock_auth')
      setIsAuthenticated(false)
    }
  }, [])

  const value = {
    isAuthenticated,
    loading,
    checkWalletAuth,
    authenticateWithSignature,
    logout,
    checkBackendAuth
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export default AdminAuthContext
