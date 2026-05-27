import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './useTheme'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const Icon = isDark ? SunIcon : MoonIcon

  return (
    <Button
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      onClick={toggleTheme}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Icon aria-hidden="true" data-icon="inline-start" />
    </Button>
  )
}
