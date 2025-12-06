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
  SGD: "S$",
  USD: "$",
  IDR: "Rp",
  MYR: "RM",
}

// Parsed QR Code Data (EMVCo format)
export interface ParsedQRData {
  // Merchant Information
  merchantName: string | null
  merchantCity: string | null
  merchantId: string | null
  
  // Transaction Details
  transactionAmount: number | null
  transactionCurrency: string | null
  transactionId: string | null
  
  // Payment Provider
  paymentProvider: string | null
  
  // Country
  countryCode: string | null
  
  // Raw QR data
  rawData: string
  
  // Whether this is a valid EMVCo QR
  isEMVCo: boolean
}

