'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/slider-number-flow'
import { ITEM_VARIANTS, PERCENTAGE_POINTS } from '../constants'
import { findClosestPoint } from '../utils/calculations'

interface PercentageSliderProps {
  sliderValue: number
  onSliderChange: (values: number[]) => void
  onSliderCommit: (values: number[]) => void
  onPointClick: (e: React.MouseEvent, percentage: number) => void
  isDark: boolean
  labelClass: string
}

export function PercentageSlider({
  sliderValue,
  onSliderChange,
  onSliderCommit,
  onPointClick,
  isDark,
  labelClass,
}: PercentageSliderProps) {
  const selectedPoint = useMemo(
    () => findClosestPoint(sliderValue, PERCENTAGE_POINTS),
    [sliderValue]
  )

  return (
    <motion.div className="mb-6" variants={ITEM_VARIANTS}>
      <label className={`block text-sm font-medium mb-3 ${labelClass}`}>
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
                className="absolute rounded-full border-2 transition-all pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC828]"
                style={{
                  left: `${point}%`,
                  width: '16px',
                  height: '16px',
                  top: '0px',
                  transform: 'translateX(-50%)',
                  backgroundColor: isSelected ? '#FFC828' : isDark ? '#444' : '#fff',
                  borderColor: isSelected ? '#FFC828' : isDark ? '#666' : '#ddd',
                  borderWidth: isSelected ? '3px' : '2px',
                  zIndex: 30,
                  boxShadow: isSelected ? '0 0 0 2px rgba(255, 200, 40, 0.2)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateX(-50%) scale(1.3)'
                    e.currentTarget.style.borderWidth = '3px'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
                    e.currentTarget.style.borderWidth = '2px'
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

