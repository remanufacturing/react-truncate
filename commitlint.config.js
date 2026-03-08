import defaultConfig from '@commitlint/config-conventional'
import { RuleConfigSeverity } from '@commitlint/types'

const baseTypes = defaultConfig.rules['type-enum'][2]

export default {
  ...defaultConfig,
  rules: {
    ...defaultConfig.rules,
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [
        ...baseTypes,
        'release', // Release new version
        'wip', // Work in Progress
        'deprecated', // Deprecated API
      ],
    ],
  },
}
