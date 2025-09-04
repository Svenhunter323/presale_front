// src/components/ui/Tabs.jsx
import { motion } from 'framer-motion'
import { useState } from 'react'

export function Tabs({ defaultValue, children, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={`w-full ${className}`}>
      {children({ activeTab, setActiveTab })}
    </div>
  )
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex bg-white/5 rounded-xl p-1 mb-6 ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, activeTab, setActiveTab, children, className = '' }) {
  const isActive = activeTab === value

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(value)}
      className={`
        relative flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive 
          ? 'text-white' 
          : 'text-zinc-400 hover:text-zinc-200'
        }
        ${className}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 rounded-lg border border-white/10"
          transition={{ duration: 0.2 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export function TabsContent({ value, activeTab, children, className = '' }) {
  if (activeTab !== value) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
