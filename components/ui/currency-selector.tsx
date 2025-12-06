'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Currency interface
export interface FiatCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

// Default fiat currencies
export const DEFAULT_FIAT_CURRENCIES: FiatCurrency[] = [
  {
    id: 'php',
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    flag: '🇵🇭',
  },
  {
    id: 'thb',
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    flag: '🇹🇭',
  },
  {
    id: 'sgd',
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: '$',
    flag: '🇸🇬',
  },
  {
    id: 'myr',
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    flag: '🇲🇾',
  },
  {
    id: 'idr',
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    flag: '🇮🇩',
  },
  {
    id: 'vnd',
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    flag: '🇻🇳',
  },
];

// Context for currency state management
interface CurrencyContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCurrency: FiatCurrency | undefined;
  currencies: FiatCurrency[];
  onCurrencySelect: (currency: FiatCurrency) => void;
}

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

function useCurrencyContext() {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    throw new Error('Currency components must be used within CurrencyProvider');
  }
  return context;
}

// Main provider component
interface CurrencyProviderProps {
  children: React.ReactNode;
  currencies?: FiatCurrency[];
  selectedCurrencyCode?: string;
  onCurrencyChange?: (currency: FiatCurrency) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CurrencyProvider({
  children,
  currencies = DEFAULT_FIAT_CURRENCIES,
  selectedCurrencyCode,
  onCurrencyChange,
  open: controlledOpen,
  onOpenChange,
}: CurrencyProviderProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const selectedCurrency = React.useMemo(() => {
    if (!selectedCurrencyCode) return currencies[0];
    return currencies.find((c) => c.code === selectedCurrencyCode) || currencies[0];
  }, [currencies, selectedCurrencyCode]);

  const handleCurrencySelect = React.useCallback(
    (currency: FiatCurrency) => {
      onCurrencyChange?.(currency);
      setOpen(false);
    },
    [onCurrencyChange, setOpen],
  );

  const value: CurrencyContextValue = {
    open,
    setOpen,
    selectedCurrency,
    currencies,
    onCurrencySelect: handleCurrencySelect,
  };

  return (
    <CurrencyContext.Provider value={value}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </CurrencyContext.Provider>
  );
}

// Trigger component
interface CurrencyTriggerProps extends React.ComponentProps<'button'> {
  isDark?: boolean;
}

function CurrencyTrigger({ className, isDark = false, ...props }: CurrencyTriggerProps) {
  const { open, selectedCurrency } = useCurrencyContext();

  if (!selectedCurrency) return null;

  return (
    <PopoverTrigger asChild>
      <button
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
            : 'bg-gray-50 border-gray-300 hover:bg-gray-100',
          className,
        )}
        style={{ '--tw-ring-color': '#FFC828' } as React.CSSProperties}
        {...props}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedCurrency.flag}</span>
          <div className="flex flex-col items-start">
            <span className="font-semibold">{selectedCurrency.code}</span>
            <span className={cn(
              'text-xs',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              {selectedCurrency.name}
            </span>
          </div>
        </div>
        <ChevronsUpDownIcon className={cn(
          'h-4 w-4 shrink-0',
          isDark ? 'text-gray-400' : 'text-gray-500'
        )} />
      </button>
    </PopoverTrigger>
  );
}

// Content component
interface CurrencyContentProps extends React.ComponentProps<typeof PopoverContent> {
  title?: string;
  isDark?: boolean;
}

function CurrencyContent({
  className,
  children,
  title = 'Select Currency',
  isDark = false,
  ...props
}: CurrencyContentProps) {
  const { currencies, selectedCurrency, onCurrencySelect } = useCurrencyContext();

  return (
    <PopoverContent
      className={cn(
        'w-[var(--radix-popover-trigger-width)] p-0',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        className,
      )}
      align="start"
      sideOffset={8}
      {...props}
    >
      <div className={cn(
        'border-b px-3 py-2.5',
        isDark ? 'border-gray-700' : 'border-gray-200'
      )}>
        <p className={cn(
          'text-sm font-semibold',
          isDark ? 'text-gray-300' : 'text-gray-600'
        )}>
          {title}
        </p>
      </div>

      <div className="max-h-[280px] overflow-y-auto">
        <div className="p-1.5">
          {currencies.map((currency) => {
            const isSelected = selectedCurrency?.code === currency.code;
            return (
              <button
                key={currency.id}
                onClick={() => onCurrencySelect(currency)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                  'focus:outline-none',
                  isDark 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-100',
                  isSelected && (isDark ? 'bg-gray-700' : 'bg-gray-100'),
                )}
              >
                <span className="text-2xl">{currency.flag}</span>
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className={cn(
                    'font-semibold',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    {currency.code}
                  </span>
                  <span className={cn(
                    'text-xs',
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {currency.name}
                  </span>
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {currency.symbol}
                </span>
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
          <div className={cn(
            'border-t',
            isDark ? 'border-gray-700' : 'border-gray-200'
          )} />
          <div className="p-1.5">{children}</div>
        </>
      )}
    </PopoverContent>
  );
}

// Helper to create currencies from string codes
export function createCurrenciesFromCodes(codes: string[]): FiatCurrency[] {
  return codes.map(code => {
    const existing = DEFAULT_FIAT_CURRENCIES.find(c => c.code === code);
    if (existing) return existing;
    // Fallback for unknown currencies
    return {
      id: code.toLowerCase(),
      code,
      name: code,
      symbol: code,
      flag: '🏳️',
    };
  });
}

export { 
  CurrencyProvider as CurrencySelector, 
  CurrencyTrigger, 
  CurrencyContent,
  type FiatCurrency,
};

