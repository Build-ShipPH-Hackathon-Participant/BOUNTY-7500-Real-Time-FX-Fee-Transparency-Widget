import { useMemo } from 'react'
import { calculateNetReceived } from '../utils/calculations'
import { FX_CONFIG } from '../constants'
import type { CalculationResult } from '../types'

interface UseFxCalculationProps {
  amount: number
  currency: string
  supportedCurrencies: string[]
}

interface UseFxCalculationResult {
  calculation: CalculationResult
  interbankRate: number
  customerRate: number
  validCurrency: string
}

/**
 * Hook for FX calculations based on amount and currency
 */
export function useFxCalculation({
  amount,
  currency,
  supportedCurrencies,
}: UseFxCalculationProps): UseFxCalculationResult {
  const validCurrency = supportedCurrencies.includes(currency) 
    ? currency 
    : supportedCurrencies[0]

  const interbankRate = FX_CONFIG.interbankRates[validCurrency as keyof typeof FX_CONFIG.interbankRates] || 1
  const customerRate = FX_CONFIG.customerRates[validCurrency as keyof typeof FX_CONFIG.customerRates] || 1

  const calculation = useMemo(() => {
    const validAmount = Math.max(0, amount)
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
      FX_CONFIG.ripeFeePercent,
      FX_CONFIG.networkFeeUsd,
    )
  }, [amount, customerRate, interbankRate])

  return {
    calculation,
    interbankRate,
    customerRate,
    validCurrency,
  }
}

