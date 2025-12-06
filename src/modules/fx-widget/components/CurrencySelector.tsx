'use client'

import { motion } from 'framer-motion'
import { ITEM_VARIANTS } from '../constants'

interface CurrencySelectorProps {
  currency: string
  supportedCurrencies: string[]
  onCurrencyChange: (currency: string) => void
  labelClass: string
  inputBgClass: string
}

export function CurrencySelector({
  currency,
  supportedCurrencies,
  onCurrencyChange,
  labelClass,
  inputBgClass,
}: CurrencySelectorProps) {
  return (
    <motion.div className="mb-6" variants={ITEM_VARIANTS}>
      <label htmlFor="currency-select" className={`block text-sm font-medium mb-2 ${labelClass}`}>
        Receive in
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${inputBgClass}`}
        style={{ '--tw-ring-color': '#FFC828' } as React.CSSProperties}
        aria-label="Select fiat currency"
      >
        {supportedCurrencies.map((curr) => (
          <option key={curr} value={curr}>
            {curr}
          </option>
        ))}
      </select>
    </motion.div>
  )
}

