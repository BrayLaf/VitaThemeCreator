/**
 * Shared cover-fit crop math + natural-image-size loading, used by both
 * `ImageCropper` (the interactive editor) and `CroppedImageLayer` (the
 * read-only live-preview render) so the preview shows exactly what the
 * editor and the export (`writeCoverFitCropPng`, main/modules/
 * imageConversion.ts) will actually produce.
 */
import { useEffect, useState } from 'react'
import type { ImageCrop } from '@shared/types'
import { toFileUrl } from './uiHelpers'

/** Same cover-fit + focal-point math as `writeCoverFitCropPng`, in CSS px instead of a sharp `extract`. */
export function coverLayoutPx(
  natural: { width: number; height: number },
  frame: { width: number; height: number },
  crop: ImageCrop
): { backgroundWidth: number; backgroundHeight: number; left: number; top: number } {
  const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value))
  const coverScale =
    Math.max(frame.width / natural.width, frame.height / natural.height) * crop.zoom
  const backgroundWidth = Math.max(frame.width, natural.width * coverScale)
  const backgroundHeight = Math.max(frame.height, natural.height * coverScale)
  const left = clamp(
    crop.focusX * backgroundWidth - frame.width / 2,
    0,
    backgroundWidth - frame.width
  )
  const top = clamp(
    crop.focusY * backgroundHeight - frame.height / 2,
    0,
    backgroundHeight - frame.height
  )
  return { backgroundWidth, backgroundHeight, left, top }
}

/** Loads `sourcePath`'s natural pixel dimensions; null while loading or if `sourcePath` is null. Tracks staleness internally, so callers don't need a remount-on-change `key` trick. */
export function useNaturalImageSize(
  sourcePath: string | null
): { width: number; height: number } | null {
  const [state, setState] = useState<{
    path: string
    size: { width: number; height: number }
  } | null>(null)

  useEffect(() => {
    if (!sourcePath) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) {
        setState({ path: sourcePath, size: { width: img.naturalWidth, height: img.naturalHeight } })
      }
    }
    img.src = toFileUrl(sourcePath)
    return () => {
      cancelled = true
    }
  }, [sourcePath])

  return state && state.path === sourcePath ? state.size : null
}
