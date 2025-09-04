// src/components/ui/ProgressBar.jsx
import { motion } from 'framer-motion'

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '',
  showLabel = true,
  label = '',
  ...props 
}) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-zinc-300">{label}</span>
          <span className="text-white font-medium">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 rounded-full"
        />
      </div>
    </div>
  )
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 120,
  strokeWidth = 8,
  className = '',
  children,
  ...props 
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} {...props}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</div>
          </div>
        )}
      </div>
    </div>
  )
}
