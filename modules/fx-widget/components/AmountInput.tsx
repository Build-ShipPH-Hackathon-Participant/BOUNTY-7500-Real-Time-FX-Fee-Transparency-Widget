'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'
import type { Asset } from './AssetNetworkSelector'

interface AmountInputProps {
  amountInput: string
  onAmountChange: (value: string) => void
  onAmountBlur: () => void
  isFocused: boolean
  onFocus: () => void
  selectedAsset: Asset | null
  onMaxClick: () => void
  accountBalance: number
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
  selectedAsset,
  onMaxClick,
  accountBalance,
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
        <label htmlFor="amount-input" className={cn('block text-sm font-medium mb-2 transition-colors duration-300', labelClass)}>
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
            className={cn('w-full px-4 py-3 pr-32 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-300', inputBgClass)}
            style={{ '--tw-ring-color': '#FFC828' } as React.CSSProperties}
            aria-label="Stablecoin amount to send"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <motion.button
              onClick={onMaxClick}
              className="px-2 py-1 text-xs font-semibold rounded transition-all bg-[#FFC828] text-black"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Set amount to maximum balance"
            >
              MAX
            </motion.button>
            {selectedAsset && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {selectedAsset.symbol}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Account Balance Display */}
      <motion.p 
        className={cn('text-xs mb-4 transition-colors duration-300', mutedClass)} 
        variants={ITEM_VARIANTS}
        key={accountBalance}
      >
        Account balance:{' '}
        <motion.span
          key={accountBalance}
          initial={{ scale: 1.2, color: '#FFC828' }}
          animate={{ scale: 1, color: 'inherit' }}
          transition={{ duration: 0.5 }}
        >
          {accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </motion.span>{' '}
        {selectedAsset?.symbol || '---'}
      </motion.p>
    </>
  )
}
