'use client'

import { motion } from 'framer-motion'
import { ITEM_VARIANTS } from '../constants'
import { FX_CONFIG } from '../constants'
import {
  StablecoinSelector,
  StablecoinTrigger,
  StablecoinContent,
  type Stablecoin,
} from '@/components/ui/stablecoin-selector'

interface AmountInputProps {
  amountInput: string
  onAmountChange: (value: string) => void
  onAmountBlur: () => void
  isFocused: boolean
  onFocus: () => void
  selectedStablecoin: Stablecoin
  onStablecoinChange: (coin: Stablecoin) => void
  onMaxClick: () => void
  isDark: boolean
  labelClass: string
  inputBgClass: string
  mutedClass: string
}

export function AmountInput({
  amountInput,
  onAmountChange,
  onAmountBlur,
  isFocused,
  onFocus,
  selectedStablecoin,
  onStablecoinChange,
  onMaxClick,
  isDark,
  labelClass,
  inputBgClass,
  mutedClass,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow empty string, numbers, and decimal point
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onAmountChange(inputValue)
    }
  }

  return (
    <>
      <motion.div className="mb-2" variants={ITEM_VARIANTS}>
        <label htmlFor="amount-input" className={`block text-sm font-medium mb-2 ${labelClass}`}>
          You send
        </label>
        <motion.div
          className="relative"
          animate={{
            boxShadow: isFocused ? '0 0 0 3px rgba(255, 200, 40, 0.1)' : 'none',
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            id="amount-input"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={handleChange}
            onFocus={(e) => {
              onFocus()
              e.target.select()
            }}
            onBlur={onAmountBlur}
            placeholder="0.00"
            className={`w-full px-4 py-3 pr-32 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${inputBgClass}`}
            style={{ '--tw-ring-color': '#FFC828' } as React.CSSProperties}
            aria-label="Stablecoin amount to send"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <motion.button
              onClick={onMaxClick}
              className="px-2 py-1 text-xs font-semibold rounded transition-all"
              style={{
                backgroundColor: '#FFC828',
                color: '#000',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Set amount to maximum balance"
            >
              MAX
            </motion.button>
            <StablecoinSelector
              selectedCoinId={selectedStablecoin.symbol}
              onCoinChange={onStablecoinChange}
            >
              <StablecoinTrigger isDark={isDark} />
              <StablecoinContent isDark={isDark} />
            </StablecoinSelector>
          </div>
        </motion.div>
      </motion.div>

      {/* Account Balance Display */}
      <motion.p className={`text-xs ${mutedClass} mb-4`} variants={ITEM_VARIANTS}>
        Account balance:{' '}
        {FX_CONFIG.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
        {selectedStablecoin.symbol}
      </motion.p>
    </>
  )
}

