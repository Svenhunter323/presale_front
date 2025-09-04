// src/components/ui/Dialog.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button.jsx'

export function Dialog({ open, onClose, children, className = '' }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
          >
            <div className="bg-[#0B0E13] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function DialogHeader({ children, onClose }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {children}
      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export function DialogTitle({ children, className = '' }) {
  return (
    <h2 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h2>
  )
}

export function DialogContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
