import { defineConfig, type Options } from 'tsup'
import {
  defaultBundleFormatConfig,
  getBundleExtension,
  getBundleBanner,
} from '@bassist/node-utils'
import { readFile } from 'node:fs/promises'
import pkg from './package.json'

type ESBuildPlugin = NonNullable<Options['esbuildPlugins']>[number]

const externalMapping = {
  react: 'React',
  'react-dom': 'ReactDOM',
} as const

const external = Object.keys(externalMapping)

const externalPlugin: ESBuildPlugin = {
  name: 'external-plugin',
  setup(build) {
    build.onResolve(
      { filter: new RegExp(`^(${external.join('|')})$`) },
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
}

const removePropertiesPlugin: ESBuildPlugin = {
  name: 'remove-properties-plugin',
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const source = await readFile(args.path, 'utf8')
      const regex = /\s*(data-testid)\s*=\s*["'][^"']*["']/g
      const modifiedSource = source.replace(regex, '')
      return { contents: modifiedSource, loader: 'tsx' }
    })
  },
}

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
  esbuildPlugins: [externalPlugin, removePropertiesPlugin],
})
