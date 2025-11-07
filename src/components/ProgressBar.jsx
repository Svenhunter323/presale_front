import { motion } from 'framer-motion'
import { formatTokenAmount, formatPercentage } from '../lib/format.js'
import { clsx } from 'clsx'

// Gradient color presets
const GRADIENT_PRESETS = {
  primary: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
  green: 'linear-gradient(90deg, #10b981, #34d399)',
  blue: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  red: 'linear-gradient(90deg, #ef4444, #f87171)',
  purple: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
  teal: 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
}

export const ProgressBar = ({ 
  soldWave, 
  capWave, 
  className,
  // Alternative props for percentage-based progress
  value,
  max = 100,
  // Customization options
  gradient = 'primary',
  showStats = true,
  showLabel = true,
  showCap = true,
  height = 'h-6',
  animationDuration = 1
}) => {
  // Calculate percentage based on props
  let percentage
  let remaining
  
  if (soldWave !== undefined && capWave !== undefined) {
    percentage = formatPercentage(soldWave, capWave)
    remaining = capWave - soldWave
  } else if (value !== undefined) {
    percentage = Math.min((value / max) * 100, 100).toFixed(1)
  } else {
    percentage = 0
  }

  // Get gradient style
  const gradientStyle = typeof gradient === 'string' && GRADIENT_PRESETS[gradient]
    ? GRADIENT_PRESETS[gradient]
    : gradient

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Progress Stats */}
      {showStats && soldWave !== undefined && capWave !== undefined && (
        <div className="flex justify-between items-center text-sm">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-gray-300"
          >
            <span className="font-medium">Sold:</span>{' '}
            <span className="text-white font-bold">{formatTokenAmount(soldWave)} WAVE</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-gray-300"
          >
            <span className="font-medium">Remaining:</span>{' '}
            <span className="text-white font-bold">{formatTokenAmount(remaining)} WAVE</span>
          </motion.div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className={clsx('w-full bg-gray-800/50 rounded-full border border-gray-700/50 backdrop-blur-sm overflow-hidden', height)}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: animationDuration, ease: "easeOut" }}
            className="h-full rounded-full relative overflow-hidden"
            style={{
              backgroundImage: gradientStyle,
              backgroundSize: '200% 100%'
            }}
          >
            {/* Animated shine effect */}
            <motion.div 
              animate={{ 
                x: ['-100%', '200%']
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            {/* Animated gradient */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                backgroundSize: '200% 100%'
              }}
            />
          </motion.div>
        </div>
        
        {/* Percentage label with glow */}
        {showLabel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-sm font-bold text-white drop-shadow-lg bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {percentage}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Total Cap */}
      {showCap && soldWave !== undefined && capWave !== undefined && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-400"
        >
          <span className="font-medium">Total Cap:</span>{' '}
          <span className="text-white font-bold">{formatTokenAmount(capWave)} WAVE</span>
        </motion.div>
      )}
    </div>
  )
}
