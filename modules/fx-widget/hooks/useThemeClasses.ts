import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import type { ThemeClasses } from '../types'

/**
 * Hook for theme-aware CSS classes
 */
export function useThemeClasses(): ThemeClasses & { isDark: boolean } {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return useMemo(() => ({
    isDark,
    bgClass: isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900",
    borderClass: isDark ? "border-gray-700" : "border-gray-200",
    inputBgClass: isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300",
    labelClass: isDark ? "text-gray-300" : "text-gray-600",
    mutedClass: isDark ? "text-gray-400" : "text-gray-500",
    breakdownBgClass: isDark ? "bg-gray-800" : "bg-gray-50",
  }), [isDark])
}

