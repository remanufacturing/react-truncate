import { defineConfig } from 'tsup'
import {
  defaultBundleFormatConfig,
  getBundleExtension,
  getBundleBanner,
} from '@bassist/node-utils'
import pkg from './package.json'

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
})
