'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'
import { FX_CONFIG } from '../constants'
import { formatNumber } from '../utils/formatters'
import type { CalculationResult } from '../types'

interface FeeBreakdownProps {
  amount: number
  calculation: CalculationResult
  symbol: string
  borderClass: string
  breakdownBgClass: string
  labelClass: string
  mutedClass: string
}

export function FeeBreakdown({
  amount,
  calculation,
  symbol,
  borderClass,
  breakdownBgClass,
  labelClass,
  mutedClass,
}: FeeBreakdownProps) {
  return (
    <AnimatePresence mode="wait">
      {amount > 0 && (
        <motion.div
          key="breakdown"
          className={`p-4 rounded-lg border ${borderClass} ${breakdownBgClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-sm font-semibold mb-4">Fee breakdown</h3>

          {/* Gross */}
          <motion.div
            className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-gray-600"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm ${labelClass}`}>Gross amount</span>
            </div>
            <span className="font-medium">
              {symbol}
              {formatNumber(calculation.grossFiat)}
            </span>
          </motion.div>

          {/* Ripe Fee */}
          <motion.div
            className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-gray-600"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm ${labelClass}`}>Ripe fee</span>
              <div className="group relative">
                <Info className={`w-4 h-4 cursor-help ${mutedClass}`} aria-label="Information about Ripe fee" />
                <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none">
                  {FX_CONFIG.ripeFeePercent}% of gross amount
                </div>
              </div>
            </div>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{symbol}
              {formatNumber(calculation.ripeFeeFiat)}
            </span>
          </motion.div>

          {/* Network Fee */}
          <motion.div
            className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-gray-600"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm ${labelClass}`}>Network fee</span>
              <div className="group relative">
                <Info className={`w-4 h-4 cursor-help ${mutedClass}`} aria-label="Information about network fee" />
                <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none">
                  ${FX_CONFIG.networkFeeUsd} USD equivalent
                </div>
              </div>
            </div>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{symbol}
              {formatNumber(calculation.networkFeeFiat)}
            </span>
          </motion.div>

          {/* FX Spread */}
          <motion.div
            className="flex justify-between items-center mb-3 pb-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm ${labelClass}`}>FX spread</span>
              <div className="group relative">
                <Info className={`w-4 h-4 cursor-help ${mutedClass}`} aria-label="Information about FX spread" />
                <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none">
                  Difference between interbank & customer rates
                </div>
              </div>
            </div>
            <span className={`text-sm font-medium ${mutedClass}`}>
              {calculation.fxSpreadPercent.toFixed(2)}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

