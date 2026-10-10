import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    // jsdom is the DOM implementation DOMPurify is tested against.
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
})
