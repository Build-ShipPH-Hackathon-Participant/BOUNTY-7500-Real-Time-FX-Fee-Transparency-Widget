'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '../utils/formatters'

interface ResultDisplayProps {
  amount: number
  netFiat: number
  symbol: string
  borderClass: string
  breakdownBgClass: string
  mutedClass: string
}

export function ResultDisplay({
  amount,
  netFiat,
  symbol,
  borderClass,
  breakdownBgClass,
  mutedClass,
}: ResultDisplayProps) {
  return (
    <AnimatePresence mode="wait">
      {amount > 0 && (
        <motion.div
          key="result"
          className={`mb-6 p-4 rounded-lg ${breakdownBgClass} border ${borderClass}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <p className={`text-sm ${mutedClass} mb-1`}>Recipient gets</p>
          <motion.p
            className="text-3xl font-bold"
            key={`net-${netFiat}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {symbol}
            {formatNumber(netFiat)}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

