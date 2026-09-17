/**
 * Every main-process function that touches `sharp`, gathered into one table
 * so they can run either in-process or inside the image worker
 * (`imageWorker/worker.ts`) behind the same call signatures — see
 * `imageWorker/index.ts` for why Linux needs the worker.
 */
import {
  convertLockscreenImage,
  convertNotificationIcon,
  convertPageBackground,
  convertPageIndicatorImage,
  generateLockscreenPreviewScreenshot,
  generatePackageThumbnail,
  generatePreviewScreenshot
} from '../modules/imageConversion'
import { compositeSystemIcon, generateIconSet } from '../modules/iconGeneration'

export const imageOps = {
  convertLockscreenImage,
  convertNotificationIcon,
  convertPageBackground,
  convertPageIndicatorImage,
  generateLockscreenPreviewScreenshot,
  generatePackageThumbnail,
  generatePreviewScreenshot,
  compositeSystemIcon,
  generateIconSet
}

export type ImageOps = typeof imageOps
export type ImageOpName = keyof ImageOps

export interface ImageWorkerRequest {
  id: number
  op: ImageOpName
  args: unknown[]
}

export type ImageWorkerResponse =
  { id: number; ok: true; value: unknown } | { id: number; ok: false; message: string }
