import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/docs',
  globalSetup: './e2e/docs-global-setup.mjs',
  globalTeardown: './e2e/docs-global-teardown.mjs',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'on-first-retry',
    viewport: {
      width: 1280,
      height: 960,
    },
  },
})
