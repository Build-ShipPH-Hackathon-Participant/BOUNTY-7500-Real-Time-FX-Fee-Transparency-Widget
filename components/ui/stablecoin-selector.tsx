'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Stablecoin interface
export interface Stablecoin {
  id: string;
  symbol: string;
  name: string;
  logo?: string;
  color?: string;
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
];

// Context for stablecoin state management
interface StablecoinContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCoin: Stablecoin | undefined;
  coins: Stablecoin[];
  onCoinSelect: (coin: Stablecoin) => void;
}

const StablecoinContext = React.createContext<StablecoinContextValue | null>(null);

function useStablecoinContext() {
  const context = React.useContext(StablecoinContext);
  if (!context) {
    throw new Error('Stablecoin components must be used within StablecoinProvider');
  }
  return context;
}

// Main provider component
interface StablecoinProviderProps {
  children: React.ReactNode;
  coins?: Stablecoin[];
  selectedCoinId?: string;
  onCoinChange?: (coin: Stablecoin) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function StablecoinProvider({
  children,
  coins = DEFAULT_STABLECOINS,
  selectedCoinId,
  onCoinChange,
  open: controlledOpen,
  onOpenChange,
}: StablecoinProviderProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const selectedCoin = React.useMemo(() => {
    if (!selectedCoinId) return coins[0];
    return coins.find((c) => c.id === selectedCoinId || c.symbol === selectedCoinId) || coins[0];
  }, [coins, selectedCoinId]);

  const handleCoinSelect = React.useCallback(
    (coin: Stablecoin) => {
      onCoinChange?.(coin);
      setOpen(false);
    },
    [onCoinChange, setOpen],
  );

  const value: StablecoinContextValue = {
    open,
    setOpen,
    selectedCoin,
    coins,
    onCoinSelect: handleCoinSelect,
  };

  return (
    <StablecoinContext.Provider value={value}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </StablecoinContext.Provider>
  );
}

// Trigger component
interface StablecoinTriggerProps extends React.ComponentProps<'button'> {}

function StablecoinTrigger({ className, ...props }: StablecoinTriggerProps) {
  const { open, selectedCoin } = useStablecoinContext();

  if (!selectedCoin) return null;

  return (
    <PopoverTrigger asChild>
      <button
        data-state={open ? 'open' : 'closed'}
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
      </button>
    </PopoverTrigger>
  );
}

// Content component
interface StablecoinContentProps extends React.ComponentProps<typeof PopoverContent> {
  title?: string;
}

function StablecoinContent({
  className,
  children,
  title = 'Select Stablecoin',
  ...props
}: StablecoinContentProps) {
  const { coins, selectedCoin, onCoinSelect } = useStablecoinContext();

  return (
    <PopoverContent
      className={cn(
        'w-64 p-0 transition-colors duration-300',
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        className,
      )}
      align={props.align || 'end'}
      sideOffset={8}
      {...props}
    >
      <div className="border-b px-3 py-2.5 border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">
          {title}
        </p>
      </div>

      <div className="max-h-[280px] overflow-y-auto">
        <div className="p-1.5">
          {coins.map((coin) => {
            const isSelected = selectedCoin?.id === coin.id;
            return (
              <button
                key={coin.id}
                onClick={() => onCoinSelect(coin)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors duration-300',
                  'focus:outline-none',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isSelected && 'bg-gray-100 dark:bg-gray-700',
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={coin.logo} alt={coin.name} />
                  <AvatarFallback 
                    className="text-xs font-bold"
                    style={{ backgroundColor: coin.color || '#666', color: '#fff' }}
                  >
                    {coin.symbol.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {coin.symbol}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {coin.name}
                  </span>
                </div>
                {isSelected && (
                  <CheckIcon 
                    className="ml-auto h-4 w-4" 
                    style={{ color: '#FFC828' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {children && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 transition-colors duration-300" />
          <div className="p-1.5">{children}</div>
        </>
      )}
    </PopoverContent>
  );
}

export { 
  StablecoinProvider as StablecoinSelector, 
  StablecoinTrigger, 
  StablecoinContent,
  type Stablecoin 
};
