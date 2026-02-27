'use client'

import { useTheme as useThemeHook } from 'next-themes'

/**
 * Hook customizado para acessar e controlar o tema da aplicação
 * @returns {Object} { theme, setTheme, themes }
 */
export function useTheme() {
  return useThemeHook()
}
