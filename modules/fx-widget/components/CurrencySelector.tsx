'use client'

import { motion } from 'framer-motion'
import { ITEM_VARIANTS } from '../constants'
import {
  CurrencySelector as CurrencySelectorPopover,
  CurrencyTrigger,
  CurrencyContent,
  createCurrenciesFromCodes,
  type FiatCurrency,
} from '@/components/ui/currency-selector'

interface CurrencySelectorProps {
  currency: string
  supportedCurrencies: string[]
  onCurrencyChange: (currency: string) => void
  labelClass: string
  isDark: boolean
}

export function CurrencySelector({
  currency,
  supportedCurrencies,
  onCurrencyChange,
  labelClass,
  isDark,
}: CurrencySelectorProps) {
  // Convert string codes to FiatCurrency objects
  const currencies = createCurrenciesFromCodes(supportedCurrencies)

  const handleCurrencyChange = (selectedCurrency: FiatCurrency) => {
    onCurrencyChange(selectedCurrency.code)
  }

  return (
    <motion.div className="mb-6" variants={ITEM_VARIANTS}>
      <label className={`block text-sm font-medium mb-2 ${labelClass}`}>
        Receive in
      </label>
      <CurrencySelectorPopover
        currencies={currencies}
        selectedCurrencyCode={currency}
        onCurrencyChange={handleCurrencyChange}
      >
        <CurrencyTrigger isDark={isDark} />
        <CurrencyContent isDark={isDark} title="Select Currency" />
      </CurrencySelectorPopover>
    </motion.div>
  )
}
