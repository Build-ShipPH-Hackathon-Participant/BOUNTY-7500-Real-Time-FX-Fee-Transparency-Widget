'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, Download, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '../utils/formatters'
import type { CalculationResult, ParsedQRData } from '../types'

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
  parsedQRData?: ParsedQRData | null
  onSendSuccess?: (amount: number) => void
}

// Stored receipt data interface
interface ReceiptData {
  merchantName: string
  merchantCity: string | null
  countryCode: string | null
  paymentProvider: string | null
  amount: number
  stablecoinSymbol: string
  grossFiat: number
  ripeFeeFiat: number
  networkFeeFiat: number
  fxSpreadPercent: number
  netFiat: number
  fiatSymbol: string
  fiatCurrency: string
  withdrawalAddress: string
  transactionRef: string
  transactionDate: Date
}

// Generate a unique reference number
function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TXN'
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Format date for receipt
function formatReceiptDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatReceiptTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
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
  parsedQRData,
  onSendSuccess,
}: SendConfirmationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

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
    
    // Store ALL data for receipt at the moment of confirmation
    const receipt: ReceiptData = {
      merchantName: parsedQRData?.merchantName || 'Recipient',
      merchantCity: parsedQRData?.merchantCity || null,
      countryCode: parsedQRData?.countryCode || null,
      paymentProvider: parsedQRData?.paymentProvider || null,
      amount: amount,
      stablecoinSymbol: stablecoinSymbol,
      grossFiat: calculation.grossFiat,
      ripeFeeFiat: calculation.ripeFeeFiat,
      networkFeeFiat: calculation.networkFeeFiat,
      fxSpreadPercent: calculation.fxSpreadPercent,
      netFiat: calculation.netFiat,
      fiatSymbol: fiatSymbol,
      fiatCurrency: fiatCurrency,
      withdrawalAddress: withdrawalAddress,
      transactionRef: generateReferenceNumber(),
      transactionDate: new Date(),
    }
    setReceiptData(receipt)
    
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
    setReceiptData(null)
  }

  // Generate receipt image using canvas (no html2canvas needed)
  const handleDownloadReceipt = useCallback(async () => {
    if (!receiptData) return
    
    setIsDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')
      
      // Set canvas size (2x for retina)
      const scale = 2
      const width = 350
      const height = 580
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      // Helper functions
      const drawText = (text: string, x: number, y: number, options: {
        fontSize?: number
        fontWeight?: string
        color?: string
        align?: CanvasTextAlign
        fontFamily?: string
      } = {}) => {
        const { fontSize = 13, fontWeight = 'normal', color = '#000000', align = 'left', fontFamily = 'system-ui, sans-serif' } = options
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.fillStyle = color
        ctx.textAlign = align
        ctx.fillText(text, x, y)
      }
      
      const drawLine = (y: number, dashed = false) => {
        ctx.strokeStyle = dashed ? '#cccccc' : '#dddddd'
        ctx.lineWidth = 1
        if (dashed) ctx.setLineDash([4, 4])
        else ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(24, y)
        ctx.lineTo(width - 24, y)
        ctx.stroke()
      }
      
      const drawThickLine = (y: number) => {
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(24, y)
        ctx.lineTo(width - 24, y)
        ctx.stroke()
      }
      
      let y = 40
      
      // Checkmark circle
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(width / 2, y + 20, 20, 0, Math.PI * 2)
      ctx.stroke()
      
      // Checkmark
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(width / 2 - 8, y + 20)
      ctx.lineTo(width / 2 - 2, y + 26)
      ctx.lineTo(width / 2 + 10, y + 14)
      ctx.stroke()
      
      y += 60
      
      // Header
      drawText('Transaction Sent', width / 2, y, { fontSize: 18, fontWeight: 'bold', align: 'center' })
      y += 20
      drawText('Payment successfully processed', width / 2, y, { fontSize: 12, color: '#666666', align: 'center' })
      y += 25
      
      // Dashed line
      drawLine(y, true)
      y += 25
      
      // Recipient
      drawText('SENT TO', width / 2, y, { fontSize: 10, color: '#888888', align: 'center' })
      y += 18
      drawText(receiptData.merchantName, width / 2, y, { fontSize: 16, fontWeight: 'bold', align: 'center' })
      y += 18
      if (receiptData.paymentProvider) {
        drawText(`via ${receiptData.paymentProvider}`, width / 2, y, { fontSize: 12, color: '#444444', align: 'center' })
        y += 16
      }
      if (receiptData.merchantCity) {
        drawText(`${receiptData.merchantCity}${receiptData.countryCode ? `, ${receiptData.countryCode}` : ''}`, width / 2, y, { fontSize: 11, color: '#888888', align: 'center' })
        y += 16
      }
      y += 10
      
      // Solid line
      drawLine(y)
      y += 25
      
      // Amount Sent
      drawText('Amount Sent', 24, y, { color: '#666666' })
      drawText(`${receiptData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${receiptData.stablecoinSymbol}`, width - 24, y, { fontWeight: 'bold', align: 'right' })
      y += 25
      
      // Light line
      drawLine(y)
      y += 20
      
      // Gross Amount
      drawText('Gross Amount', 24, y, { color: '#666666' })
      drawText(`${receiptData.fiatSymbol}${formatNumber(receiptData.grossFiat)}`, width - 24, y, { align: 'right' })
      y += 22
      
      // Ripe Fee
      drawText('Ripe Fee (0.5%)', 24, y, { color: '#666666' })
      drawText(`-${receiptData.fiatSymbol}${formatNumber(receiptData.ripeFeeFiat)}`, width - 24, y, { align: 'right' })
      y += 22
      
      // Network Fee
      drawText('Network Fee', 24, y, { color: '#666666' })
      drawText(`-${receiptData.fiatSymbol}${formatNumber(receiptData.networkFeeFiat)}`, width - 24, y, { align: 'right' })
      y += 22
      
      // FX Spread
      drawText('FX Spread', 24, y, { color: '#666666' })
      drawText(`${receiptData.fxSpreadPercent.toFixed(2)}%`, width - 24, y, { color: '#888888', align: 'right' })
      y += 25
      
      // Thick line for total
      drawThickLine(y)
      y += 22
      
      // Net Amount
      drawText('Recipient Received', 24, y, { fontWeight: 'bold' })
      drawText(`${receiptData.fiatSymbol}${formatNumber(receiptData.netFiat)} ${receiptData.fiatCurrency}`, width - 24, y, { fontSize: 15, fontWeight: 'bold', align: 'right' })
      y += 30
      
      // Dashed line
      drawLine(y, true)
      y += 25
      
      // Reference
      drawText('REFERENCE NUMBER', width / 2, y, { fontSize: 10, color: '#888888', align: 'center' })
      y += 18
      drawText(receiptData.transactionRef, width / 2, y, { fontSize: 13, fontWeight: 'bold', align: 'center', fontFamily: 'monospace' })
      y += 22
      drawText(formatReceiptDate(receiptData.transactionDate), width / 2, y, { fontSize: 11, color: '#666666', align: 'center' })
      y += 16
      drawText(formatReceiptTime(receiptData.transactionDate), width / 2, y, { fontSize: 11, color: '#666666', align: 'center' })
      y += 30
      
      // Footer line
      drawLine(y)
      y += 20
      
      // Branding
      drawText('Powered by', width / 2, y, { fontSize: 10, color: '#888888', align: 'center' })
      y += 16
      drawText('Ripe FX', width / 2, y, { fontSize: 13, fontWeight: 'bold', align: 'center' })
      
      // Download
      const link = document.createElement('a')
      link.download = `receipt-${receiptData.transactionRef}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to download receipt:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [receiptData])

  // Get merchant info from parsed QR data for confirmation display
  const merchantName = parsedQRData?.merchantName || 'Recipient'
  const paymentProvider = parsedQRData?.paymentProvider
  const requestedAmount = parsedQRData?.transactionAmount

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

      {/* Confirmation Modal - Receipt Style */}
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
                  'w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto',
                  'bg-white dark:bg-gray-900 border',
                  borderClass
                )}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-0">
                  <h3 className="text-xl font-bold">Confirm Transaction</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Receipt Content */}
                <div className="p-6">
                  {/* Merchant Info */}
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold">{merchantName}</h4>
                    {paymentProvider && (
                      <p className={cn('text-sm', mutedClass)}>
                        Sending via {paymentProvider}
                      </p>
                    )}
                    {parsedQRData?.merchantCity && (
                      <p className={cn('text-xs', mutedClass)}>
                        {parsedQRData.merchantCity}{parsedQRData.countryCode ? `, ${parsedQRData.countryCode}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4" />

                  {/* Transaction Details - Two Column Layout */}
                  <div className={cn('rounded-xl p-4', breakdownBgClass, 'border', borderClass)}>
                    {/* Requested Amount (if from QR) */}
                    {requestedAmount && requestedAmount > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className={cn('text-sm', mutedClass)}>Requested Amount</span>
                        <span className="font-medium">
                          {fiatSymbol}{formatNumber(requestedAmount)}
                        </span>
                      </div>
                    )}

                    {/* Sending Amount */}
                    <div className="flex justify-between items-center py-2">
                      <span className={cn('text-sm', mutedClass)}>Sending</span>
                      <span className="font-bold text-[#FFC828]">
                        {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stablecoinSymbol}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                    {/* Gross Amount */}
                    <div className="flex justify-between items-center py-2">
                      <span className={cn('text-sm', mutedClass)}>Gross Amount</span>
                      <span className="font-medium">
                        {fiatSymbol}{formatNumber(calculation.grossFiat)}
                      </span>
                    </div>

                    {/* Ripe Fee */}
                    <div className="flex justify-between items-center py-2">
                      <span className={cn('text-sm', mutedClass)}>Ripe Fee (0.5%)</span>
                      <span className="font-medium text-red-500">
                        -{fiatSymbol}{formatNumber(calculation.ripeFeeFiat)}
                      </span>
                    </div>

                    {/* Network Fee */}
                    <div className="flex justify-between items-center py-2">
                      <span className={cn('text-sm', mutedClass)}>Network Fee</span>
                      <span className="font-medium text-red-500">
                        -{fiatSymbol}{formatNumber(calculation.networkFeeFiat)}
                      </span>
                    </div>

                    {/* FX Spread */}
                    <div className="flex justify-between items-center py-2">
                      <span className={cn('text-sm', mutedClass)}>FX Spread</span>
                      <span className={cn('text-sm font-medium', mutedClass)}>
                        {calculation.fxSpreadPercent.toFixed(2)}%
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-gray-300 dark:border-gray-600 my-2" />

                    {/* Total / Net Amount */}
                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold">Recipient Gets</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {fiatSymbol}{formatNumber(calculation.netFiat)} {fiatCurrency}
                      </span>
                    </div>
                  </div>

                  {/* To Address */}
                  <div className={cn('mt-4 p-3 rounded-lg', breakdownBgClass, 'border', borderClass)}>
                    <p className={cn('text-xs mb-1', mutedClass)}>To Address</p>
                    <p className="font-mono text-xs break-all">
                      {withdrawalAddress || <span className="text-red-500">No address provided</span>}
                    </p>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className={cn(
                    'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors mt-4',
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
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal with Animated Green Check */}
      <AnimatePresence>
        {showSuccess && receiptData && (
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
                  'w-full max-w-sm rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto',
                  'bg-white dark:bg-gray-900 border',
                  borderClass
                )}
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
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
                    className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Transaction Sent!
                  </motion.h3>

                  <motion.p
                    className={cn('text-sm mb-6 text-center', mutedClass)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Your payment has been processed successfully
                  </motion.p>

                  {/* Receipt Summary */}
                  <motion.div
                    className={cn('p-4 rounded-xl mb-4', breakdownBgClass, 'border', borderClass)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {/* Recipient */}
                    <div className="text-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <p className={cn('text-xs', mutedClass)}>Sent to</p>
                      <p className="font-bold">{receiptData.merchantName}</p>
                      {receiptData.paymentProvider && (
                        <p className="text-sm text-[#FFC828]">via {receiptData.paymentProvider}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center mb-2">
                      <span className={cn('text-sm', mutedClass)}>Amount Sent</span>
                      <span className="font-bold text-[#FFC828]">
                        {receiptData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {receiptData.stablecoinSymbol}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                    {/* Fees */}
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className={mutedClass}>Gross Amount</span>
                      <span>{receiptData.fiatSymbol}{formatNumber(receiptData.grossFiat)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className={mutedClass}>Ripe Fee</span>
                      <span className="text-red-500">-{receiptData.fiatSymbol}{formatNumber(receiptData.ripeFeeFiat)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className={mutedClass}>Network Fee</span>
                      <span className="text-red-500">-{receiptData.fiatSymbol}{formatNumber(receiptData.networkFeeFiat)}</span>
                    </div>

                    <div className="border-t-2 border-gray-300 dark:border-gray-600 my-2" />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Recipient Received</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {receiptData.fiatSymbol}{formatNumber(receiptData.netFiat)} {receiptData.fiatCurrency}
                      </span>
                    </div>
                  </motion.div>

                  {/* Reference */}
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <p className={cn('text-xs', mutedClass)}>Reference Number</p>
                    <p className="font-mono text-sm font-bold">{receiptData.transactionRef}</p>
                    <p className={cn('text-xs mt-1', mutedClass)}>
                      {formatReceiptDate(receiptData.transactionDate)} • {formatReceiptTime(receiptData.transactionDate)}
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Download Receipt Button */}
                    <motion.button
                      onClick={handleDownloadReceipt}
                      disabled={isDownloading}
                      className="w-full py-3 px-6 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isDownloading ? (
                        <>
                          <motion.span
                            className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Receipt
                        </>
                      )}
                    </motion.button>

                    {/* Done Button */}
                    <motion.button
                      onClick={handleCloseSuccess}
                      className="w-full py-3 px-6 rounded-xl font-semibold bg-[#FFC828] text-black hover:bg-[#e6b423] transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Done
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
