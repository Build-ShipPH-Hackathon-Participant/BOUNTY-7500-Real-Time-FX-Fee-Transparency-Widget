import { useState, useEffect, useCallback } from 'react'

interface ExchangeRateResult {
  rate: number | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

const API_PRIMARY = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies'
const API_FALLBACK = 'https://latest.currency-api.pages.dev/v1/currencies'

/**
 * Hook to fetch real-time exchange rates with fallback support
 * @param baseCurrency - The base currency (e.g., 'usdt', 'usd')
 * @param targetCurrency - The target currency (e.g., 'php', 'thb')
 */
export function useExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): ExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRate = useCallback(async () => {
    const base = baseCurrency.toLowerCase()
    const target = targetCurrency.toLowerCase()

    // Try primary API first
    const primaryUrl = `${API_PRIMARY}/${base}.min.json`
    const fallbackUrl = `${API_FALLBACK}/${base}.min.json`

    try {
      setLoading(true)
      setError(null)

      let response = await fetch(primaryUrl)
      
      // If primary fails, try fallback
      if (!response.ok) {
        console.log('Primary API failed, trying fallback...')
        response = await fetch(fallbackUrl)
      }

      if (!response.ok) {
        throw new Error('Both API endpoints failed')
      }

      const data = await response.json()
      
      // The API returns: { "date": "...", "usdt": { "php": 58.79, "thb": 34.5, ... } }
      const rates = data[base]
      
      if (rates && rates[target] !== undefined) {
        setRate(rates[target])
        setLastUpdated(new Date())
      } else {
        throw new Error(`Rate not found for ${base}/${target}`)
      }
    } catch (err) {
      console.error('Exchange rate fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch rate')
      // Keep the old rate if we had one
    } finally {
      setLoading(false)
    }
  }, [baseCurrency, targetCurrency])

  useEffect(() => {
    fetchRate()

    // Refresh rate every 5 minutes
    const interval = setInterval(fetchRate, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchRate])

  return { rate, loading, error, lastUpdated }
}

export default useExchangeRate





