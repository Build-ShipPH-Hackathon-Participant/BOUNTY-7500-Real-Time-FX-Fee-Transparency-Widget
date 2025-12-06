'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Store, MapPin, CreditCard, Hash, Building2 } from 'lucide-react'
import type { ParsedQRData } from '../types'
import { CURRENCY_SYMBOLS } from '../types'
import { formatNumber } from '../utils/formatters'

interface MerchantInfoProps {
  parsedQR: ParsedQRData | null
  borderClass: string
  breakdownBgClass: string
  labelClass: string
  mutedClass: string
  onClear?: () => void
}

export function MerchantInfo({
  parsedQR,
  borderClass,
  breakdownBgClass,
  labelClass,
  mutedClass,
  onClear,
}: MerchantInfoProps) {
  if (!parsedQR || !parsedQR.isEMVCo) {
    return null
  }

  const symbol = parsedQR.transactionCurrency 
    ? CURRENCY_SYMBOLS[parsedQR.transactionCurrency] || parsedQR.transactionCurrency
    : ''

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="merchant-info"
        className={`mb-4 p-4 rounded-lg border ${borderClass} ${breakdownBgClass}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFC828]/20">
              <Store className="w-4 h-4 text-[#FFC828]" />
            </div>
            <h3 className="text-sm font-semibold">Payment Details</h3>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              className={`text-xs ${mutedClass} hover:text-red-500 transition-colors`}
            >
              Clear
            </button>
          )}
        </div>

        {/* Merchant Name */}
        {parsedQR.merchantName && (
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            <Building2 className={`w-4 h-4 ${mutedClass} shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${mutedClass}`}>Merchant</p>
              <p className={`text-sm font-medium ${labelClass} truncate`}>
                {parsedQR.merchantName}
              </p>
            </div>
          </motion.div>
        )}

        {/* Location */}
        {parsedQR.merchantCity && (
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <MapPin className={`w-4 h-4 ${mutedClass} shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${mutedClass}`}>Location</p>
              <p className={`text-sm font-medium ${labelClass} truncate`}>
                {parsedQR.merchantCity}{parsedQR.countryCode ? `, ${parsedQR.countryCode}` : ''}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payment Provider */}
        {parsedQR.paymentProvider && (
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <CreditCard className={`w-4 h-4 ${mutedClass} shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${mutedClass}`}>Payment Provider</p>
              <p className={`text-sm font-medium ${labelClass} truncate`}>
                {parsedQR.paymentProvider}
              </p>
            </div>
          </motion.div>
        )}

        {/* Transaction ID */}
        {parsedQR.transactionId && (
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Hash className={`w-4 h-4 ${mutedClass} shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${mutedClass}`}>Reference ID</p>
              <p className={`text-xs font-mono ${labelClass} truncate`}>
                {parsedQR.transactionId}
              </p>
            </div>
          </motion.div>
        )}

        {/* Amount from QR (if present) */}
        {parsedQR.transactionAmount !== null && parsedQR.transactionAmount > 0 && (
          <motion.div
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${mutedClass}`}>Requested Amount</span>
              <span className="text-lg font-bold text-[#FFC828]">
                {symbol}{formatNumber(parsedQR.transactionAmount)}
              </span>
            </div>
            {parsedQR.transactionCurrency && (
              <p className={`text-xs ${mutedClass} text-right`}>
                {parsedQR.transactionCurrency}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

