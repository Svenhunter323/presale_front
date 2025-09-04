// src/components/ui/Input.jsx
import { motion } from 'framer-motion'

export function Input({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        className={`
          w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
          text-white placeholder-zinc-400
          focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50
          transition-all duration-200
          ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

export function TextArea({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        className={`
          w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
          text-white placeholder-zinc-400
          focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50
          transition-all duration-200 resize-none
          ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
