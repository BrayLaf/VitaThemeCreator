/**
 * Read-only render of a `CroppableImageSlot` in "crop" fit mode — the live
 * device preview's counterpart to `ImageCropper`'s interactive editor.
 * Measures its own rendered size via `ResizeObserver` (so it works at
 * whatever size the preview lays it out at, e.g. `.preview-bg-image`'s
 * `position:absolute; inset:0`) and reuses the exact same cover-fit math
 * (`coverLayoutPx`, lib/imageCrop.ts) the editor and the export
 * (`writeCoverFitCropPng`, main/modules/imageConversion.ts) both use, so
 * the preview always matches what adjusting the crop actually produces.
 */
import { useEffect, useRef, useState } from 'react'
import type { ImageCrop } from '@shared/types'
import { toFileUrl } from '../../lib/uiHelpers'
import { coverLayoutPx, useNaturalImageSize } from '../../lib/imageCrop'

export function CroppedImageLayer({
  sourcePath,
  crop,
  className
}: {
  sourcePath: string
  crop: ImageCrop
  className?: string
}): React.JSX.Element {
  const elRef = useRef<HTMLDivElement>(null)
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null)
  const naturalSize = useNaturalImageSize(sourcePath)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setFrameSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const layout = naturalSize && frameSize ? coverLayoutPx(naturalSize, frameSize, crop) : null

  return (
    <div
      ref={elRef}
      className={className}
      style={
        layout
          ? {
              backgroundImage: `url(${toFileUrl(sourcePath)})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${layout.backgroundWidth}px ${layout.backgroundHeight}px`,
              backgroundPosition: `${-layout.left}px ${-layout.top}px`
            }
          : undefined
      }
    />
  )
}
