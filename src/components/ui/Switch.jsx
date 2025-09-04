// src/components/ui/Switch.jsx
import { motion } from 'framer-motion'

export function Switch({ 
  checked, 
  onCheckedChange, 
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        ${checked 
          ? 'bg-gradient-to-r from-teal-400 to-cyan-400' 
          : 'bg-white/20'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      <motion.span
        layout
        transition={{ duration: 0.2 }}
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </motion.button>
  )
}
