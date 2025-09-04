import { formatUSDT, formatPercentage } from '../lib/format.js'
import { clsx } from 'clsx'

export const SoftCapProgress = ({ 
  softCapUsdtUnits, 
  raisedUsdtUnits, 
  usdtDecimals, 
  status, 
  finalized, 
  successful,
  className 
}) => {
  const percentage = formatPercentage(raisedUsdtUnits, softCapUsdtUnits)
  const softCapFormatted = formatUSDT(softCapUsdtUnits, usdtDecimals, 0)
  const raisedFormatted = formatUSDT(raisedUsdtUnits, usdtDecimals, 0)
  const remainingUsdtUnits = softCapUsdtUnits - raisedUsdtUnits
  const remainingFormatted = formatUSDT(remainingUsdtUnits > 0n ? remainingUsdtUnits : 0n, usdtDecimals, 0)

  const getStatusInfo = () => {
    if (status === 1) { // Live
      return {
        text: `Soft cap: ${softCapFormatted} USDT. Raised: ${raisedFormatted} / ${softCapFormatted}`,
        subtext: remainingUsdtUnits > 0n ? `${remainingFormatted} USDT remaining to reach soft cap` : 'Soft cap reached!',
        color: remainingUsdtUnits > 0n ? 'blue' : 'green'
      }
    } else if (status === 2 && finalized) { // Ended & Finalized
      if (successful) {
        return {
          text: 'Soft cap met. Claim opens at TGE.',
          subtext: `Final raised: ${raisedFormatted} USDT`,
          color: 'green'
        }
      } else {
        return {
          text: 'Soft cap not met. Refunds are available.',
          subtext: `Raised: ${raisedFormatted} / ${softCapFormatted} USDT`,
          color: 'red'
        }
      }
    } else {
      return {
        text: `Soft cap target: ${softCapFormatted} USDT`,
        subtext: `Currently raised: ${raisedFormatted} USDT`,
        color: 'gray'
      }
    }
  }

  const statusInfo = getStatusInfo()

  const colorClasses = {
    green: 'from-green-600 to-green-500',
    blue: 'from-blue-600 to-blue-500',
    red: 'from-red-600 to-red-500',
    gray: 'from-gray-600 to-gray-500',
  }

  const bgColorClasses = {
    green: 'bg-green-900/20 border-green-700/30',
    blue: 'bg-blue-900/20 border-blue-700/30',
    red: 'bg-red-900/20 border-red-700/30',
    gray: 'bg-gray-900/20 border-gray-700/30',
  }

  const textColorClasses = {
    green: 'text-green-100',
    blue: 'text-blue-100',
    red: 'text-red-100',
    gray: 'text-gray-100',
  }

  return (
    <div className={clsx(
      'rounded-lg border p-6',
      bgColorClasses[statusInfo.color],
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className={clsx('text-lg font-bold mb-2', textColorClasses[statusInfo.color])}>
            Soft Cap Progress
          </h3>
          <p className="text-sm opacity-90">{statusInfo.text}</p>
          <p className="text-xs opacity-75 mt-1">{statusInfo.subtext}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm opacity-90">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-800 rounded-full h-4 border border-gray-700">
              <div 
                className={clsx(
                  'h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden bg-gradient-to-r',
                  colorClasses[statusInfo.color]
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow"></div>
              </div>
            </div>
            
            {/* Percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="opacity-75 mb-1">Raised</div>
            <div className="font-bold">{raisedFormatted} USDT</div>
          </div>
          <div className="text-center">
            <div className="opacity-75 mb-1">Target</div>
            <div className="font-bold">{softCapFormatted} USDT</div>
          </div>
        </div>

        {/* Status Indicator */}
        {status === 1 && (
          <div className="flex justify-center">
            <div className={clsx(
              'flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium',
              remainingUsdtUnits > 0n 
                ? 'bg-blue-800 text-blue-200' 
                : 'bg-green-800 text-green-200'
            )}>
              <div className={clsx(
                'w-2 h-2 rounded-full animate-pulse',
                remainingUsdtUnits > 0n ? 'bg-blue-400' : 'bg-green-400'
              )}></div>
              <span>
                {remainingUsdtUnits > 0n ? 'In Progress' : 'Soft Cap Reached'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
