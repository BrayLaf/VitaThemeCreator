/**
 * Image worker entry point — a separate bundle (electron.vite.config.ts)
 * forked by `imageWorker/index.ts` with `ELECTRON_RUN_AS_NODE=1`, so there
 * is no Electron API here, only Node. Runs the requested `imageOps` function
 * and posts its result (or error message) back over the IPC channel.
 */
import { imageOps, type ImageWorkerRequest, type ImageWorkerResponse } from './imageOps'

function reply(response: ImageWorkerResponse): void {
  process.send?.(response)
}

process.on('message', async (request: ImageWorkerRequest) => {
  try {
    const fn = imageOps[request.op] as (...args: unknown[]) => Promise<unknown>
    reply({ id: request.id, ok: true, value: await fn(...request.args) })
  } catch (error) {
    reply({
      id: request.id,
      ok: false,
      message: error instanceof Error ? error.message : String(error)
    })
  }
})

// Parent quit or crashed — don't linger as an orphan.
process.on('disconnect', () => process.exit(0))
