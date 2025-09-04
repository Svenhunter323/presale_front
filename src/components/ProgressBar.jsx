import { formatTokenAmount, formatPercentage } from '../lib/format.js'
import { clsx } from 'clsx'

export const ProgressBar = ({ soldWave, capWave, className }) => {
  const percentage = formatPercentage(soldWave, capWave)
  const remaining = capWave - soldWave

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Progress Stats */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-300">
          <span className="font-medium">Sold:</span>{' '}
          <span className="text-white">{formatTokenAmount(soldWave)} WAVE</span>
        </div>
        <div className="text-gray-300">
          <span className="font-medium">Remaining:</span>{' '}
          <span className="text-white">{formatTokenAmount(remaining)} WAVE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-800 rounded-full h-4 border border-gray-700">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
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

      {/* Total Cap */}
      <div className="text-center text-sm text-gray-400">
        <span className="font-medium">Total Cap:</span>{' '}
        <span className="text-white">{formatTokenAmount(capWave)} WAVE</span>
      </div>
    </div>
  )
}
