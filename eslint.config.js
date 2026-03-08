// @ts-check
import {
  createGetConfigNameFactory,
  defineFlatConfig,
  imports,
  javascript,
  jsx,
  node,
  react,
  typescript,
} from '@bassist/eslint-config'

const getConfigName = createGetConfigNameFactory('react-truncate')

export default defineFlatConfig([
  ...imports,
  ...typescript,
  ...jsx,
  ...javascript,
  ...node,
  ...react,

  {
    name: getConfigName('overrides'),
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  {
    name: getConfigName('ignore'),
    ignores: ['**/dist/**', '**/lib/**', '**/legacy/**'],
  },

  {
    name: getConfigName('test'),
    files: [
      'test/**/*.{js,mjs,ts,tsx}',
      'e2e/**/*.{js,mjs,ts,tsx}',
      'smoke/**/*.{js,mjs,ts,tsx,html}',
      'playwright.config.ts',
      'smoke/playwright.config.ts',
    ],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
    },
  },
])
