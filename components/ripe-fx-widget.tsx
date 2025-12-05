/**
 * RipeFxWidget - FX & Fee Transparency Widget for Ripe
 *
 * A compact, trust-focused widget that converts stablecoin (USDC) to local fiat
 * with explicit itemization of all fees and the FX spread.
 *
 * Props:
 * - initialAmount?: number - Starting stablecoin amount (default: 100)
 * - supportedCurrencies?: string[] - List of fiat currencies (default: ['PHP', 'THB'])
 * - theme?: 'light' | 'dark' - Theme mode (default: 'light')
 * - onNetAmountChange?: (amount: number) => void - Callback when net amount changes
 *
 * Constants to customize (at the top of the component):
 * - MOCK_CONFIG: FX rates, fees, network costs
 *
 * Usage:
 * <RipeFxWidget
 *   initialAmount={100}
 *   supportedCurrencies={['PHP', 'THB', 'SGD']}
 *   theme="dark"
 *   onNetAmountChange={(amount) => console.log('Net:', amount)}
 * />
 */

"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Info, Scan, Copy, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// ============================================================================
// MOCK CONFIGURATION - Customize these values for different rates/fees
// ============================================================================
const MOCK_CONFIG = {
  // FX rates per currency (stablecoin = USDC)
  interbankRates: {
    PHP: 59.0,
    THB: 34.5,
    SGD: 1.35,
  },
  customerRates: {
    PHP: 58.5,
    THB: 34.0,
    SGD: 1.33,
  },
  // Ripe transaction fee as percentage of stablecoin amount
  ripeFeePercent: 0.5,
  // Network fee in USD equivalent
  networkFeeUsd: 2.0,
  accountBalance: 10000, // User's USDC/USDT account balance
  accountCurrency: "USDT", // Default account currency
}

const STABLECOINS = [
  { symbol: "USDC", name: "USD Coin", icon: "🔵" },
  { symbol: "USDT", name: "Tether", icon: "🟢" },
  { symbol: "PYUSD", name: "PayPal USD", icon: "🔴" },
  { symbol: "FDUSD", name: "First Digital USD", icon: "🟡" },
  { symbol: "BUSD", name: "Binance USD", icon: "🟣" },
]

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface CalculationResult {
  grossFiat: number
  ripeFeeFiat: number
  networkFeeFiat: number
  fxSpreadPercent: number
  fxSpreadFiat: number
  netFiat: number
}

interface RipeFxWidgetProps {
  initialAmount?: number
  supportedCurrencies?: string[]
  theme?: "light" | "dark"
  onNetAmountChange?: (amount: number) => void
}

// ============================================================================
// PURE CALCULATION FUNCTIONS (Unit-testable)
// ============================================================================
/**
 * Format a number as currency using Intl API
 */
function formatCurrency(value: number, currencyCode: string, decimals = 2): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch {
    // Fallback for unsupported currencies
    return `${currencyCode} ${value.toFixed(decimals)}`
  }
}

/**
 * Calculate gross fiat amount from stablecoin
 */
function calculateGross(amountUsdc: number, customerRate: number): number {
  return amountUsdc * customerRate
}

/**
 * Calculate Ripe transaction fee in fiat
 */
function calculateRipeFee(grossFiat: number, ripeFeePercent: number): number {
  return (grossFiat * ripeFeePercent) / 100
}

/**
 * Calculate network fee converted to local fiat
 */
function calculateNetworkFeeLocal(networkFeeUsd: number, customerRate: number): number {
  return networkFeeUsd * customerRate
}

/**
 * Calculate FX spread as a percentage of interbank rate
 */
function calculateFxSpreadPercent(interbankRate: number, customerRate: number): number {
  return ((interbankRate - customerRate) / interbankRate) * 100
}

/**
 * Calculate FX spread in fiat amount
 */
function calculateFxSpreadFiat(amountUsdc: number, interbankRate: number, customerRate: number): number {
  return amountUsdc * (interbankRate - customerRate)
}

/**
 * Main calculation function - returns all breakdown components
 */
function calculateNetReceived(
  amountUsdc: number,
  customerRate: number,
  interbankRate: number,
  ripeFeePct: number,
  networkFeeUsd: number,
): CalculationResult {
  const grossFiat = calculateGross(amountUsdc, customerRate)
  const ripeFeeFiat = calculateRipeFee(grossFiat, ripeFeePct)
  const networkFeeFiat = calculateNetworkFeeLocal(networkFeeUsd, customerRate)
  const fxSpreadPercent = calculateFxSpreadPercent(interbankRate, customerRate)
  const fxSpreadFiat = calculateFxSpreadFiat(amountUsdc, interbankRate, customerRate)

  return {
    grossFiat,
    ripeFeeFiat,
    networkFeeFiat,
    fxSpreadPercent,
    fxSpreadFiat,
    netFiat: grossFiat - ripeFeeFiat - networkFeeFiat,
  }
}

// ============================================================================
// HOOKS
// ============================================================================
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// ============================================================================
// REACT COMPONENT
// ============================================================================
export const RipeFxWidget: React.FC<RipeFxWidgetProps> = ({
  initialAmount = 100,
  supportedCurrencies = ["PHP", "THB"],
  theme = "light",
  onNetAmountChange,
}) => {
  // State
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>("")
  const [amount, setAmount] = useState<number>(Math.max(0, initialAmount))
  const [currency, setCurrency] = useState<string>(supportedCurrencies[0])
  const [direction, setDirection] = useState<"send" | "receive">("send")
  const [isFocused, setIsFocused] = useState<"address" | "amount" | null>(null)
  const [selectedStablecoin, setSelectedStablecoin] = useState<string>("USDT")
  const [showCoinModal, setShowCoinModal] = useState<boolean>(false)
  const [sliderValue, setSliderValue] = useState<number>(0)

  const debouncedAmount = useDebounce(amount, 300)

  const validCurrency = supportedCurrencies.includes(currency) ? currency : supportedCurrencies[0]

  const interbankRate = MOCK_CONFIG.interbankRates[validCurrency as keyof typeof MOCK_CONFIG.interbankRates] || 1
  const customerRate = MOCK_CONFIG.customerRates[validCurrency as keyof typeof MOCK_CONFIG.customerRates] || 1

  const calculation = useMemo(() => {
    const validAmount = Math.max(0, debouncedAmount)
    if (validAmount === 0) {
      return {
        grossFiat: 0,
        ripeFeeFiat: 0,
        networkFeeFiat: 0,
        fxSpreadPercent: 0,
        fxSpreadFiat: 0,
        netFiat: 0,
      }
    }

    return calculateNetReceived(
      validAmount,
      customerRate,
      interbankRate,
      MOCK_CONFIG.ripeFeePercent,
      MOCK_CONFIG.networkFeeUsd,
    )
  }, [debouncedAmount, customerRate, interbankRate])

  useEffect(() => {
    onNetAmountChange?.(calculation.netFiat)
  }, [calculation.netFiat, onNetAmountChange])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(e.target.value)
    setSliderValue(percentage)
    const calculatedAmount = (MOCK_CONFIG.accountBalance * percentage) / 100
    setAmount(calculatedAmount)
  }

  const handleClipboard = async () => {
    if (withdrawalAddress) {
      await navigator.clipboard.writeText(withdrawalAddress)
      alert("Address copied to clipboard!")
    } else {
      alert("Please enter an address first")
    }
  }

  const handleScan = () => {
    alert("QR code scan feature would open camera")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0
    const validAmount = Math.max(0, value)
    setAmount(validAmount)
    setSliderValue((validAmount / MOCK_CONFIG.accountBalance) * 100)
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value)
  }

  const toggleDirection = () => {
    setDirection(direction === "send" ? "receive" : "send")
  }

  const handleMaxBalance = () => {
    setAmount(MOCK_CONFIG.accountBalance)
    setSliderValue(100)
  }

  const handleWithdrawalAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawalAddress(e.target.value)
  }

  const bgClass = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
  const borderClass = theme === "dark" ? "border-gray-700" : "border-gray-200"
  const inputBgClass = theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"
  const labelClass = theme === "dark" ? "text-gray-300" : "text-gray-600"
  const mutedClass = theme === "dark" ? "text-gray-400" : "text-gray-500"
  const breakdownBgClass = theme === "dark" ? "bg-gray-800" : "bg-gray-50"

  const currencySymbols: Record<string, string> = {
    PHP: "₱",
    THB: "฿",
    SGD: "$",
    USD: "$",
  }

  const symbol = currencySymbols[validCurrency] || validCurrency

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }

  return (
    <motion.div
      className={`w-full max-w-md mx-auto p-6 rounded-lg border ${borderClass} ${bgClass} transition-colors`}
      role="region"
      aria-label="FX and fee transparency widget"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ripe logo at the top */}
      <motion.div className="mb-6 flex justify-center" variants={itemVariants}>
        <img src="/images/zxcasd.png" alt="Ripe Logo" className="h-12" />
      </motion.div>

      {/* Header */}
      <motion.div className="mb-6" variants={itemVariants}>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Convert & Receive</h2>
        <p className={`text-sm ${mutedClass}`}>See exactly what you'll receive after all fees</p>
      </motion.div>

      {/* Direction Toggle with enhanced hover */}
      <motion.div className="mb-4 flex gap-2" variants={itemVariants}>
        {["Send", "Receive"].map((dir) => (
          <button
            key={dir}
            onClick={() => setDirection(dir.toLowerCase() as "send" | "receive")}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded transition-all duration-300 group relative overflow-hidden`}
            style={{
              backgroundColor: direction === dir.toLowerCase() ? "#FFC828" : "transparent",
              color: direction === dir.toLowerCase() ? "#000" : "inherit",
              border: direction === dir.toLowerCase() ? "none" : `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
            }}
            aria-pressed={direction === dir.toLowerCase()}
          >
            <span className="relative z-10">{dir}</span>
            <motion.div
              className="absolute inset-0 bg-opacity-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            />
          </button>
        ))}
      </motion.div>

      {/* Withdrawal Address Input with animation */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label htmlFor="withdrawal-address" className={`block text-sm font-medium mb-2 ${labelClass}`}>
          Withdrawal Address
        </label>
        <motion.div
          className="relative flex gap-2"
          animate={{
            boxShadow: isFocused === "address" ? "0 0 0 3px rgba(255, 200, 40, 0.1)" : "none",
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            id="withdrawal-address"
            type="text"
            value={withdrawalAddress}
            onChange={handleWithdrawalAddressChange}
            onFocus={() => setIsFocused("address")}
            onBlur={() => setIsFocused(null)}
            placeholder="Enter withdrawal address"
            className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${inputBgClass}`}
            style={{ "--tw-ring-color": "#FFC828" } as React.CSSProperties}
            aria-label="Withdrawal address"
          />
          {/* Scan Button with hover animation */}
          <motion.button
            onClick={handleScan}
            className={`p-3 rounded-lg border transition-all`}
            style={{
              borderColor: theme === "dark" ? "#444" : "#ddd",
              backgroundColor: theme === "dark" ? "#666" : "#f0f0f0",
            }}
            whileHover={{ scale: 1.05, backgroundColor: "#FFC828" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scan QR code"
            title="Scan QR code"
          >
            <Scan className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={handleClipboard}
            className={`p-3 rounded-lg border transition-all`}
            style={{
              borderColor: theme === "dark" ? "#444" : "#ddd",
              backgroundColor: theme === "dark" ? "#666" : "#f0f0f0",
            }}
            whileHover={{ scale: 1.05, backgroundColor: "#FFC828" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Copy address to clipboard"
            title="Copy address to clipboard"
          >
            <Copy className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Amount Input with animation */}
      <motion.div className="mb-2" variants={itemVariants}>
        <label htmlFor="amount-input" className={`block text-sm font-medium mb-2 ${labelClass}`}>
          You send
        </label>
        <motion.div
          className="relative"
          animate={{
            boxShadow: isFocused === "amount" ? "0 0 0 3px rgba(255, 200, 40, 0.1)" : "none",
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            id="amount-input"
            type="text"
            value={amount === 0 ? "" : amount.toFixed(2)}
            onChange={handleAmountChange}
            onFocus={() => setIsFocused("amount")}
            onBlur={() => setIsFocused(null)}
            placeholder="Enter amount"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${inputBgClass}`}
            style={{ "--tw-ring-color": "#FFC828" } as React.CSSProperties}
            aria-label="Stablecoin amount to send"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <motion.button
              onClick={handleMaxBalance}
              className="px-2 py-1 text-xs font-semibold rounded transition-all"
              style={{
                backgroundColor: "#FFC828",
                color: "#000",
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Set amount to maximum balance"
            >
              MAX
            </motion.button>
            <motion.button
              onClick={() => setShowCoinModal(!showCoinModal)}
              className={`flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded border transition-all`}
              style={{
                borderColor: "#FFC828",
                backgroundColor: "transparent",
                color: "#FFC828",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Select stablecoin"
            >
              {selectedStablecoin}
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showCoinModal && (
          <motion.div
            className={`mb-4 p-3 rounded-lg border ${borderClass} ${breakdownBgClass}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className={`text-xs font-semibold mb-2 ${labelClass}`}>Select Stablecoin</p>
            <div className="grid grid-cols-2 gap-2">
              {STABLECOINS.map((coin) => (
                <motion.button
                  key={coin.symbol}
                  onClick={() => {
                    setSelectedStablecoin(coin.symbol)
                    setShowCoinModal(false)
                  }}
                  className={`p-2 rounded border text-center text-sm font-medium transition-all`}
                  style={{
                    backgroundColor: selectedStablecoin === coin.symbol ? "#FFC828" : "transparent",
                    color: selectedStablecoin === coin.symbol ? "#000" : "inherit",
                    borderColor: selectedStablecoin === coin.symbol ? "#FFC828" : theme === "dark" ? "#444" : "#ddd",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={selectedStablecoin === coin.symbol}
                >
                  <div className="text-lg mb-1">{coin.icon}</div>
                  <div>{coin.symbol}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Balance Display with animation */}
      <motion.p className={`text-xs ${mutedClass} mb-4`} variants={itemVariants}>
        Account balance:{" "}
        {MOCK_CONFIG.accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
        {selectedStablecoin}
      </motion.p>

      <motion.div className="mb-6" variants={itemVariants}>
        <label className={`block text-sm font-medium mb-3 ${labelClass}`}>
          Select percentage: {sliderValue.toFixed(0)}%
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="flex-1 h-2 rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FFC828 0%, #FFC828 ${sliderValue}%, ${theme === "dark" ? "#444" : "#e5e7eb"} ${sliderValue}%, ${theme === "dark" ? "#444" : "#e5e7eb"} 100%)`,
            }}
            aria-label="Percentage slider"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {[0, 20, 50, 80, 100].map((point) => (
            <button
              key={point}
              onClick={() => {
                setSliderValue(point)
                setAmount((MOCK_CONFIG.accountBalance * point) / 100)
              }}
              className="w-6 h-6 rounded-full border transition-all hover:bg-yellow-100 dark:hover:bg-yellow-900"
              style={{
                backgroundColor: sliderValue === point ? "#FFC828" : "transparent",
                color: sliderValue === point ? "#000" : "inherit",
                borderColor: sliderValue === point ? "#FFC828" : theme === "dark" ? "#444" : "#ddd",
              }}
              aria-label={`Set to ${point}%`}
            >
              <span className="text-xs font-semibold">{point}%</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Currency Selection */}
      <motion.div className="mb-6" variants={itemVariants}>
        <label htmlFor="currency-select" className={`block text-sm font-medium mb-2 ${labelClass}`}>
          Receive in
        </label>
        <select
          id="currency-select"
          value={validCurrency}
          onChange={handleCurrencyChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${inputBgClass}`}
          style={{ "--tw-ring-color": "#FFC828" } as React.CSSProperties}
          aria-label="Select fiat currency"
        >
          {supportedCurrencies.map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Main Result - Headline with animation */}
      <AnimatePresence mode="wait">
        {amount > 0 && (
          <motion.div
            key="result"
            className={`mb-6 p-4 rounded-lg ${breakdownBgClass} border ${borderClass}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`text-sm ${mutedClass} mb-1`}>Recipient gets</p>
            <motion.p
              className="text-3xl font-bold"
              key={`net-${calculation.netFiat}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {symbol}
              {calculation.netFiat.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fee Breakdown with staggered animations */}
      <AnimatePresence mode="wait">
        {amount > 0 && (
          <motion.div
            key="breakdown"
            className={`p-4 rounded-lg border ${borderClass} ${breakdownBgClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-semibold mb-4">Fee breakdown</h3>

            {/* Gross */}
            <motion.div
              className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-gray-600"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${labelClass}`}>Gross amount</span>
              </div>
              <span className="font-medium">
                {symbol}
                {calculation.grossFiat.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </motion.div>

            {/* Ripe Fee */}
            <motion.div
              className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-gray-600"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${labelClass}`}>Ripe fee</span>
                <div className="group relative">
                  <Info className={`w-4 h-4 cursor-help ${mutedClass}`} aria-label="Information about Ripe fee" />
                  <div
                    className={`hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none`}
                  >
                    {MOCK_CONFIG.ripeFeePercent}% of gross amount
                  </div>
                </div>
              </div>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{symbol}
                {calculation.ripeFeeFiat.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </motion.div>

            {/* Network Fee */}
            <motion.div
              className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-gray-600"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${labelClass}`}>Network fee</span>
                <div className="group relative">
                  <Info className={`w-4 h-4 cursor-help ${mutedClass}`} aria-label="Information about network fee" />
                  <div
                    className={`hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none`}
                  >
                    ${MOCK_CONFIG.networkFeeUsd} USD equivalent
                  </div>
                </div>
              </div>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{symbol}
                {calculation.networkFeeFiat.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </motion.div>

            {/* FX Spread */}
            <motion.div
              className="flex justify-between items-center mb-3 pb-3"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${labelClass}`}>FX spread</span>
                <div className="group relative">
                  <Info className={`w-4 h-4 cursor-help ${mutedClass}`} aria-label="Information about FX spread" />
                  <div
                    className={`hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none`}
                  >
                    Difference between interbank & customer rates
                  </div>
                </div>
              </div>
              <span className={`text-sm font-medium ${mutedClass}`}>{calculation.fxSpreadPercent.toFixed(2)}%</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State with animation */}
      <AnimatePresence mode="wait">
        {amount === 0 && (
          <motion.div
            key="empty"
            className={`p-6 text-center rounded-lg border ${borderClass} ${breakdownBgClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className={mutedClass}>Enter an amount to see your breakdown and fees</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Disclaimer */}
      <motion.p className={`text-xs ${mutedClass} mt-4 text-center leading-relaxed`} variants={itemVariants}>
        Rates and fees are for demonstration. Actual rates may vary.
      </motion.p>
    </motion.div>
  )
}

export default RipeFxWidget
