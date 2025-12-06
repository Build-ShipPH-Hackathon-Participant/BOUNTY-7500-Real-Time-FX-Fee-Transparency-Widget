'use client'

import * as React from 'react'
import { ChevronDown, Check, ArrowLeft, Globe, Clock, Shield, Coins } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useNetworkDetails } from '../hooks/useNetworkDetails'
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from '@/components/ui/morphing-popover'

// ============================================================================
// Types
// ============================================================================
export interface BlockchainNetwork {
  id: string
  name: string
  symbol: string
  tokenStandard: string
  networkFee: string
  logo?: string // Logo URL from cryptologos.cc
  blockConfirmations?: number
  minDeposit?: string
  creditingTime?: string
}

export interface Asset {
  id: string
  symbol: string
  name: string
  logo?: string // Logo URL from cryptologos.cc
  networks: BlockchainNetwork[]
}

// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Generate crypto logo URL from cryptologos.cc
 * Matches the pattern used in stablecoin-selector.tsx
 * @param currency - Currency symbol (e.g., 'usdt', 'eth', 'btc')
 * @returns URL to the logo image
 */
export function getCryptoLogoUrl(currency: string): string {
  const currencyLower = currency.toLowerCase()
  // Map currency codes to cryptologos.cc naming convention
  const logoMap: Record<string, string> = {
    usdt: 'tether-usdt',
    usdc: 'usd-coin-usdc',
    busd: 'binance-usd-busd',
    dai: 'dai-dai',
    tusd: 'trueusd-tusd',
    pyusd: 'paypal-usd-pyusd',
    eth: 'ethereum-eth',
    trx: 'tron-trx',
    bnb: 'binance-coin-bnb',
    matic: 'polygon-matic',
    avax: 'avalanche-avax',
    sol: 'solana-sol',
    ftm: 'fantom-ftm',
    ada: 'cardano-ada',
    dot: 'polkadot-new-dot',
    apt: 'aptos-apt',
    xrp: 'xrp-xrp',
    algo: 'algorand-algo',
    xtz: 'tezos-xtz',
    xlm: 'stellar-xlm',
    eos: 'eos-eos',
    near: 'near-protocol-near',
  }
  
  const logoName = logoMap[currencyLower] || currencyLower
  return `https://cryptologos.cc/logos/${logoName}-logo.png`
}


// ============================================================================
// Network Data
// ============================================================================
export const BLOCKCHAIN_NETWORKS: Record<string, BlockchainNetwork[]> = {
  ethereum: [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      tokenStandard: 'ERC-20, ERC-721 (NFT)',
      networkFee: 'Gas (ETH)',
      logo: getCryptoLogoUrl('eth'),
    },
  ],
  tron: [
    {
      id: 'tron',
      name: 'Tron',
      symbol: 'TRX',
      tokenStandard: 'TRC-20, TRC-721 (NFT)',
      networkFee: 'Low transaction fees in TRX',
      logo: getCryptoLogoUrl('trx'),
    },
  ],
  bsc: [
    {
      id: 'bsc',
      name: 'Binance Smart Chain',
      symbol: 'BSC',
      tokenStandard: 'BEP-20, BEP-721 (NFT)',
      networkFee: 'Gas (BNB)',
      logo: getCryptoLogoUrl('bnb'),
    },
  ],
  polygon: [
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      tokenStandard: 'ERC-20 (compatible with Ethereum)',
      networkFee: 'Gas (MATIC)',
      logo: getCryptoLogoUrl('matic'),
    },
  ],
  avalanche: [
    {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      tokenStandard: 'AVAX C-Chain (ERC-20 compatible)',
      networkFee: 'Gas (AVAX)',
      logo: getCryptoLogoUrl('avax'),
    },
  ],
  solana: [
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      tokenStandard: 'SPL (Solana Program Library tokens)',
      networkFee: 'Low fees, paid in SOL',
      logo: getCryptoLogoUrl('sol'),
    },
  ],
  fantom: [
    {
      id: 'fantom',
      name: 'Fantom',
      symbol: 'FTM',
      tokenStandard: 'FTM ERC-20 compatible',
      networkFee: 'Gas (FTM)',
      logo: getCryptoLogoUrl('ftm'),
    },
  ],
  cardano: [
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      tokenStandard: 'Native tokens',
      networkFee: 'Low, ADA',
      logo: getCryptoLogoUrl('ada'),
    },
  ],
  polkadot: [
    {
      id: 'polkadot',
      name: 'Polkadot',
      symbol: 'DOT',
      tokenStandard: 'Native tokens, parachain tokens',
      networkFee: 'DOT or parachain-specific tokens',
      logo: getCryptoLogoUrl('dot'),
    },
  ],
  aptos: [
    {
      id: 'aptos',
      name: 'Aptos',
      symbol: 'APT',
      tokenStandard: 'Aptos-native tokens',
      networkFee: 'Low, paid in APT',
      logo: getCryptoLogoUrl('apt'),
    },
  ],
  xrp: [
    {
      id: 'xrp',
      name: 'XRP (Ripple)',
      symbol: 'XRP',
      tokenStandard: 'XRP Ledger tokens',
      networkFee: 'Transaction fee in XRP',
      logo: getCryptoLogoUrl('xrp'),
    },
  ],
  algorand: [
    {
      id: 'algorand',
      name: 'Algorand',
      symbol: 'ALGO',
      tokenStandard: 'ASA (Algorand Standard Asset)',
      networkFee: 'Low fees, paid in ALGO',
      logo: getCryptoLogoUrl('algo'),
    },
  ],
  tezos: [
    {
      id: 'tezos',
      name: 'Tezos',
      symbol: 'XTZ',
      tokenStandard: 'FA1.2, FA2',
      networkFee: 'Gas (XTZ)',
      logo: getCryptoLogoUrl('xtz'),
    },
  ],
  stellar: [
    {
      id: 'stellar',
      name: 'Stellar',
      symbol: 'XLM',
      tokenStandard: 'Stellar Assets',
      networkFee: 'Low fees, paid in XLM',
      logo: getCryptoLogoUrl('xlm'),
    },
  ],
  eos: [
    {
      id: 'eos',
      name: 'EOS',
      symbol: 'EOS',
      tokenStandard: 'EOSIO tokens',
      networkFee: 'Low fees, EOS staking-based',
      logo: getCryptoLogoUrl('eos'),
    },
  ],
  near: [
    {
      id: 'near',
      name: 'Near Protocol',
      symbol: 'NEAR',
      tokenStandard: 'NEP-21',
      networkFee: 'Low, paid in NEAR',
      logo: getCryptoLogoUrl('near'),
    },
  ],
}

// Default assets with their supported networks
export const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    logo: getCryptoLogoUrl('usdt'),
    networks: [
      BLOCKCHAIN_NETWORKS.ethereum[0],
      BLOCKCHAIN_NETWORKS.tron[0],
      BLOCKCHAIN_NETWORKS.bsc[0],
      BLOCKCHAIN_NETWORKS.polygon[0],
      BLOCKCHAIN_NETWORKS.avalanche[0],
      BLOCKCHAIN_NETWORKS.solana[0],
    ],
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    logo: getCryptoLogoUrl('usdc'),
    networks: [
      BLOCKCHAIN_NETWORKS.ethereum[0],
      BLOCKCHAIN_NETWORKS.polygon[0],
      BLOCKCHAIN_NETWORKS.avalanche[0],
      BLOCKCHAIN_NETWORKS.solana[0],
    ],
  },
  {
    id: 'busd',
    symbol: 'BUSD',
    name: 'Binance USD',
    logo: getCryptoLogoUrl('busd'),
    networks: [
      BLOCKCHAIN_NETWORKS.ethereum[0],
      BLOCKCHAIN_NETWORKS.bsc[0],
    ],
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai',
    logo: getCryptoLogoUrl('dai'),
    networks: [
      BLOCKCHAIN_NETWORKS.ethereum[0],
      BLOCKCHAIN_NETWORKS.polygon[0],
      BLOCKCHAIN_NETWORKS.avalanche[0],
    ],
  },
  {
    id: 'tusd',
    symbol: 'TUSD',
    name: 'TrueUSD',
    logo: getCryptoLogoUrl('tusd'),
    networks: [
      BLOCKCHAIN_NETWORKS.ethereum[0],
      BLOCKCHAIN_NETWORKS.tron[0],
      BLOCKCHAIN_NETWORKS.bsc[0],
    ],
  },
  {
    id: 'pyusd',
    symbol: 'PYUSD',
    name: 'PayPal USD',
    logo: getCryptoLogoUrl('pyusd'),
    networks: [
      BLOCKCHAIN_NETWORKS.ethereum[0],
      BLOCKCHAIN_NETWORKS.solana[0],
    ],
  },
]

// ============================================================================
// Component Props
// ============================================================================
interface AssetNetworkSelectorProps {
  selectedAsset?: Asset | null
  selectedNetwork?: BlockchainNetwork | null
  onAssetChange?: (asset: Asset) => void
  onNetworkChange?: (network: BlockchainNetwork) => void
  labelClass?: string
  className?: string
}

// ============================================================================
// Main Component
// ============================================================================
export function AssetNetworkSelector({
  selectedAsset,
  selectedNetwork,
  onAssetChange,
  onNetworkChange,
  labelClass,
  className,
}: AssetNetworkSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<'asset' | 'network'>('asset')
  const [tempSelectedAsset, setTempSelectedAsset] = React.useState<Asset | null>(
    selectedAsset || null
  )
  
  // Fetch network details when a network is selected
  const { details: networkDetails, loading: detailsLoading } = useNetworkDetails(selectedNetwork)

  // Reset step when modal closes
  React.useEffect(() => {
    if (!open) {
      setStep('asset')
      setTempSelectedAsset(selectedAsset || null)
    }
  }, [open, selectedAsset])

  const handleAssetSelect = (asset: Asset) => {
    setTempSelectedAsset(asset)
    if (asset.networks.length === 1) {
      // If only one network, auto-select it
      onNetworkChange?.(asset.networks[0])
      onAssetChange?.(asset)
      setOpen(false)
    } else {
      // Multiple networks, go to network selection
      setStep('network')
    }
  }

  const handleNetworkSelect = (network: BlockchainNetwork) => {
    if (tempSelectedAsset) {
      onAssetChange?.(tempSelectedAsset)
      onNetworkChange?.(network)
      setOpen(false)
    }
  }

  const handleBack = () => {
    setStep('asset')
  }

  const displayText = selectedAsset && selectedNetwork
    ? `${selectedAsset.symbol} on ${selectedNetwork.name}`
    : 'Select Asset'

  return (
    <motion.div className={cn('mb-4', className)} variants={ITEM_VARIANTS}>
      <label className={cn('block text-sm font-medium mb-2 transition-colors duration-300', labelClass)}>
        Select Asset
      </label>
      <div className="w-full">
        <MorphingPopover open={open} onOpenChange={setOpen} className="w-full">
          <MorphingPopoverTrigger
            className="w-full flex items-center justify-between h-12 px-4 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFC828] focus:ring-offset-0"
          >
            <div className="flex items-center gap-3">
              {selectedAsset && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedAsset.logo} alt={selectedAsset.name} />
                  <AvatarFallback className="text-xs font-bold">
                    {selectedAsset.symbol.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col items-start">
                <span className="font-semibold">{displayText}</span>
                {selectedNetwork && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedNetwork.tokenStandard}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedNetwork && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedNetwork.networkFee}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'size-4 text-gray-500 dark:text-gray-400 transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </div>
          </MorphingPopoverTrigger>

          {/* Network Details Display */}
          {selectedNetwork && (
            <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Loading network details...</span>
                </div>
              ) : networkDetails ? (
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="size-4 text-[#FFC828] mb-1" />
                    <span className="text-gray-500 dark:text-gray-400">Confirmations</span>
                    <span className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {networkDetails.blockConfirmations}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Coins className="size-4 text-[#FFC828] mb-1" />
                    <span className="text-gray-500 dark:text-gray-400">Min Deposit</span>
                    <span className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {networkDetails.minDeposit} {selectedNetwork.symbol}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Clock className="size-4 text-[#FFC828] mb-1" />
                    <span className="text-gray-500 dark:text-gray-400">Crediting Time</span>
                    <span className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {networkDetails.creditingTime}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <MorphingPopoverContent className="max-w-sm">
            {step === 'asset' ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-center gap-2 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
                  <Globe className="size-5 text-[#FFC828]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Asset
                  </h2>
                </div>

                {/* Asset List */}
                <div className="max-h-[360px] overflow-y-auto p-2">
                  {DEFAULT_ASSETS.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id
                    return (
                      <button
                        key={asset.id}
                        onClick={() => handleAssetSelect(asset)}
                        className={cn(
                          'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200',
                          'focus:outline-none',
                          isSelected
                            ? 'bg-[#FFC828]/15 ring-2 ring-[#FFC828]'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={asset.logo} alt={asset.name} />
                          <AvatarFallback className="text-sm font-bold">
                            {asset.symbol.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={cn(
                              'font-semibold text-gray-900 dark:text-white',
                              isSelected && 'text-[#FFC828]'
                            )}
                          >
                            {asset.symbol}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {asset.networks.length} network{asset.networks.length !== 1 ? 's' : ''}
                          </span>
                          {isSelected && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFC828]">
                              <Check className="h-4 w-4 text-black" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Header with Back Button */}
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
                  <button
                    onClick={handleBack}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="size-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <Globe className="size-5 text-[#FFC828]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                    Select Network
                  </h2>
                </div>

                {/* Network List */}
                <div className="max-h-[360px] overflow-y-auto p-2">
                  {tempSelectedAsset?.networks.map((network) => {
                    const isSelected = selectedNetwork?.id === network.id
                    return (
                      <button
                        key={network.id}
                        onClick={() => handleNetworkSelect(network)}
                        className={cn(
                          'w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200',
                          'focus:outline-none',
                          isSelected
                            ? 'bg-[#FFC828]/15 ring-2 ring-[#FFC828]'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={network.logo} alt={network.name} />
                          <AvatarFallback className="text-sm font-bold">
                            {network.symbol.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={cn(
                              'font-semibold text-gray-900 dark:text-white',
                              isSelected && 'text-[#FFC828]'
                            )}
                          >
                            {network.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {network.tokenStandard}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Fee: {network.networkFee}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFC828]">
                            <Check className="h-4 w-4 text-black" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </MorphingPopoverContent>
        </MorphingPopover>
      </div>
    </motion.div>
  )
}

