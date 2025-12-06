'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from '@/components/ui/morphing-popover'

// Stablecoin interface
export interface Stablecoin {
  id: string
  symbol: string
  name: string
  logo?: string
  color?: string
}

// Default stablecoins with logos
export const DEFAULT_STABLECOINS: Stablecoin[] = [
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    color: '#26A17B',
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    color: '#2775CA',
  },
  {
    id: 'pyusd',
    symbol: 'PYUSD',
    name: 'PayPal USD',
    logo: 'https://cryptologos.cc/logos/paypal-usd-pyusd-logo.png',
    color: '#003087',
  },
  {
    id: 'fdusd',
    symbol: 'FDUSD',
    name: 'First Digital USD',
    logo: 'https://cryptologos.cc/logos/first-digital-usd-fdusd-logo.png',
    color: '#FFD700',
  },
  {
    id: 'busd',
    symbol: 'BUSD',
    name: 'Binance USD',
    logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png',
    color: '#F0B90B',
  },
]

// Context for stablecoin state management
interface StablecoinContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  selectedCoin: Stablecoin | undefined
  coins: Stablecoin[]
  onCoinSelect: (coin: Stablecoin) => void
}

const StablecoinContext = React.createContext<StablecoinContextValue | null>(null)

function useStablecoinContext() {
  const context = React.useContext(StablecoinContext)
  if (!context) {
    throw new Error('Stablecoin components must be used within StablecoinProvider')
  }
  return context
}

// Main provider component
interface StablecoinProviderProps {
  children: React.ReactNode
  coins?: Stablecoin[]
  selectedCoinId?: string
  onCoinChange?: (coin: Stablecoin) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function StablecoinProvider({
  children,
  coins = DEFAULT_STABLECOINS,
  selectedCoinId,
  onCoinChange,
  open: controlledOpen,
  onOpenChange,
}: StablecoinProviderProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const selectedCoin = React.useMemo(() => {
    if (!selectedCoinId) return coins[0]
    return coins.find((c) => c.id === selectedCoinId || c.symbol === selectedCoinId) || coins[0]
  }, [coins, selectedCoinId])

  const handleCoinSelect = React.useCallback(
    (coin: Stablecoin) => {
      onCoinChange?.(coin)
      setOpen(false)
    },
    [onCoinChange, setOpen],
  )

  const value: StablecoinContextValue = {
    open,
    setOpen,
    selectedCoin,
    coins,
    onCoinSelect: handleCoinSelect,
  }

  return (
    <StablecoinContext.Provider value={value}>
      <MorphingPopover open={open} onOpenChange={setOpen}>
        {children}
      </MorphingPopover>
    </StablecoinContext.Provider>
  )
}

// Trigger component
interface StablecoinTriggerProps extends React.ComponentProps<'button'> {}

function StablecoinTrigger({ className, ...props }: StablecoinTriggerProps) {
  const { selectedCoin } = useStablecoinContext()

  if (!selectedCoin) return null

  return (
    <MorphingPopoverTrigger
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all',
        'hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC828]',
        'border-[#FFC828] bg-transparent text-[#FFC828]',
        className,
      )}
      {...props}
    >
      <Avatar className="h-5 w-5">
        <AvatarImage src={selectedCoin.logo} alt={selectedCoin.name} />
        <AvatarFallback 
          className="text-[10px] font-bold"
          style={{ backgroundColor: selectedCoin.color || '#666', color: '#fff' }}
        >
          {selectedCoin.symbol.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span>{selectedCoin.symbol}</span>
      <ChevronsUpDownIcon className="h-3.5 w-3.5 opacity-70" />
    </MorphingPopoverTrigger>
  )
}

// Content component
interface StablecoinContentProps {
  title?: string
  children?: React.ReactNode
  className?: string
}

function StablecoinContent({
  className,
  children,
  title = 'Select Stablecoin',
}: StablecoinContentProps) {
  const { coins, selectedCoin, onCoinSelect } = useStablecoinContext()

  return (
    <MorphingPopoverContent className={cn('max-w-sm', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
          {title}
        </h2>
      </div>

      {/* Coin List */}
      <div className="max-h-[320px] overflow-y-auto p-2">
        {coins.map((coin) => {
          const isSelected = selectedCoin?.id === coin.id
          return (
            <button
              key={coin.id}
              onClick={() => onCoinSelect(coin)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-200',
                'focus:outline-none',
                isSelected 
                  ? 'bg-[#FFC828]/15 ring-2 ring-[#FFC828]' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800',
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={coin.logo} alt={coin.name} />
                <AvatarFallback 
                  className="text-sm font-bold"
                  style={{ backgroundColor: coin.color || '#666', color: '#fff' }}
                >
                  {coin.symbol.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className={cn(
                  'font-semibold text-gray-900 dark:text-white',
                  isSelected && 'text-[#FFC828]'
                )}>
                  {coin.symbol}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {coin.name}
                </span>
              </div>
              {isSelected && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFC828]">
                  <CheckIcon className="h-4 w-4 text-black" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {children && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <div className="p-4">{children}</div>
        </>
      )}
    </MorphingPopoverContent>
  )
}

export { 
  StablecoinProvider as StablecoinSelector, 
  StablecoinTrigger, 
  StablecoinContent,
  type Stablecoin 
}
