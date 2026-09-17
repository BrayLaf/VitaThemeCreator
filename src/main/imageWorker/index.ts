/**
 * The `sharp`-backed image functions (imageConversion.ts, iconGeneration.ts),
 * callable with their normal signatures from anywhere in the main process.
 * Import them from here, not from those modules directly.
 *
 * DECISION (2026-09-17): on Linux these run in a child process instead of
 * the Electron main process. Electron's Linux binaries leak the system
 * GLib's symbols into the process, which clash with the GLib statically
 * built into sharp's libvips (sharp's install docs, "Electron and Linux";
 * electron/electron#46323, still open). Chromium makes the resulting
 * GLib-GObject criticals fatal, so the main process dies with a
 * breakpoint trap on the first export. The same Electron binary run with
 * `ELECTRON_RUN_AS_NODE=1` still prints those criticals but doesn't
 * install the fatal handler, and its output was verified byte-identical to
 * the same sharp calls under plain Node on Linux. macOS/Windows don't have
 * the clash, so they keep calling in-process. Set `VITA_THEME_IMAGE_WORKER=1`
 * to force the worker on any platform for testing.
 */
import { fork, type ChildProcess } from 'child_process'
import { join } from 'path'
import { ASSETS_ROOT_ENV, themebuilderAssetPath } from '../resourcePaths'
import {
  imageOps,
  type ImageOpName,
  type ImageOps,
  type ImageWorkerRequest,
  type ImageWorkerResponse
} from './imageOps'

const useWorker = process.platform === 'linux' || process.env['VITA_THEME_IMAGE_WORKER'] === '1'

let worker: ChildProcess | null = null
let nextRequestId = 0
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (e: Error) => void }>()

function getWorker(): ChildProcess {
  if (worker) return worker

  const child = fork(join(__dirname, 'imageWorker.js'), [], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      [ASSETS_ROOT_ENV]: themebuilderAssetPath()
    },
    serialization: 'advanced',
    stdio: ['ignore', 'inherit', 'pipe', 'ipc']
  })

  // The GLib clash still prints a critical per libvips object in the
  // worker. Harmless there, but it would bury real errors.
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk: string) => {
    const lines = chunk.split('\n').filter((line) => line.trim() && !line.includes('GLib-GObject'))
    if (lines.length > 0) process.stderr.write(lines.join('\n') + '\n')
  })

  child.on('message', (response: ImageWorkerResponse) => {
    const request = pending.get(response.id)
    if (!request) return
    pending.delete(response.id)
    if (response.ok) request.resolve(response.value)
    else request.reject(new Error(response.message))
  })

  child.on('exit', (code, signal) => {
    if (worker === child) worker = null
    const error = new Error(`Image worker exited unexpectedly (code ${code}, signal ${signal})`)
    for (const request of pending.values()) request.reject(error)
    pending.clear()
  })

  worker = child
  return child
}

function viaWorker<K extends ImageOpName>(op: K): ImageOps[K] {
  if (!useWorker) return imageOps[op]
  return ((...args: unknown[]) =>
    new Promise((resolve, reject) => {
      const id = nextRequestId++
      pending.set(id, { resolve, reject })
      const request: ImageWorkerRequest = { id, op, args }
      getWorker().send(request)
    })) as ImageOps[K]
}

export const convertLockscreenImage = viaWorker('convertLockscreenImage')
export const convertNotificationIcon = viaWorker('convertNotificationIcon')
export const convertPageBackground = viaWorker('convertPageBackground')
export const convertPageIndicatorImage = viaWorker('convertPageIndicatorImage')
export const generateLockscreenPreviewScreenshot = viaWorker('generateLockscreenPreviewScreenshot')
export const generatePackageThumbnail = viaWorker('generatePackageThumbnail')
export const generatePreviewScreenshot = viaWorker('generatePreviewScreenshot')
export const compositeSystemIcon = viaWorker('compositeSystemIcon')
export const generateIconSet = viaWorker('generateIconSet')
