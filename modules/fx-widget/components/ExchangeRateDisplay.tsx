'use client'

import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExchangeRate } from '../hooks/useExchangeRate'
import { getCurrencySymbol } from '@/components/ui/currency-selector'

interface ExchangeRateDisplayProps {
  stablecoin: string
  fiatCurrency: string
  mutedClass: string
}

export function ExchangeRateDisplay({
  stablecoin,
  fiatCurrency,
  mutedClass,
}: ExchangeRateDisplayProps) {
  const { rate, loading, error } = useExchangeRate(stablecoin, fiatCurrency)
  const symbol = getCurrencySymbol(fiatCurrency)

  return (
    <motion.div
      className="flex items-center justify-center gap-2 mb-4"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <TrendingUp className={cn('w-3.5 h-3.5', mutedClass)} />
      
      {loading && !rate ? (
        <div className="flex items-center gap-1.5">
          <RefreshCw className={cn('w-3 h-3 animate-spin', mutedClass)} />
          <span className={cn('text-xs', mutedClass)}>Fetching rate...</span>
        </div>
      ) : error && !rate ? (
        <span className={cn('text-xs', mutedClass)}>Rate unavailable</span>
      ) : (
        <motion.span
          key={rate}
          className={cn('text-xs font-medium', mutedClass)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          1 {stablecoin.toUpperCase()} = {symbol}
          {rate?.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}{' '}
          {fiatCurrency.toUpperCase()}
        </motion.span>
      )}

      {loading && rate && (
        <RefreshCw className={cn('w-3 h-3 animate-spin ml-1', mutedClass)} />
      )}
    </motion.div>
  )
}

