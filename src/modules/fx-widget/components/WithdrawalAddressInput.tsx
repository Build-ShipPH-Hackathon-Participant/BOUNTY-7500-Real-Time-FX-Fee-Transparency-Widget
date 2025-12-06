'use client'

import { motion } from 'framer-motion'
import { Scan, Copy } from 'lucide-react'
import { ITEM_VARIANTS } from '../constants'

interface WithdrawalAddressInputProps {
  value: string
  onChange: (value: string) => void
  isFocused: boolean
  onFocus: () => void
  onBlur: () => void
  isDark: boolean
  labelClass: string
  inputBgClass: string
}

export function WithdrawalAddressInput({
  value,
  onChange,
  isFocused,
  onFocus,
  onBlur,
  isDark,
  labelClass,
  inputBgClass,
}: WithdrawalAddressInputProps) {
  const handleClipboard = async () => {
    if (value) {
      await navigator.clipboard.writeText(value)
      alert('Address copied to clipboard!')
    } else {
      alert('Please enter an address first')
    }
  }

  const handleScan = () => {
    alert('QR code scan feature would open camera')
  }

  return (
    <motion.div className="mb-4" variants={ITEM_VARIANTS}>
      <label htmlFor="withdrawal-address" className={`block text-sm font-medium mb-2 ${labelClass}`}>
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
          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${inputBgClass}`}
          style={{ '--tw-ring-color': '#FFC828' } as React.CSSProperties}
          aria-label="Withdrawal address"
        />
        <motion.button
          onClick={handleScan}
          className="p-3 rounded-lg border transition-all"
          style={{
            borderColor: isDark ? '#444' : '#ddd',
            backgroundColor: isDark ? '#666' : '#f0f0f0',
          }}
          whileHover={{ scale: 1.05, backgroundColor: '#FFC828' }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scan QR code"
          title="Scan QR code"
        >
          <Scan className="w-5 h-5" />
        </motion.button>
        <motion.button
          onClick={handleClipboard}
          className="p-3 rounded-lg border transition-all"
          style={{
            borderColor: isDark ? '#444' : '#ddd',
            backgroundColor: isDark ? '#666' : '#f0f0f0',
          }}
          whileHover={{ scale: 1.05, backgroundColor: '#FFC828' }}
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

