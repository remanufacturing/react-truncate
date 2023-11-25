import { execSync } from 'child_process'

async function run() {
  const changelogArgs = [
    `conventional-changelog`,
    `-p angular`,
    `-i CHANGELOG.md`,
    `-s`,
    `--commit-path=./src`,
  ]

  const cmd = changelogArgs.join(' ')
  execSync(cmd)
}
run().catch((e) => {
  console.log(e)
})
