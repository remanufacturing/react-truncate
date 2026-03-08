import { execSync, spawn } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PORT = 4175
const PID_FILE = '/tmp/react-truncate-docs-preview.pid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsRoot = path.resolve(repoRoot, 'docs')
const skipBuild = process.env.SKIP_DOCS_E2E_BUILD === '1'

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

  if (!skipBuild) {
    execSync('pnpm build:lib', {
      cwd: repoRoot,
      stdio: 'inherit',
    })

    execSync('pnpm -F docs build', {
      cwd: repoRoot,
      stdio: 'inherit',
    })
  }

  const child = spawn(
    'pnpm',
    ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(PORT)],
    {
      cwd: docsRoot,
      detached: true,
      stdio: 'ignore',
    },
  )

  child.unref()
  writeFileSync(PID_FILE, String(child.pid))

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      execSync(`curl -sf http://127.0.0.1:${PORT}/ > /dev/null`, {
        cwd: repoRoot,
        stdio: 'ignore',
      })
      return
    } catch {
      await sleep(500)
    }
  }

  throw new Error(
    `Timed out waiting for the docs preview server on port ${PORT}`,
  )
}
