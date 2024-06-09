// @ts-check
import { defineConfig, prettier, react } from '@bassist/eslint'

export default defineConfig([
  ...prettier,
  ...react,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    ignores: ['dist', 'lib', 'test'],
  },
])
