import '@testing-library/jest-dom/vitest'

const localStorageItems = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    clear: () => {
      localStorageItems.clear()
    },
    getItem: (key: string) => localStorageItems.get(key) ?? null,
    key: (index: number) => Array.from(localStorageItems.keys())[index] ?? null,
    get length() {
      return localStorageItems.size
    },
    removeItem: (key: string) => {
      localStorageItems.delete(key)
    },
    setItem: (key: string, value: string) => {
      localStorageItems.set(key, value)
    },
  },
})

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    addEventListener: () => undefined,
    addListener: () => undefined,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: () => undefined,
    removeListener: () => undefined,
  })
}
