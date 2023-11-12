import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  outDir: '../dist',
  integrations: [
    starlight({
      title: 'React Truncate',
      social: {
        github: 'https://github.com/remanufacturing/react-truncate',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', link: '/guides/example/' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
})
