export const THEME_STORAGE_KEY = 'configvault-theme'

export const themes = ['light', 'dark'] as const

export type Theme = (typeof themes)[number]

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

export function getSystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}
