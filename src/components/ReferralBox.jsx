import { useState } from 'react'
import { useAccount } from 'wagmi'
import { DollarSign, Users, Target } from 'lucide-react'
import { useReferral } from '../hooks/useReferral.js'
import { shortenAddress } from '../lib/format.js'
import { useToast } from './Toasts.jsx'
import { clsx } from 'clsx'

export const ReferralBox = () => {
  const { isConnected } = useAccount()
  const { referrer, userReferralLink, copyReferralLink, shareReferralLink } = useReferral()
  const { error: showError } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const copySuccess = await copyReferralLink()
    if (copySuccess) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      showError('Failed to copy link')
    }
  }

  const handleShare = (platform) => {
    shareReferralLink(platform)
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Referral Program</h3>
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Users className="shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] text-gray-300" />
          </div>
          <p className="text-gray-300 mb-4">
            Connect your wallet to get your unique referral link and start earning rewards!
          </p>
          <div className="text-sm text-gray-400">
            Earn rewards when your friends participate in the presale
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Referral Program</h3>
      
      {/* Referrer Info */}
      {referrer && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Target className="shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] text-blue-300" />
            <div>
              <h4 className="font-medium text-blue-100">You were referred by</h4>
              <p className="text-sm text-blue-200 font-mono">
                {shortenAddress(referrer)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Your Referral Link */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Referral Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={userReferralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-l-lg text-white text-sm font-mono"
            />
            <button
              onClick={handleCopy}
              className={clsx(
                'px-4 py-3 border border-l-0 border-gray-600 rounded-r-lg transition-colors',
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              )}
            >
              {copied ? (
                <svg className="shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div>
          <div className="text-sm font-medium text-gray-300 mb-3">Share on social media</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors bg-blue-500 hover:bg-blue-600"
            >
              <svg className="shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors bg-blue-600 hover:bg-blue-700"
            >
              <svg className="shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="text-sm font-medium">Telegram</span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors bg-blue-700 hover:bg-blue-800"
            >
              <svg className="shrink-0 w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Referral Benefits */}
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <h4 className="font-medium text-green-100 mb-2">Referral Benefits</h4>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• Earn rewards when friends use your link</li>
                <li>• Get bonus tokens for successful referrals</li>
                <li>• Help grow the community and ecosystem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
