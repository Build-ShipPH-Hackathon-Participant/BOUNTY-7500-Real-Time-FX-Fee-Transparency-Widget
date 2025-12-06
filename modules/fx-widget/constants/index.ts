import type { FxConfig } from '../types'

// ============================================================================
// FX Widget Configuration
// Customize these values for different rates/fees
// ============================================================================

export const FX_CONFIG: FxConfig = {
  // FX rates per currency (stablecoin = USDC)
  interbankRates: {
    PHP: 59.0,
    THB: 34.5,
    SGD: 1.35,
    IDR: 16250.0,
    MYR: 4.45,
  },
  customerRates: {
    PHP: 58.5,
    THB: 34.0,
    SGD: 1.33,
    IDR: 16100.0,
    MYR: 4.40,
  },
  // Ripe transaction fee as percentage of stablecoin amount
  ripeFeePercent: 0.5,
  // Network fee in USD equivalent
  networkFeeUsd: 2.0,
  // User's account balance
  accountBalance: 10000,
  // Default account currency
  accountCurrency: "USDT",
}

// Percentage points for slider
export const PERCENTAGE_POINTS = [0, 20, 50, 80, 100] as const

// Animation variants
export const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
}

