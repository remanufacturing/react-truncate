import { defineConfig } from 'astro/config'
import { capitalize } from '@bassist/utils'
import unocss from 'unocss/astro'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'

const autogenerates = {
  reference: {
    zh: '参考',
  },
}

interface OgConfig {
  tag: 'meta'
  attrs: {
    property: string
    content: string
  }
}

const ogTypes = ['og', 'twitter'] as const

const ogConfigs = [
  {
    name: 'card',
    content: 'summary_large_image',
  },
  {
    name: 'description',
    content:
      'Provides `Truncate`, `MiddleTruncate` and `ShowMore` React components for truncating multi-line spans and adding an ellipsis.',
  },
  {
    name: 'image',
    content: 'https://truncate.js.org/og-image.png',
  },
]

const getHead = () => {
  const [og, twitter] = ogTypes.map((type) => {
    return ogConfigs.map<OgConfig>(({ name, content }) => {
      return {
        tag: 'meta',
        attrs: {
          property: `${type}:${name}`,
          content,
        },
      }
    })
  })

  return [...og!, ...twitter!]
}

// https://astro.build/config
export default defineConfig({
  outDir: 'dist',
  build: {
    assets: 'assets',
  },
  integrations: [
    unocss(),

    react(),

    starlight({
      favicon: '/favicon.ico',
      title: 'React Truncate',
      head: getHead(),
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        zh: {
          label: '简体中文',
          lang: 'zh',
        },
      },
      social: {
        github: 'https://github.com/remanufacturing/react-truncate',
      },
      sidebar: [
        {
          label: 'Guides',
          translations: {
            zh: '指南',
          },
          items: [
            {
              label: 'Getting Started',
              translations: {
                zh: '快速上手',
              },
              link: '/guides/getting-started',
            },
            {
              label: 'About',
              translations: {
                zh: '关于',
              },
              link: '/guides/about',
            },
          ],
        },
        ...Object.entries(autogenerates).map(([key, translations]) => {
          return {
            label: capitalize(key),
            translations,
            autogenerate: { directory: key },
          }
        }),
        {
          label: 'Release Notes',
          translations: {
            zh: '发行说明',
          },
          items: [
            {
              label: 'Changelog',
              translations: {
                zh: '更新日志',
              },
              link: 'https://github.com/remanufacturing/react-truncate/blob/main/CHANGELOG.md',
              attrs: {
                target: '_blank',
              },
            },
          ],
        },
      ],
      customCss: ['./src/styles/index.css'],
    }),
  ],
})
