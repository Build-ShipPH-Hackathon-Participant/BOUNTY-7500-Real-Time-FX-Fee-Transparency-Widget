import type { CalculationResult } from '../types'

/**
 * Calculate gross fiat amount from stablecoin
 */
export function calculateGross(amountUsdc: number, customerRate: number): number {
  return amountUsdc * customerRate
}

/**
 * Calculate Ripe transaction fee in fiat
 */
export function calculateRipeFee(grossFiat: number, ripeFeePercent: number): number {
  return (grossFiat * ripeFeePercent) / 100
}

/**
 * Calculate network fee converted to local fiat
 */
export function calculateNetworkFeeLocal(networkFeeUsd: number, customerRate: number): number {
  return networkFeeUsd * customerRate
}

/**
 * Calculate FX spread as a percentage of interbank rate
 */
export function calculateFxSpreadPercent(interbankRate: number, customerRate: number): number {
  return ((interbankRate - customerRate) / interbankRate) * 100
}

/**
 * Calculate FX spread in fiat amount
 */
export function calculateFxSpreadFiat(
  amountUsdc: number, 
  interbankRate: number, 
  customerRate: number
): number {
  return amountUsdc * (interbankRate - customerRate)
}

/**
 * Main calculation function - returns all breakdown components
 */
export function calculateNetReceived(
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

/**
 * Find closest percentage point to a value
 */
export function findClosestPoint(value: number, points: readonly number[]): number {
  return points.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  )
}

