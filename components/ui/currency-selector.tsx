'use client'

import * as React from 'react'
import { ChevronDown, Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from '@/components/ui/morphing-popover'

// Currency interface
export interface FiatCurrency {
  code: string
  name: string
  symbol: string
  flag?: string
}

// Default fiat currencies with symbols and names
export const DEFAULT_FIAT_CURRENCIES: FiatCurrency[] = [
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
]

// Helper to create currency objects from codes
export function createCurrenciesFromCodes(codes: string[]): FiatCurrency[] {
  return codes.map(code => {
    const found = DEFAULT_FIAT_CURRENCIES.find(c => c.code === code)
    return found || { code, name: code, symbol: code, flag: '🌍' }
  })
}

// Get symbol for a currency code
export function getCurrencySymbol(code: string): string {
  const found = DEFAULT_FIAT_CURRENCIES.find(c => c.code === code)
  return found?.symbol || code
}

interface CurrencySelectorProps {
  currencies: FiatCurrency[]
  selectedCurrencyCode: string
  onCurrencyChange: (currency: FiatCurrency) => void
  className?: string
}

export function CurrencySelector({
  currencies,
  selectedCurrencyCode,
  onCurrencyChange,
  className,
}: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  
  const selectedCurrency = React.useMemo(() => 
    currencies.find(c => c.code === selectedCurrencyCode) || currencies[0],
    [currencies, selectedCurrencyCode]
  )

  const handleSelect = (currency: FiatCurrency) => {
    onCurrencyChange(currency)
    setOpen(false)
  }

  return (
    <div className={cn('w-full', className)}>
      <MorphingPopover open={open} onOpenChange={setOpen} className="w-full">
        <MorphingPopoverTrigger
          className="w-full flex items-center justify-between h-12 px-4 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFC828] focus:ring-offset-0"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedCurrency?.flag}</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{selectedCurrency?.code}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{selectedCurrency?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#FFC828]">{selectedCurrency?.symbol}</span>
            <ChevronDown className={cn(
              "size-4 text-gray-500 dark:text-gray-400 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </div>
        </MorphingPopoverTrigger>
        
        <MorphingPopoverContent className="max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
            <Globe className="size-5 text-[#FFC828]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Currency
            </h2>
          </div>

          {/* Currency List */}
          <div className="max-h-[360px] overflow-y-auto p-2">
            {currencies.map((currency) => {
              const isSelected = selectedCurrency?.code === currency.code
              return (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200",
                    "focus:outline-none",
                    isSelected 
                      ? "bg-[#FFC828]/15 ring-2 ring-[#FFC828]" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <span className="text-3xl">{currency.flag}</span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={cn(
                      "font-semibold text-gray-900 dark:text-white",
                      isSelected && "text-[#FFC828]"
                    )}>{currency.code}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{currency.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg font-bold",
                      isSelected ? "text-[#FFC828]" : "text-gray-400 dark:text-gray-500"
                    )}>{currency.symbol}</span>
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
        </MorphingPopoverContent>
      </MorphingPopover>
    </div>
  )
}

export default CurrencySelector
