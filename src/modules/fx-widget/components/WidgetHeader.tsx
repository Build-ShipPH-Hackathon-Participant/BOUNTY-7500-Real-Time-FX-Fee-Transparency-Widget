'use client'

import { motion } from 'framer-motion'
import Switch from '@/components/ui/dark-mode-toggle'
import { ITEM_VARIANTS } from '../constants'

interface WidgetHeaderProps {
  mutedClass: string
}

export function WidgetHeader({ mutedClass }: WidgetHeaderProps) {
  return (
    <>
      {/* Logo and theme toggle */}
      <motion.div className="mb-6 flex justify-center items-center gap-4" variants={ITEM_VARIANTS}>
        <img src="/images/zxcasd.png" alt="Ripe Logo" className="h-12" />
        <div className="ml-auto">
          <Switch />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div className="mb-6" variants={ITEM_VARIANTS}>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Convert & Receive</h2>
        <p className={`text-sm ${mutedClass}`}>See exactly what you'll receive after all fees</p>
      </motion.div>
    </>
  )
}

