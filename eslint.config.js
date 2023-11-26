// @ts-check
import { defineConfig, prettier, react } from '@bassist/eslint'

export default defineConfig([
  ...prettier,
  ...react,
  {
    ignores: ['dist', 'docs', 'lib', 'test'],
  },
])
