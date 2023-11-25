import { execSync } from 'child_process'
import pkg from '../package.json'

async function run() {
  const { version } = pkg

  const releaseArgs = [
    `git tag -a v${version} -m "v${version}"`,
    `git push origin v${version}`,
  ]

  const cmd = releaseArgs.join(' && ')
  execSync(cmd)
}
run().catch((e) => {
  console.log(e)
})
