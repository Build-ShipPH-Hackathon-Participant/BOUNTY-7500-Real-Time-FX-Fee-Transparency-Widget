'use client'

import { motion } from 'framer-motion'
import { ITEM_VARIANTS } from '../constants'

interface DirectionToggleProps {
  direction: 'send' | 'receive'
  onDirectionChange: (direction: 'send' | 'receive') => void
  isDark: boolean
}

export function DirectionToggle({ direction, onDirectionChange, isDark }: DirectionToggleProps) {
  return (
    <motion.div className="mb-4 flex gap-2" variants={ITEM_VARIANTS}>
      {['Send', 'Receive'].map((dir) => (
        <button
          key={dir}
          onClick={() => onDirectionChange(dir.toLowerCase() as 'send' | 'receive')}
          className="flex-1 px-3 py-2 text-sm font-semibold rounded transition-all duration-300 group relative overflow-hidden"
          style={{
            backgroundColor: direction === dir.toLowerCase() ? '#FFC828' : 'transparent',
            color: direction === dir.toLowerCase() ? '#000' : 'inherit',
            border: direction === dir.toLowerCase() ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
          }}
          aria-pressed={direction === dir.toLowerCase()}
        >
          <span className="relative z-10">{dir}</span>
          <motion.div
            className="absolute inset-0 bg-opacity-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          />
        </button>
      ))}
    </motion.div>
  )
}

