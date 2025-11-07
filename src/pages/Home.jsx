import { useState } from 'react'
import { useAccount } from 'wagmi'
import { AlertTriangle } from 'lucide-react'
import { useSaleReads } from '../hooks/useSaleReads.js'
import { useReferral } from '../hooks/useReferral.js'
import { Header } from '../components/Header.jsx'
import { Hero } from '../components/Hero.jsx'
import { BackToTop } from '../components/BackToTop.jsx'
import { Footer } from '../components/Footer.jsx'
import { StatusBar } from '../components/StatusBar.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { StageBadge } from '../components/StageBadge.jsx'
import { BuyPanel } from '../components/BuyPanel.jsx'
import { ClaimPanel } from '../components/ClaimPanel.jsx'
import { RefundPanel } from '../components/RefundPanel.jsx'
import { ReferralBox } from '../components/ReferralBox.jsx'
import { EmailCapture } from '../components/EmailCapture.jsx'
import { SocialShare } from '../components/SocialShare.jsx'
import { SoftCapProgress } from '../components/SoftCapProgress.jsx'
import { TermsCheckbox } from '../components/TermsCheckbox.jsx'

export const Home = () => {
  const { isConnected } = useAccount()
  const { referrer } = useReferral()
  const [termsAccepted, setTermsAccepted] = useState(false)

  const {
    // Sale data
    status,
    soldWave,
    capWave,
    startTs,
    endTs,
    unlockTs,
    
    // Stages
    currentStage,
    
    // Soft cap
    softCapUsdtUnits,
    raisedUsdtUnits,
    
    // Finalize status
    finalized,
    successful,
    refundsEnabled,
    
    // User data
    userData,
    
    // USDT data
    usdtDecimals,
    usdtBalance,
    usdtAllowance,
    
    // Meta
    loading,
    error,
    isValidChain,
  } = useSaleReads()

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-950 text-white">
  //       <Header />
  //       <div className="flex items-center justify-center min-h-[60vh]">
  //         <div className="text-center">
  //           <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //           <p className="text-gray-300">Loading presale data...</p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4"><AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" /></div>
            <h2 className="text-xl font-bold mb-2">Failed to Load Data</h2>
            <p className="text-gray-300 mb-4">
              Unable to connect to the presale contract. Please check your network connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <Header />
      <BackToTop />
      
      {/* Add padding-top to account for fixed header */}
      <div className="pt-16">
        <Hero />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chain Guard */}
        {isConnected && !isValidChain && (
          <div className="mb-8 bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-bold text-red-100">Wrong Network</h3>
                <p className="text-sm text-red-200">
                  Please switch to BNB Smart Chain to participate in the presale.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Sale Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Bar */}
            <StatusBar 
              status={status}
              startTs={startTs}
              endTs={endTs}
              finalized={finalized}
            />

            {/* Progress Bar */}
            <ProgressBar 
              soldWave={soldWave}
              capWave={capWave}
            />

            {/* Stage Badge */}
            <StageBadge 
              currentStage={currentStage}
              usdtDecimals={usdtDecimals}
            />

            {/* Soft Cap Progress */}
            <SoftCapProgress 
              softCapUsdtUnits={softCapUsdtUnits}
              raisedUsdtUnits={raisedUsdtUnits}
              usdtDecimals={usdtDecimals}
              status={status}
              finalized={finalized}
              successful={successful}
            />

            {/* Terms Checkbox (for buy panel) */}
            {status === 1 && isConnected && isValidChain && (
              <TermsCheckbox 
                checked={termsAccepted}
                onChange={setTermsAccepted}
              />
            )}

            {/* Action Panels */}
            <div className="space-y-6">
              {/* Buy Panel - Show during live sale */}
              {status === 1 && (
                <BuyPanel 
                  currentStage={currentStage}
                  usdtDecimals={usdtDecimals}
                  usdtBalance={usdtBalance}
                  usdtAllowance={usdtAllowance}
                  referrer={referrer}
                  isValidChain={isValidChain}
                  status={status}
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                />
              )}

              {/* Claim Panel - Show after successful finalization */}
              {finalized && successful && (
                <ClaimPanel 
                  userData={userData}
                  unlockTs={unlockTs}
                  finalized={finalized}
                  successful={successful}
                  isValidChain={isValidChain}
                />
              )}

              {/* Refund Panel - Show after failed finalization */}
              {finalized && refundsEnabled && (
                <RefundPanel 
                  userData={userData}
                  finalized={finalized}
                  refundsEnabled={refundsEnabled}
                  usdtDecimals={usdtDecimals}
                  isValidChain={isValidChain}
                />
              )}
            </div>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-6">
            {/* Referral Box */}
            <ReferralBox />

            {/* Email Capture */}
            <EmailCapture />

            {/* Social Share */}
            <SocialShare />

            {/* User Stats (if connected and has data) */}
            {isConnected && userData && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Participation</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tokens Purchased:</span>
                    <span className="text-white font-medium">
                      {userData.purchasedWave ? 
                        `${(Number(userData.purchasedWave) / 1e18).toLocaleString()} WAVE` : 
                        '0 WAVE'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">BNB Contributed:</span>
                    <span className="text-white font-medium">
                      {userData.paidNative ? 
                        `${(Number(userData.paidNative) / 1e18).toFixed(4)} BNB` : 
                        '0 BNB'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">USDT Contributed:</span>
                    <span className="text-white font-medium">
                      {userData.paidUsdt ? 
                        `${(Number(userData.paidUsdt) / Math.pow(10, usdtDecimals)).toFixed(2)} USDT` : 
                        '0 USDT'
                      }
                    </span>
                  </div>

                  {userData.claimedWave > 0n && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tokens Claimed:</span>
                      <span className="text-green-400 font-medium">
                        {(Number(userData.claimedWave) / 1e18).toLocaleString()} WAVE
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <h4 className="font-medium text-yellow-100 mb-2">Important Notice</h4>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    {/* <li>• This is a high-risk investment</li> */}
                    {/* <li>• Only invest what you can afford to lose</li> */}
                    <li>• Read all terms and conditions carefully</li>
                    <li>• Ensure you're on the correct website</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      {/* Professional Footer */}
      <Footer />
    </div>
  )
}
