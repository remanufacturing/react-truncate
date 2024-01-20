import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { capitalize } from '@bassist/utils'

const autogenerates = ['reference', 'examples']

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
      title: 'React Truncate',
      social: {
        github: 'https://github.com/remanufacturing/react-truncate',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', link: '/guides/getting-started' },
          ],
        },
        ...autogenerates.map((i) => {
          return {
            label: capitalize(i),
            autogenerate: { directory: i },
          }
        }),
      ],
      customCss: ['./src/styles/index.css'],
    }),
  ],
})
