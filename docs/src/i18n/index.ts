export const languages = {
  en: 'English',
  zh: '简体中文',
} as const

export type Languages = keyof typeof languages

export const defaultLang = 'en' as const

export const translations = {
  en: {
    'example.width': 'Width:',
    'example.lines': 'Lines:',
    'example.html': 'HTML:',
  },
  zh: {
    'example.width': '宽度：',
    'example.lines': '行数：',
    'example.html': 'HTML：',
  },
} as const

type TranslationKey = keyof (typeof translations)[typeof defaultLang]

export const getTranslation = (lang: Languages, key: TranslationKey) => {
  return translations[lang][key]
}
