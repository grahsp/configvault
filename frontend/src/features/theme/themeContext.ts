import { createContext } from 'react'
import type { Theme } from './theme'

export type ThemeContextValue = {
  setTheme: (theme: Theme) => void
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
