import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { TARGET_CHAIN, SUPPORTED_CHAINS } from './chains.js'

// Get WalletConnect project ID from environment
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not work.')
}

// Configure connectors
const connectors = [
  injected(),
  ...(projectId ? [walletConnect({ projectId })] : [])
]

// Create wagmi config
export const config = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors,
  transports: {
    [TARGET_CHAIN.id]: http(),
    // Add transports for all supported chains
    ...SUPPORTED_CHAINS.reduce((acc, chain) => {
      acc[chain.id] = http()
      return acc
    }, {})
  },
})

// Create Web3Modal instance
if (projectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    chains: SUPPORTED_CHAINS,
    defaultChain: TARGET_CHAIN,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#3b82f6',
      '--w3m-border-radius-master': '8px',
    },
    featuredWalletIds: [
      // MetaMask
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      // Trust Wallet
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
      // Binance Web3 Wallet
      '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    ],
  })
}
