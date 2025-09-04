import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { TARGET_CHAIN, isTargetChain, getChainName, getAddressUrl } from '../lib/chains.js'
import { PRESALE_CONTRACT_ADDRESS } from '../lib/contract.js'
import { shortenAddress } from '../lib/format.js'
import { clsx } from 'clsx'
import heroImage from '../assets/hero.png'

export const Header = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { open } = useWeb3Modal()

  const handleConnect = () => {
    open()
  }

  const handleSwitchChain = () => {
    switchChain({ chainId: TARGET_CHAIN.id })
  }

  const copyAddress = async (addr) => {
    try {
      await navigator.clipboard.writeText(addr)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const isWrongChain = isConnected && !isTargetChain(chainId)

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <img 
              src={heroImage} 
              alt="Hero" 
              className="w-8 h-8 mr-3 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold text-white flex items-center">
              WAVE Presale
            </h1>
          </div>

          {/* Chain & Connection Status */}
          <div className="flex items-center space-x-4">
            {/* Chain Badge */}
            {isConnected && (
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium border flex items-center",
                isWrongChain 
                  ? "bg-red-900 border-red-700 text-red-200"
                  : "bg-green-900 border-green-700 text-green-200"
              )}>
                {getChainName(chainId)}
              </div>
            )}

            {/* Wrong Chain Warning */}
            {isWrongChain && (
              <button
                onClick={handleSwitchChain}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
              >
                Switch to {TARGET_CHAIN.name}
              </button>
            )}

            {/* Connect/Account Button */}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-700 flex items-center"
              >
                {shortenAddress(address)}
              </button>
            )}
          </div>
        </div>

        {/* Contract Address */}
        {PRESALE_CONTRACT_ADDRESS && (
          <div className="pb-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span>Contract:</span>
              <button
                onClick={() => copyAddress(PRESALE_CONTRACT_ADDRESS)}
                className="hover:text-gray-200 transition-colors"
                title="Click to copy"
              >
                {shortenAddress(PRESALE_CONTRACT_ADDRESS)}
              </button>
              <a
                href={getAddressUrl(PRESALE_CONTRACT_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors"
                title="View on explorer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
