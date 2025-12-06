'use client'

import * as React from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  return (
    <div className={cn(className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{selectedCurrency?.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{selectedCurrency?.code}</span>
                <span className="text-xs text-muted-foreground">{selectedCurrency?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#FFC828]">{selectedCurrency?.symbol}</span>
              <ChevronDown className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )} />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-[280px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="size-4" />
            Select Currency
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {currencies.map((currency) => {
            const isSelected = selectedCurrency?.code === currency.code
            return (
              <DropdownMenuItem
                key={currency.code}
                onSelect={() => {
                  onCurrencyChange(currency)
                  setOpen(false)
                }}
                className={cn(
                  "cursor-pointer py-2.5 transition-all duration-200",
                  isSelected 
                    ? "bg-[#FFC828]/20 border-l-2 border-[#FFC828]" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex flex-1 items-center gap-3">
                  <span className="text-xl">{currency.flag}</span>
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-medium",
                      isSelected && "text-[#FFC828] font-semibold"
                    )}>{currency.code}</span>
                    <span className="text-xs text-muted-foreground">{currency.name}</span>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-[#FFC828]" : "text-muted-foreground"
                )}>{currency.symbol}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default CurrencySelector

