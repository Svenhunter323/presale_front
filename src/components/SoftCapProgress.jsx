import { formatUSDT, formatPercentage } from '../lib/format.js'
import { clsx } from 'clsx'
import { ProgressBar } from './ProgressBar.jsx'

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

  const gradientColors = {
    green: 'linear-gradient(90deg, #10b981, #34d399)',
    blue: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    red: 'linear-gradient(90deg, #ef4444, #f87171)',
    gray: 'linear-gradient(90deg, #6b7280, #9ca3af)',
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
        <ProgressBar 
          value={percentage}
          max={100}
          gradient={gradientColors[statusInfo.color]}
          showStats={false}
          showCap={false}
          showLabel={true}
          height="h-6"
          className=""
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="text-center">
            <div className="opacity-75 mb-1">Raised</div>
            <div className="font-bold text-lg">{raisedFormatted} USDT</div>
          </div>
          <div className="text-center">
            <div className="opacity-75 mb-1">Target</div>
            <div className="font-bold text-lg">{softCapFormatted} USDT</div>
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
