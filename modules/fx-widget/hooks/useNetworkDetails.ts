import { useState, useEffect, useCallback } from 'react'
import type { BlockchainNetwork } from '../components/AssetNetworkSelector'
import { fetchNetworkDetails, type NetworkDetails } from '../services/networkDetailsService'

interface UseNetworkDetailsResult {
  details: NetworkDetails | null
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch network details (block confirmations, min deposit, crediting time)
 * @param network - The blockchain network to fetch details for
 */
export function useNetworkDetails(
  network: BlockchainNetwork | null
): UseNetworkDetailsResult {
  const [details, setDetails] = useState<NetworkDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const networkId = network?.id

  const loadNetworkDetails = useCallback(async () => {
    if (!networkId) {
      setDetails(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch network details from service (which can use API or defaults)
      const networkDetails = await fetchNetworkDetails(networkId)
      setDetails(networkDetails)
    } catch (err) {
      console.error('Network details fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch network details')
    } finally {
      setLoading(false)
    }
  }, [networkId])

  useEffect(() => {
    loadNetworkDetails()
  }, [loadNetworkDetails])

  return { details, loading, error }
}

export default useNetworkDetails

