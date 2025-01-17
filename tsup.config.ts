import { defineConfig } from 'tsup'
import {
  defaultBundleFormatConfig,
  getBundleExtension,
  getBundleBanner,
} from '@bassist/node-utils'
import pkg from './package.json'

const externalMapping = {
  react: 'React',
  'react-dom': 'ReactDOM',
} as const

const external = Object.keys(externalMapping)

export default defineConfig({
  entry: ['src/index.ts'],
  target: ['es2020'],
  format: defaultBundleFormatConfig,
  globalName: 'ReactTruncate',
  outExtension: (ctx) => getBundleExtension(ctx),
  outDir: 'dist',
  dts: true,
  banner: {
    js: getBundleBanner(pkg),
  },
  bundle: true,
  minify: true,
  clean: true,
  esbuildOptions(options) {
    options.external = external
  },
  // https://esbuild.github.io/plugins/#using-plugins
  esbuildPlugins: [
    {
      name: 'external-plugin',
      setup(build) {
        build.onResolve(
          {
            filter: new RegExp(`^(${external.join('|')})$`),
          },
          (args) => ({
            path: args.path,
            namespace: 'external',
          }),
        )

        build.onLoad({ filter: /.*/, namespace: 'external' }, (args) => {
          const globalVar = externalMapping[args.path]
          return { contents: `module.exports=window.${globalVar};` }
        })
      },
    },
  ],
})
