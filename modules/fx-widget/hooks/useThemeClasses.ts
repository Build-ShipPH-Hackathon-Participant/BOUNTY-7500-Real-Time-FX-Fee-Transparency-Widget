import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import type { ThemeClasses } from '../types'

/**
 * Hook for theme-aware CSS classes
 * Uses Tailwind dark: variants to avoid hydration mismatch
 */
export function useThemeClasses(): ThemeClasses & { isDark: boolean; mounted: boolean } {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use resolvedTheme only after mount to avoid hydration mismatch
  const isDark = mounted ? resolvedTheme === 'dark' : false

  // Return static Tailwind classes with dark: variants
  // CSS handles the theme switching, avoiding hydration mismatch
  return {
    mounted,
    isDark,
    bgClass: "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
    borderClass: "border-gray-200 dark:border-gray-700",
    inputBgClass: "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
    labelClass: "text-gray-600 dark:text-gray-300",
    mutedClass: "text-gray-500 dark:text-gray-400",
    breakdownBgClass: "bg-gray-50 dark:bg-gray-800",
  }
}
