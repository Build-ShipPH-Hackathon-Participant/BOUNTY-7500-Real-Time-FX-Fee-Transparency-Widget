'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'

interface DirectionToggleProps {
  direction: 'send' | 'receive'
  onDirectionChange: (direction: 'send' | 'receive') => void
}

export function DirectionToggle({ direction, onDirectionChange }: DirectionToggleProps) {
  return (
    <motion.div className="mb-4 flex gap-2" variants={ITEM_VARIANTS}>
      {['Send', 'Receive'].map((dir) => {
        const isActive = direction === dir.toLowerCase()
        return (
          <button
            key={dir}
            onClick={() => onDirectionChange(dir.toLowerCase() as 'send' | 'receive')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-semibold rounded transition-all duration-300 group relative overflow-hidden',
              isActive
                ? 'bg-[#FFC828] text-black border-transparent'
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-inherit'
            )}
            aria-pressed={isActive}
          >
            <span className="relative z-10">{dir}</span>
            <motion.div
              className="absolute inset-0 bg-opacity-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            />
          </button>
        )
      })}
    </motion.div>
  )
}
