import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import pkg from './package.json'

const outDir = 'lib'

export default defineConfig({
  build: {
    outDir,
    lib: {
      entry: 'src/index.ts',
      name: 'truncate',
      formats: ['cjs', 'es', 'iife', 'umd'],
      fileName: (format) => {
        switch (format) {
          case 'umd': {
            return 'index.umd.js'
          }

          case 'cjs': {
            return 'index.cjs'
          }

          case 'es': {
            return 'index.mjs'
          }

          default: {
            return 'index.js'
          }
        }
      },
    },
    minify: true,
    sourcemap: false,
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
      output: {
        globals: (name) => name,
      },
    },
  },
  plugins: [
    banner({
      outDir,
      content: [
        `/**`,
        ` * name: ${pkg.name}`,
        ` * version: v${pkg.version}`,
        ` * description: ${pkg.description}`,
        ` * author: ${pkg.author}`,
        ` * homepage: ${pkg.homepage}`,
        ` */`,
      ].join('\n'),
    }),
  ],
})
