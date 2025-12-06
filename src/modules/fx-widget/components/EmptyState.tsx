'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface EmptyStateProps {
  amount: number
  borderClass: string
  breakdownBgClass: string
  mutedClass: string
}

export function EmptyState({ amount, borderClass, breakdownBgClass, mutedClass }: EmptyStateProps) {
  return (
    <AnimatePresence mode="wait">
      {amount === 0 && (
        <motion.div
          key="empty"
          className={`p-6 text-center rounded-lg border ${borderClass} ${breakdownBgClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className={mutedClass}>Enter an amount to see your breakdown and fees</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

