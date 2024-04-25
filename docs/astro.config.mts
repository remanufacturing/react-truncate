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
