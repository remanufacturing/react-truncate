import { execSync, spawn } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = 4174
const PID_FILE = '/tmp/react-truncate-smoke-vite.pid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const smokeRoot = path.resolve(__dirname)
const repoRoot = path.resolve(smokeRoot, '..')
const consumerRoot = path.resolve(smokeRoot, 'consumer')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function stopExistingServer() {
  try {
    const pid = Number.parseInt(readFileSync(PID_FILE, 'utf8'), 10)

    if (!Number.isNaN(pid)) {
      try {
        process.kill(-pid, 'SIGTERM')
      } catch {
        process.kill(pid, 'SIGTERM')
      }
    }
  } catch {
    // No previous server to stop.
  }

  rmSync(PID_FILE, { force: true })
}

export default async function globalSetup() {
  stopExistingServer()

  execSync('pnpm smoke:prepare', {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  const child = spawn(
    'pnpm',
    [
      '--ignore-workspace',
      'dev',
      '--host',
      '127.0.0.1',
      '--port',
      String(PORT),
    ],
    {
      cwd: consumerRoot,
      detached: true,
      stdio: 'ignore',
    },
  )

  child.unref()
  writeFileSync(PID_FILE, String(child.pid))

  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      execSync(`curl -sf http://127.0.0.1:${PORT}/ > /dev/null`, {
        cwd: repoRoot,
        stdio: 'ignore',
      })
      return
    } catch {
      await sleep(250)
    }
  }

  throw new Error(`Timed out waiting for the smoke Vite server on port ${PORT}`)
}
