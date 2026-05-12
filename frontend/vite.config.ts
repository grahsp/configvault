import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.ts',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
