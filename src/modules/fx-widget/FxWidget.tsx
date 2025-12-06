'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DEFAULT_STABLECOINS, type Stablecoin } from '@/components/ui/stablecoin-selector'

// Module imports
import { FX_CONFIG, CONTAINER_VARIANTS, ITEM_VARIANTS, PERCENTAGE_POINTS } from './constants'
import { useDebounce, useFxCalculation, useThemeClasses } from './hooks'
import { findClosestPoint } from './utils/calculations'
import { CURRENCY_SYMBOLS } from './types'
import type { FxWidgetProps } from './types'

// Component imports
import {
  WidgetHeader,
  DirectionToggle,
  WithdrawalAddressInput,
  AmountInput,
  PercentageSlider,
  CurrencySelector,
  ResultDisplay,
  FeeBreakdown,
  EmptyState,
} from './components'

export function FxWidget({
  initialAmount = 100,
  supportedCurrencies = ['PHP', 'THB'],
  onNetAmountChange,
}: FxWidgetProps) {
  // Theme
  const { isDark, bgClass, borderClass, inputBgClass, labelClass, mutedClass, breakdownBgClass } = useThemeClasses()

  // State
  const [withdrawalAddress, setWithdrawalAddress] = useState('')
  const [amount, setAmount] = useState(Math.max(0, initialAmount))
  const [amountInput, setAmountInput] = useState(initialAmount > 0 ? initialAmount.toFixed(2) : '')
  const [currency, setCurrency] = useState(supportedCurrencies[0])
  const [direction, setDirection] = useState<'send' | 'receive'>('send')
  const [isFocused, setIsFocused] = useState<'address' | 'amount' | null>(null)
  const [selectedStablecoin, setSelectedStablecoin] = useState<Stablecoin>(
    DEFAULT_STABLECOINS.find((c) => c.symbol === 'USDT') || DEFAULT_STABLECOINS[0]
  )
  const [sliderValue, setSliderValue] = useState(0)

  // Derived state
  const debouncedAmount = useDebounce(amount, 300)
  const { calculation, validCurrency } = useFxCalculation({
    amount: debouncedAmount,
    currency,
    supportedCurrencies,
  })

  const symbol = CURRENCY_SYMBOLS[validCurrency] || validCurrency

  // Effects
  useEffect(() => {
    onNetAmountChange?.(calculation.netFiat)
  }, [calculation.netFiat, onNetAmountChange])

  useEffect(() => {
    if (initialAmount > 0) {
      const initialPercentage = (initialAmount / FX_CONFIG.accountBalance) * 100
      setSliderValue(Math.min(100, Math.max(0, initialPercentage)))
    }
  }, [initialAmount])

  // Handlers
  const handleSliderChange = (values: number[]) => {
    const percentage = values[0]
    setSliderValue(percentage)
    const calculatedAmount = (FX_CONFIG.accountBalance * percentage) / 100
    setAmount(calculatedAmount)
    setAmountInput(calculatedAmount.toFixed(2))
  }

  const handleSliderCommit = (values: number[]) => {
    const percentage = values[0]
    const closestPoint = findClosestPoint(percentage, PERCENTAGE_POINTS)
    if (Math.abs(percentage - closestPoint) <= 5) {
      setSliderValue(closestPoint)
      const calculatedAmount = (FX_CONFIG.accountBalance * closestPoint) / 100
      setAmount(calculatedAmount)
      setAmountInput(calculatedAmount.toFixed(2))
    }
  }

  const handleSliderPointClick = (e: React.MouseEvent, percentage: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSliderValue(percentage)
    const calculatedAmount = (FX_CONFIG.accountBalance * percentage) / 100
    setAmount(calculatedAmount)
    setAmountInput(calculatedAmount.toFixed(2))
  }

  const handleAmountInputChange = (inputValue: string) => {
    setAmountInput(inputValue)
    const numValue = Number.parseFloat(inputValue) || 0
    const validAmount = Math.max(0, numValue)
    setAmount(validAmount)
    setSliderValue((validAmount / FX_CONFIG.accountBalance) * 100)
  }

  const handleAmountBlur = () => {
    setIsFocused(null)
    if (amountInput === '' || Number.parseFloat(amountInput) === 0) {
      setAmountInput('')
      setAmount(0)
    } else {
      const numValue = Number.parseFloat(amountInput) || 0
      setAmountInput(numValue.toFixed(2))
    }
  }

  const handleMaxClick = () => {
    setAmount(FX_CONFIG.accountBalance)
    setAmountInput(FX_CONFIG.accountBalance.toFixed(2))
    setSliderValue(100)
  }

  return (
    <motion.div
      className={`w-full max-w-md mx-auto p-6 rounded-lg border ${borderClass} ${bgClass} transition-colors duration-500 ease-in-out`}
      role="region"
      aria-label="FX and fee transparency widget"
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      <WidgetHeader mutedClass={mutedClass} />

      <DirectionToggle
        direction={direction}
        onDirectionChange={setDirection}
        isDark={isDark}
      />

      <WithdrawalAddressInput
        value={withdrawalAddress}
        onChange={setWithdrawalAddress}
        isFocused={isFocused === 'address'}
        onFocus={() => setIsFocused('address')}
        onBlur={() => setIsFocused(null)}
        isDark={isDark}
        labelClass={labelClass}
        inputBgClass={inputBgClass}
      />

      <AmountInput
        amountInput={amountInput}
        onAmountChange={handleAmountInputChange}
        onAmountBlur={handleAmountBlur}
        isFocused={isFocused === 'amount'}
        onFocus={() => setIsFocused('amount')}
        selectedStablecoin={selectedStablecoin}
        onStablecoinChange={setSelectedStablecoin}
        onMaxClick={handleMaxClick}
        isDark={isDark}
        labelClass={labelClass}
        inputBgClass={inputBgClass}
        mutedClass={mutedClass}
      />

      <PercentageSlider
        sliderValue={sliderValue}
        onSliderChange={handleSliderChange}
        onSliderCommit={handleSliderCommit}
        onPointClick={handleSliderPointClick}
        isDark={isDark}
        labelClass={labelClass}
      />

      <CurrencySelector
        currency={validCurrency}
        supportedCurrencies={supportedCurrencies}
        onCurrencyChange={setCurrency}
        labelClass={labelClass}
        inputBgClass={inputBgClass}
      />

      <ResultDisplay
        amount={amount}
        netFiat={calculation.netFiat}
        symbol={symbol}
        borderClass={borderClass}
        breakdownBgClass={breakdownBgClass}
        mutedClass={mutedClass}
      />

      <FeeBreakdown
        amount={amount}
        calculation={calculation}
        symbol={symbol}
        borderClass={borderClass}
        breakdownBgClass={breakdownBgClass}
        labelClass={labelClass}
        mutedClass={mutedClass}
      />

      <EmptyState
        amount={amount}
        borderClass={borderClass}
        breakdownBgClass={breakdownBgClass}
        mutedClass={mutedClass}
      />

      {/* Footer Disclaimer */}
      <motion.p className={`text-xs ${mutedClass} mt-4 text-center leading-relaxed`} variants={ITEM_VARIANTS}>
        Rates and fees are for demonstration. Actual rates may vary.
      </motion.p>
    </motion.div>
  )
}

export default FxWidget

