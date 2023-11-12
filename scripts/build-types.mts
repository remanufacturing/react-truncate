import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { generateDtsBundle } from 'dts-bundle-generator'

async function run() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const rootPath = resolve(__dirname, '..')
  const options = [
    {
      filePath: resolve(rootPath, `./src/index.ts`),
      output: {
        noBanner: true,
      },
    },
  ]

  const res = generateDtsBundle(options, {
    preferredConfigPath: resolve(rootPath, `./tsconfig.json`),
  })
  if (!Array.isArray(res) || !res.length) return

  const [dts] = res
  const output = resolve(rootPath, `./lib/index.d.ts`)
  writeFileSync(output, dts)
}
run().catch((e) => {
  console.log(e)
})
