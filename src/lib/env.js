// src/lib/env.js
// Environment variables with validation and consolidation
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS
export const EXPLORER_BASE = import.meta.env.VITE_EXPLORER_BASE || 'https://testnet.bscscan.com'
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN

// Consolidated base URL (optional). If provided, we use it as a fallback for both public/app URLs and API base.
const BASE_URL = import.meta.env.VITE_BASE_URL

// Prefer VITE_PUBLIC_BASE_URL, then fall back to consolidated VITE_BASE_URL, then default
export const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || BASE_URL || 'https://presale.example.com'

// Prefer VITE_API_BASE_URL, then fall back to consolidated VITE_BASE_URL, then default
export const API_BASE = import.meta.env.VITE_API_BASE_URL || BASE_URL || 'https://api.your-domain.tld'

// VITE_TARGET_CHAIN_ID for backward compatibility
export const CHAIN_ID = Number(import.meta.env.VITE_TARGET_CHAIN_ID || 97)
export const TARGET_CHAIN_ID = CHAIN_ID

// Validation
if (!WALLETCONNECT_PROJECT_ID) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is not set')
}

if (!CONTRACT_ADDRESS) {
  throw new Error('VITE_CONTRACT_ADDRESS is required')
}

if (!USDT_ADDRESS) {
  throw new Error('VITE_USDT_ADDRESS is required')
}

// Chain configuration
export const CHAIN_CONFIG = {
  56: {
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    explorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org'
  },
  97: {
    name: 'BNB Smart Chain Testnet',
    shortName: 'BSC Testnet',
    explorerUrl: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  }
}

export const getCurrentChainConfig = () => CHAIN_CONFIG[CHAIN_ID]

export const getBscScanUrl = (hash, type = 'tx') => {
  const config = getCurrentChainConfig()
  if (!config) return '#'
  return `${config.explorerUrl}/${type}/${hash}`
}

// Helper functions (defined after getBscScanUrl)
export const getBscScanTxUrl = (hash) => getBscScanUrl(hash, 'tx')
export const getBscScanAddressUrl = (address) => getBscScanUrl(address, 'address')
export const txUrl = (hash) => getBscScanUrl(hash, 'tx')
export const addrUrl = (addr) => getBscScanUrl(addr, 'address')

export const formatChainName = () => getCurrentChainConfig()?.name || 'Unknown Chain'
