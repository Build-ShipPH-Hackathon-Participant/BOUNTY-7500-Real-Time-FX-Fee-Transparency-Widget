'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'
import {
  CurrencySelector as CurrencyDropdown,
  createCurrenciesFromCodes,
  type FiatCurrency,
} from '@/components/ui/currency-selector'

interface CurrencySelectorProps {
  currency: string
  supportedCurrencies: string[]
  onCurrencyChange: (currency: string) => void
  labelClass: string
  inputBgClass?: string
}

export function CurrencySelector({
  currency,
  supportedCurrencies,
  onCurrencyChange,
  labelClass,
}: CurrencySelectorProps) {
  // Convert string codes to FiatCurrency objects
  const currencies = createCurrenciesFromCodes(supportedCurrencies)

  const handleCurrencyChange = (selectedCurrency: FiatCurrency) => {
    onCurrencyChange(selectedCurrency.code)
  }

  return (
    <motion.div className="mb-6" variants={ITEM_VARIANTS}>
      <label className={cn('block text-sm font-medium mb-2 transition-colors duration-300', labelClass)}>
        Receive in
      </label>
      <CurrencyDropdown
        currencies={currencies}
        selectedCurrencyCode={currency}
        onCurrencyChange={handleCurrencyChange}
      />
    </motion.div>
  )
}
