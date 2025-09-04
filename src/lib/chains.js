import { bsc, bscTestnet } from 'viem/chains'

// Get target chain from environment
const targetChainId = parseInt(import.meta.env.VITE_TARGET_CHAIN_ID || '56')

// Chain configurations
export const BSC_MAINNET = {
  ...bsc,
  id: 56,
  name: 'BSC',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed1.binance.org'],
    },
    public: {
      http: ['https://bsc-dataseed1.binance.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://bscscan.com',
    },
  },
}

export const BSC_TESTNET = {
  ...bscTestnet,
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
    public: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan Testnet',
      url: 'https://testnet.bscscan.com',
    },
  },
}

// Get the target chain based on environment
export const TARGET_CHAIN = targetChainId === 97 ? BSC_TESTNET : BSC_MAINNET

// Supported chains array
export const SUPPORTED_CHAINS = [BSC_MAINNET, BSC_TESTNET]

// Explorer URL builders
export const getExplorerBaseUrl = () => {
  return import.meta.env.VITE_EXPLORER_BASE || TARGET_CHAIN.blockExplorers.default.url
}

export const getTxUrl = (hash) => {
  return `${getExplorerBaseUrl()}/tx/${hash}`
}

export const getAddressUrl = (address) => {
  return `${getExplorerBaseUrl()}/address/${address}`
}

// Chain validation
export const isTargetChain = (chainId) => {
  return chainId === TARGET_CHAIN.id
}

export const getChainName = (chainId) => {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
  return chain?.name || 'Unknown Chain'
}
