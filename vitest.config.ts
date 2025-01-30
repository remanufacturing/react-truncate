import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/config/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
    },
  },
})
