import { useMemo } from 'react'

export const languages = {
  en: 'English',
  zh: '简体中文',
} as const

export type Languages = keyof typeof languages

export const defaultLang = 'en' as const

export const translations = {
  en: {
    separator: ' ',

    // Controllable Examples
    'example.width': 'Parent Width:',
    'example.lines': 'Default Lines:',
    'example.html': 'Rich Text:',
    'example.custom': 'Custom Buttons:',
    'example.end': 'End Position:',
    'example.dialogTitle': 'Here is the full content',

    // CodeCollapser
    'collapser.collapse': 'Collapse',
    'collapser.expand': 'Expand',
    'collapser.name': 'Code',

    // AppliesTo
    'appliesTo.title': 'Applies to:',
    'appliesTo.relatedIssues': 'Related issues:',
  },
  zh: {
    separator: '',

    // Controllable Examples
    'example.width': '父级宽度：',
    'example.lines': '默认行数：',
    'example.html': '富文本：',
    'example.custom': '自定义按钮:',
    'example.end': '结束位置：',
    'example.dialogTitle': '这里是完整的内容',

    // CodeCollapser
    'collapser.collapse': '收起',
    'collapser.expand': '展开',
    'collapser.name': '代码',

    // AppliesTo
    'appliesTo.title': '适用于：',
    'appliesTo.relatedIssues': '相关 issue ：',
  },
} as const

export type TranslationKey = keyof (typeof translations)[typeof defaultLang]

export const getTranslation = (lang: Languages, key: TranslationKey) => {
  return translations[lang][key]
}

export const useLang = (lang: Languages) => {
  const isZh = useMemo(() => lang === 'zh', [lang])

  return {
    isZh,
  }
}
