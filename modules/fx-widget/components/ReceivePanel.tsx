'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, ChevronDown } from 'lucide-react'
import { QrCode } from '@ark-ui/react/qr-code'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// ============================================================================
// Demo Data
// ============================================================================
const DEMO_ADDRESS = '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12'

const NETWORKS = [
  { id: 'tron', name: 'TRC20 (Tron)', symbol: 'TRX' },
  { id: 'ethereum', name: 'ERC20 (Ethereum)', symbol: 'ETH' },
  { id: 'bsc', name: 'BEP20 (BSC)', symbol: 'BNB' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
]

const ACCOUNTS = [
  { id: '1', name: 'Account 1' },
  { id: '2', name: 'Account 2' },
  { id: '3', name: 'Account 3' },
]

// ============================================================================
// QR Code Component (inline)
// ============================================================================
interface QrCodeDisplayProps {
  value: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function QrCodeDisplay({ value, size = 'md', className }: QrCodeDisplayProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  }

  return (
    <QrCode.Root
      value={value}
      encoding={{ ecc: 'M' }}
      className={cn('flex items-center justify-center', className)}
    >
      <QrCode.Frame
        className={cn(
          sizeClasses[size],
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg transition-colors duration-300'
        )}
      >
        <QrCode.Pattern className="fill-gray-900 dark:fill-white transition-colors duration-300" />
      </QrCode.Frame>
    </QrCode.Root>
  )
}

// ============================================================================
// Dropdown Component (reusable)
// ============================================================================
interface DropdownOption {
  id: string
  name: string
}

interface DropdownProps {
  options: DropdownOption[]
  selected: DropdownOption
  onSelect: (option: DropdownOption) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  width?: string
}

function Dropdown({ options, selected, onSelect, open, onOpenChange, width = 'w-48' }: DropdownProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
            'transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700',
            'border-gray-300 dark:border-gray-600'
          )}
        >
          {selected.name}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(width, 'p-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700')}
        align="end"
      >
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onSelect(option)
              onOpenChange(false)
            }}
            className={cn(
              'w-full px-3 py-2 text-sm text-left rounded-md transition-colors duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              selected.id === option.id && 'bg-gray-100 dark:bg-gray-700 font-medium'
            )}
          >
            {option.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// Info Row Component (reusable)
// ============================================================================
interface InfoRowProps {
  label: string
  labelClass: string
  children: React.ReactNode
  showBorder?: boolean
}

function InfoRow({ label, labelClass, children, showBorder = true }: InfoRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 transition-colors duration-300',
        showBorder && 'border-b border-gray-200 dark:border-gray-700'
      )}
    >
      <span className={cn('text-sm transition-colors duration-300', labelClass)}>
        {label}
      </span>
      {children}
    </div>
  )
}

// ============================================================================
// Main ReceivePanel Component
// ============================================================================
interface ReceivePanelProps {
  borderClass: string
  breakdownBgClass: string
  labelClass: string
  mutedClass: string
}

export function ReceivePanel({
  borderClass,
  breakdownBgClass,
  labelClass,
  mutedClass,
}: ReceivePanelProps) {
  const [copied, setCopied] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0])
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0])
  const [networkOpen, setNetworkOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(DEMO_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="space-y-6"
      variants={ITEM_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold transition-colors duration-300">
          Deposit USDT
        </h3>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <QrCodeDisplay value={DEMO_ADDRESS} size="md" />
      </div>

      {/* Address Section */}
      <motion.div
        className={cn(
          'p-4 rounded-lg border transition-colors duration-300',
          borderClass,
          breakdownBgClass
        )}
        variants={ITEM_VARIANTS}
      >
        <p className={cn('text-sm mb-2 transition-colors duration-300', labelClass)}>
          Address
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold break-all flex-1 transition-colors duration-300">
            {DEMO_ADDRESS}
          </p>
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg border transition-all duration-300',
              'hover:bg-[#FFC828] hover:border-[#FFC828] hover:scale-105 active:scale-95',
              'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
            )}
            aria-label="Copy address"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div
        className={cn(
          'rounded-lg border transition-colors duration-300 overflow-hidden',
          borderClass,
          breakdownBgClass
        )}
        variants={ITEM_VARIANTS}
      >
        {/* Network Row */}
        <InfoRow label="Network" labelClass={labelClass}>
          <Dropdown
            options={NETWORKS}
            selected={selectedNetwork}
            onSelect={(option) => setSelectedNetwork(option as typeof NETWORKS[0])}
            open={networkOpen}
            onOpenChange={setNetworkOpen}
            width="w-48"
          />
        </InfoRow>

        {/* Account Row */}
        <InfoRow label="Account" labelClass={labelClass}>
          <Dropdown
            options={ACCOUNTS}
            selected={selectedAccount}
            onSelect={(option) => setSelectedAccount(option as typeof ACCOUNTS[0])}
            open={accountOpen}
            onOpenChange={setAccountOpen}
            width="w-36"
          />
        </InfoRow>

        {/* Minimum Deposit Row */}
        <InfoRow label="Minimum deposit" labelClass={labelClass}>
          <span className="text-sm font-medium transition-colors duration-300">
            0.01 USDT
          </span>
        </InfoRow>

        {/* Arrival Time Row */}
        <InfoRow label="Arrival time" labelClass={labelClass}>
          <span className="text-sm font-medium transition-colors duration-300">
            ~ 1 minute
          </span>
        </InfoRow>

        {/* Withdrawal Available Time Row */}
        <InfoRow label="Withdrawal available time" labelClass={labelClass} showBorder={false}>
          <span className="text-sm font-medium transition-colors duration-300">
            ~ 1 minute
          </span>
        </InfoRow>
      </motion.div>

      {/* Warning Notice */}
      <motion.p
        className={cn('text-xs text-center leading-relaxed transition-colors duration-300', mutedClass)}
        variants={ITEM_VARIANTS}
      >
        Only send USDT to this address. Sending any other asset may result in permanent loss.
      </motion.p>
    </motion.div>
  )
}

