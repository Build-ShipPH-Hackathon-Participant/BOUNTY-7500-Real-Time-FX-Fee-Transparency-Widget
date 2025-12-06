'use client'

import { motion } from 'framer-motion'
import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'

interface WithdrawalAddressInputProps {
  value: string
  onChange: (value: string) => void
  isFocused: boolean
  onFocus: () => void
  onBlur: () => void
  labelClass: string
  inputBgClass: string
}

export function WithdrawalAddressInput({
  value,
  onChange,
  isFocused,
  onFocus,
  onBlur,
  labelClass,
  inputBgClass,
}: WithdrawalAddressInputProps) {
  const handleClipboard = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value)
        alert('Address copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        alert('Failed to copy address to clipboard')
      }
    } else {
      alert('Please enter an address first')
    }
  }


  return (
    <motion.div className="mb-4" variants={ITEM_VARIANTS}>
      <label htmlFor="withdrawal-address" className={cn('block text-sm font-medium mb-2 transition-colors duration-300', labelClass)}>
        Withdrawal Address
      </label>
      <motion.div
        className="relative flex gap-2"
        animate={{
          boxShadow: isFocused ? '0 0 0 3px rgba(255, 200, 40, 0.1)' : 'none',
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          id="withdrawal-address"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Enter withdrawal address"
          className={cn('flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-300', inputBgClass)}
          style={{ '--tw-ring-color': '#FFC828' } as React.CSSProperties}
          aria-label="Withdrawal address"
        />
        <motion.button
          onClick={handleClipboard}
          className="p-3 rounded-lg border transition-all duration-300 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-[#FFC828] hover:border-[#FFC828]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Copy address to clipboard"
          title="Copy address to clipboard"
        >
          <Copy className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
