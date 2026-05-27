import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSystemTheme, isTheme, type Theme, THEME_STORAGE_KEY } from './theme'
import { ThemeContext } from './themeContext'

type ThemeProviderProps = {
  children: React.ReactNode
}

function getStoredTheme() {
  const storedTheme = readStoredTheme()

  if (isTheme(storedTheme)) {
    return storedTheme
  }

  return null
}

function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    return undefined
  }
}

function getInitialTheme() {
  return getStoredTheme() ?? getSystemTheme()
}

function applyTheme(theme: Theme) {
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(() => getStoredTheme())
  const [theme, setResolvedTheme] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (explicitTheme) {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [explicitTheme])

  const setTheme = useCallback((nextTheme: Theme) => {
    writeStoredTheme(nextTheme)
    setExplicitTheme(nextTheme)
    setResolvedTheme(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = useMemo(
    () => ({
      setTheme,
      theme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
