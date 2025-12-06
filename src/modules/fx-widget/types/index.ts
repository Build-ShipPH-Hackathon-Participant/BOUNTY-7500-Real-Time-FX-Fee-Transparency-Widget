// ============================================================================
// FX Widget Type Definitions
// ============================================================================

export interface CalculationResult {
  grossFiat: number
  ripeFeeFiat: number
  networkFeeFiat: number
  fxSpreadPercent: number
  fxSpreadFiat: number
  netFiat: number
}

export interface FxWidgetProps {
  initialAmount?: number
  supportedCurrencies?: string[]
  onNetAmountChange?: (amount: number) => void
}

export interface FxConfig {
  interbankRates: Record<string, number>
  customerRates: Record<string, number>
  ripeFeePercent: number
  networkFeeUsd: number
  accountBalance: number
  accountCurrency: string
}

export interface ThemeClasses {
  bgClass: string
  borderClass: string
  inputBgClass: string
  labelClass: string
  mutedClass: string
  breakdownBgClass: string
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  THB: "฿",
  SGD: "$",
  USD: "$",
}

