/**
 * Format a number as currency using Intl API
 */
export function formatCurrency(value: number, currencyCode: string, decimals = 2): string {
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
 * Format number with locale string
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

