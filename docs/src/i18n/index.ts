export const languages = {
  en: 'English',
  zh: '简体中文',
} as const

export type Languages = keyof typeof languages

export const defaultLang = 'en' as const

export const translations = {
  en: {
    'example.width': 'Parent Width:',
    'example.lines': 'Default Lines:',
    'example.html': 'Rich Text:',
    'example.custom': 'Custom Buttons:',
    'example.end': 'End Position:',
  },
  zh: {
    'example.width': '父级宽度：',
    'example.lines': '默认行数：',
    'example.html': '富文本：',
    'example.custom': '自定义按钮:',
    'example.end': '结束位置：',
  },
} as const

export type TranslationKey = keyof (typeof translations)[typeof defaultLang]

export const getTranslation = (lang: Languages, key: TranslationKey) => {
  return translations[lang][key]
}
