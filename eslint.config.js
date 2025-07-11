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
])
