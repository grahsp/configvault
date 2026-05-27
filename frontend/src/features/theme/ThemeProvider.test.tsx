import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { THEME_STORAGE_KEY } from './theme'
import { useTheme } from './useTheme'

describe('ThemeProvider', () => {
  afterEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
    mockSystemTheme(false)
  })

  it('uses the system dark preference when no theme is stored', async () => {
    mockSystemTheme(true)

    renderThemeConsumer()

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })
  })

  it('uses a stored preference over the system preference', async () => {
    mockSystemTheme(true)
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')

    renderThemeConsumer()

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light')
    })
  })

  it('toggles the theme class and persists the explicit preference', async () => {
    const user = userEvent.setup()
    mockSystemTheme(false)

    renderThemeConsumer()
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).not.toHaveClass('light')
  })
})

function renderThemeConsumer() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  )
}

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <p data-testid="theme">{theme}</p>
      <button onClick={toggleTheme} type="button">
        Toggle theme
      </button>
    </>
  )
}

function mockSystemTheme(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: prefersDark,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    }),
  })
}
