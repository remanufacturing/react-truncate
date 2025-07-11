import { readFile } from 'node:fs/promises'
import { BundleFormat, createBaseConfig } from '@bassist/build-config/tsup'
import { type Options, defineConfig } from 'tsup'
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

const baseConfig = createBaseConfig({
  pkg,
  format: [BundleFormat.ESM, BundleFormat.CJS, BundleFormat.IIFE],
  globalName: 'ReactTruncate',
})

export default defineConfig({
  ...baseConfig,
  esbuildOptions(options) {
    options.external = external
  },
  // https://esbuild.github.io/plugins/#using-plugins
  esbuildPlugins: [externalPlugin, removePropertiesPlugin],
})
