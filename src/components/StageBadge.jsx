import { formatTokenAmount, formatBNB, formatUSDT } from '../lib/format.js'
import { clsx } from 'clsx'
import { ProgressBar } from './ProgressBar.jsx'

export const StageBadge = ({ currentStage, usdtDecimals, className }) => {
  if (!currentStage) {
    return (
      <div className={clsx('bg-gray-900 border border-gray-700 rounded-lg p-4 text-center', className)}>
        <div className="text-gray-400">All stages sold out</div>
      </div>
    )
  }

  const stageNumber = currentStage.index + 1
  const bnbPrice = formatBNB(currentStage.priceNativeWeiPerWave, 6)
  const usdtPrice = formatUSDT(currentStage.priceUsdtUnitsPerWave, usdtDecimals, 4)

  return (
    <div className={clsx(
      'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg',
      className
    )}>
      <div className="text-center space-y-3">
        {/* Stage Number */}
        <div className="inline-flex items-center px-3 py-1 bg-gray-700 rounded-full">
          <span className="text-sm font-bold text-gray-100">
            Stage {stageNumber}
          </span>
        </div>

        {/* Price Display */}
        <div className="space-y-2">
          <div className="text-lg font-bold text-white">
            Price per WAVE
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* BNB Price */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
              <div className="text-xs text-gray-300 mb-1">BNB</div>
              <div className="text-lg font-bold text-white">
                {bnbPrice}
              </div>
            </div>

            {/* USDT Price */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
              <div className="text-xs text-gray-300 mb-1">USDT</div>
              <div className="text-lg font-bold text-white">
                {usdtPrice}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Stage Progress</span>
            <span>
              {formatTokenAmount(currentStage.soldInStage)} / {formatTokenAmount(currentStage.capWave)} WAVE
            </span>
          </div>
          
          <ProgressBar 
            soldWave={currentStage.soldInStage}
            capWave={currentStage.capWave}
            gradient="green"
            showStats={false}
            showCap={false}
            height="h-6"
            className=""
          />
          
          <div className="text-xs text-gray-300 text-center mt-2">
            {formatTokenAmount(currentStage.remainingInStage)} WAVE remaining in this stage
          </div>
        </div>
      </div>
    </div>
  )
}
