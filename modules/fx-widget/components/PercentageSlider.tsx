'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider-number-flow'
import { ITEM_VARIANTS, PERCENTAGE_POINTS } from '../constants'
import { findClosestPoint } from '../utils/calculations'

interface PercentageSliderProps {
  sliderValue: number
  onSliderChange: (values: number[]) => void
  onSliderCommit: (values: number[]) => void
  onPointClick: (e: React.MouseEvent, percentage: number) => void
  labelClass: string
}

export function PercentageSlider({
  sliderValue,
  onSliderChange,
  onSliderCommit,
  onPointClick,
  labelClass,
}: PercentageSliderProps) {
  const selectedPoint = useMemo(
    () => findClosestPoint(sliderValue, PERCENTAGE_POINTS),
    [sliderValue]
  )

  return (
    <motion.div className="mb-6" variants={ITEM_VARIANTS}>
      <label className={cn('block text-sm font-medium mb-3 transition-colors duration-300', labelClass)}>
        Select percentage
      </label>
      <div className="relative pt-12 pb-6">
        <Slider
          value={[sliderValue]}
          onValueChange={onSliderChange}
          onValueCommit={onSliderCommit}
          min={0}
          max={100}
          step={1}
          aria-label="Percentage slider"
        />
        {/* Percentage point buttons */}
        <div
          className="absolute left-[10px] right-[10px] pointer-events-none"
          style={{
            top: '50px',
            height: '16px',
            zIndex: 30,
          }}
        >
          {PERCENTAGE_POINTS.map((point) => {
            const isSelected = selectedPoint === point
            return (
              <button
                key={point}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Set to ${point}%`}
                onClick={(e) => onPointClick(e, point)}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={cn(
                  'absolute rounded-full transition-all duration-300 pointer-events-auto cursor-pointer',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC828]',
                  'w-4 h-4 -translate-x-1/2',
                  'hover:scale-125 hover:border-[3px]',
                  isSelected
                    ? 'bg-[#FFC828] border-[3px] border-[#FFC828] shadow-[0_0_0_2px_rgba(255,200,40,0.2)]'
                    : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500'
                )}
                style={{
                  left: `${point}%`,
                  top: '0px',
                  zIndex: 30,
                }}
              />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
