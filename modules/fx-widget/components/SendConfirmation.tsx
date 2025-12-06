'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '../utils/formatters'
import type { CalculationResult } from '../types'

interface SendConfirmationProps {
  amount: number
  stablecoinSymbol: string
  withdrawalAddress: string
  calculation: CalculationResult
  fiatSymbol: string
  fiatCurrency: string
  borderClass: string
  breakdownBgClass: string
  labelClass: string
  mutedClass: string
  onSendSuccess?: (amount: number) => void
}

export function SendConfirmation({
  amount,
  stablecoinSymbol,
  withdrawalAddress,
  calculation,
  fiatSymbol,
  fiatCurrency,
  borderClass,
  breakdownBgClass,
  labelClass,
  mutedClass,
  onSendSuccess,
}: SendConfirmationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [sentAmount, setSentAmount] = useState(0)
  const [sentFiat, setSentFiat] = useState(0)

  const handleSendClick = () => {
    if (amount > 0) {
      setIsOpen(true)
      setIsConfirmed(false)
    }
  }

  const handleConfirmSend = async () => {
    if (!isConfirmed) return
    
    setIsSending(true)
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Store sent amounts for success screen
    setSentAmount(amount)
    setSentFiat(calculation.netFiat)
    
    setIsSending(false)
    setIsOpen(false)
    setIsConfirmed(false)
    
    // Trigger balance update
    onSendSuccess?.(amount)
    
    // Show success modal
    setShowSuccess(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setSentAmount(0)
    setSentFiat(0)
  }

  if (amount <= 0 && !showSuccess) return null

  return (
    <>
      {/* Send Button */}
      {amount > 0 && (
        <motion.button
          onClick={handleSendClick}
          className="w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 bg-[#FFC828] text-black hover:bg-[#e6b423] active:scale-[0.98] shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Send {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stablecoinSymbol}
        </motion.button>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={cn(
                  'w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto',
                  'bg-white dark:bg-gray-900 border',
                  borderClass
                )}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Confirm Transaction</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Amount Display */}
                <div className={cn('p-4 rounded-xl mb-4', breakdownBgClass, 'border', borderClass)}>
                  <p className={cn('text-sm mb-1', mutedClass)}>You are sending</p>
                  <p className="text-2xl font-bold text-[#FFC828]">
                    {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stablecoinSymbol}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowRight className="w-4 h-4 text-[#FFC828]" />
                    <p className={cn('text-sm', mutedClass)}>
                      Recipient gets{' '}
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {fiatSymbol}{formatNumber(calculation.netFiat)} {fiatCurrency}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Withdrawal Address */}
                <div className={cn('p-4 rounded-xl mb-4', breakdownBgClass, 'border', borderClass)}>
                  <p className={cn('text-sm mb-1', mutedClass)}>To Address</p>
                  <p className="font-mono text-sm font-medium break-all">
                    {withdrawalAddress || <span className="text-red-500">No address provided</span>}
                  </p>
                </div>

                {/* Fee Breakdown */}
                <div className={cn('p-4 rounded-xl mb-4', breakdownBgClass, 'border', borderClass)}>
                  <p className={cn('text-sm font-semibold mb-3', labelClass)}>Fee Breakdown</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={mutedClass}>Gross Amount</span>
                      <span className="font-medium">{fiatSymbol}{formatNumber(calculation.grossFiat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedClass}>Ripe Fee</span>
                      <span className="font-medium text-red-500">-{fiatSymbol}{formatNumber(calculation.ripeFeeFiat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedClass}>Network Fee</span>
                      <span className="font-medium text-red-500">-{fiatSymbol}{formatNumber(calculation.networkFeeFiat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={mutedClass}>FX Spread</span>
                      <span className="font-medium">{calculation.fxSpreadPercent.toFixed(2)}%</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Net Amount</span>
                        <span className="text-green-600 dark:text-green-400">{fiatSymbol}{formatNumber(calculation.netFiat)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <label className={cn(
                  'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors',
                  breakdownBgClass,
                  'border',
                  isConfirmed ? 'border-[#FFC828]' : borderClass
                )}>
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      isConfirmed 
                        ? 'bg-[#FFC828] border-[#FFC828]' 
                        : 'border-gray-300 dark:border-gray-600'
                    )}>
                      {isConfirmed && <Check className="w-3 h-3 text-black" />}
                    </div>
                  </div>
                  <span className={cn('text-sm leading-tight', labelClass)}>
                    I have verified all the information above is correct. I understand this transaction cannot be reversed.
                  </span>
                </label>

                {/* Warning */}
                {!withdrawalAddress && (
                  <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Please enter a withdrawal address before sending.</span>
                  </div>
                )}

                {/* Send Button */}
                <motion.button
                  onClick={handleConfirmSend}
                  disabled={!isConfirmed || !withdrawalAddress || isSending}
                  className={cn(
                    'w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300',
                    isConfirmed && withdrawalAddress
                      ? 'bg-[#FFC828] text-black hover:bg-[#e6b423] cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  )}
                  whileHover={isConfirmed && withdrawalAddress ? { scale: 1.02 } : {}}
                  whileTap={isConfirmed && withdrawalAddress ? { scale: 0.98 } : {}}
                >
                  {isSending ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Sending...
                    </span>
                  ) : (
                    'Confirm & Send'
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSuccess}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={cn(
                  'w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center',
                  'bg-white dark:bg-gray-900 border',
                  borderClass
                )}
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated Success Icon */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                  {/* Outer ring animation */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-green-500"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  
                  {/* Pulse rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-400"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-400"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                  />

                  {/* Inner circle with icon */}
                  <motion.div
                    className="absolute inset-2 rounded-full bg-green-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, delay: 0.5, type: 'spring' }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Sparkles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: [0, Math.cos((i * 60) * Math.PI / 180) * 50],
                        y: [0, Math.sin((i * 60) * Math.PI / 180) * 50],
                      }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                    >
                      <Sparkles className="w-4 h-4 text-[#FFC828]" />
                    </motion.div>
                  ))}
                </div>

                {/* Success Text */}
                <motion.h3
                  className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Transaction Sent!
                </motion.h3>

                <motion.p
                  className={cn('text-sm mb-4', mutedClass)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Your transaction has been submitted successfully
                </motion.p>

                {/* Amount sent */}
                <motion.div
                  className={cn('p-4 rounded-xl mb-6', breakdownBgClass, 'border', borderClass)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className={cn('text-xs mb-1', mutedClass)}>Amount Sent</p>
                  <p className="text-xl font-bold text-[#FFC828]">
                    {sentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stablecoinSymbol}
                  </p>
                  <p className={cn('text-sm mt-1', mutedClass)}>
                    ≈ {fiatSymbol}{formatNumber(sentFiat)} {fiatCurrency}
                  </p>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  onClick={handleCloseSuccess}
                  className="w-full py-3 px-6 rounded-xl font-semibold bg-[#FFC828] text-black hover:bg-[#e6b423] transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Done
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
