import { spawn } from 'child_process'
import http from 'http'
import process from 'process'

const rendererUrl = 'http://127.0.0.1:5173'
let shuttingDown = false

function waitForServer(url, attempts = 60) {
  return new Promise((resolve, reject) => {
    const tryRequest = (remaining) => {
      const request = http.get(url, (response) => {
        response.resume()
        resolve()
      })

      request.on('error', () => {
        request.destroy()

        if (remaining <= 0) {
          reject(new Error(`Timed out waiting for ${url}`))
          return
        }

        setTimeout(() => tryRequest(remaining - 1), 500)
      })
    }

    tryRequest(attempts)
  })
}

const viteProcess = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_RUN: '1',
    },
  }
)

const cleanup = () => {
  if (shuttingDown) return
  shuttingDown = true
  viteProcess.kill('SIGTERM')
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
viteProcess.on('exit', () => cleanup())

try {
  await waitForServer(rendererUrl)

  const electronProcess = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['electron', '.'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        ELECTRON_RENDERER_URL: rendererUrl,
      },
    }
  )

  electronProcess.on('exit', (code) => {
    cleanup()
    process.exit(code ?? 0)
  })
} catch (error) {
  console.error(error.message)
  cleanup()
  process.exit(1)
}
