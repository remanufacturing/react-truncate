import { execSync } from 'child_process'
import pkg from '../package.json'

async function run() {
  const { version } = pkg

  const notes = `Please refer to [CHANGELOG](https://github.com/remanufacturing/react-truncate/blob/main/CHANGELOG.md) for details.`

  const releaseArgs = [
    `git tag -a v${version} -m "v${version}"`,
    `git push origin v${version}`,
    `gh release create v${version} --title "v${version}" --notes "${notes}"`,
  ]

  const cmd = releaseArgs.join(' && ')
  execSync(cmd)
}
run().catch((e) => {
  console.log(e)
})
