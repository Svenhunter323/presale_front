// src/components/ui/Badge.jsx
import { motion } from 'framer-motion'

const variants = {
  default: 'bg-white/10 text-zinc-300',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  gradient: 'bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 text-white border-white/20'
}

export function Badge({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.span>
  )
}
