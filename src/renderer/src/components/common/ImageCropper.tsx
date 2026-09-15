/**
 * Interactive cover-fit crop editor for any fixed-dimension image frame —
 * drag to pan, scroll/slider to zoom. Used by the notification-icon slots
 * (120×110, always cropped, with a live guide overlay showing what the
 * Vita's info-bar badge actually reveals — see the `NotificationIconImageSlot`
 * DECISION note, shared/types/imageSlots.ts) and, opt-in via
 * `CroppableImageSlot.fitMode`, by the lockscreen and page-background slots
 * (960×512 / 360×192 — see the `ResizeFit` DECISION note, shared/types/
 * common.ts, for why forced-stretch stays the default there).
 *
 * The crop math (`coverLayoutPx`, lib/imageCrop.ts) mirrors
 * `writeCoverFitCropPng`'s export-time `.resize` + `.extract` (main/modules/
 * imageConversion.ts) in CSS px instead of a sharp buffer, so what this
 * editor shows is exactly what gets shipped — and exactly what the
 * read-only `CroppedImageLayer` shows in the live device preview.
 */
import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import type { ImageCrop } from '@shared/types'
import { toFileUrl } from '../../lib/uiHelpers'
import { coverLayoutPx, useNaturalImageSize } from '../../lib/imageCrop'

const MIN_ZOOM = 1
const MAX_ZOOM = 3

interface ImageCropperProps {
  sourcePath: string
  crop: ImageCrop
  onChange: (crop: ImageCrop) => void
  /** Target frame's aspect ratio — the export dimensions (e.g. 960×512), not the on-screen editor size. */
  frameWidth: number
  frameHeight: number
  /** Optional overlay (e.g. the notification-icon position guide) drawn on top, same size as the frame. */
  guideOverlayUrl?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function ImageCropper({
  sourcePath,
  crop,
  onChange,
  frameWidth,
  frameHeight,
  guideOverlayUrl
}: ImageCropperProps): React.JSX.Element {
  const frameRef = useRef<HTMLDivElement>(null)
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null)
  const naturalSize = useNaturalImageSize(sourcePath)
  const dragRef = useRef<{
    startClientX: number
    startClientY: number
    startFocusX: number
    startFocusY: number
  } | null>(null)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setFrameSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const layout = naturalSize && frameSize ? coverLayoutPx(naturalSize, frameSize, crop) : null

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    if (!layout) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startFocusX: crop.focusX,
      startFocusY: crop.focusY
    }
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!dragRef.current || !layout) return
    const dx = e.clientX - dragRef.current.startClientX
    const dy = e.clientY - dragRef.current.startClientY
    onChange({
      ...crop,
      focusX: clamp(dragRef.current.startFocusX - dx / layout.backgroundWidth, 0, 1),
      focusY: clamp(dragRef.current.startFocusY - dy / layout.backgroundHeight, 0, 1)
    })
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>): void => {
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleWheel = (e: WheelEvent<HTMLDivElement>): void => {
    e.preventDefault()
    onChange({ ...crop, zoom: clamp(crop.zoom - e.deltaY * 0.001, MIN_ZOOM, MAX_ZOOM) })
  }

  const reset = (): void => onChange({ zoom: MIN_ZOOM, focusX: 0.5, focusY: 0.5 })

  return (
    <div className="image-cropper">
      <div
        ref={frameRef}
        className="image-cropper-frame"
        style={{ aspectRatio: `${frameWidth} / ${frameHeight}` }}
      >
        <div
          className="image-cropper-image"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
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
        {guideOverlayUrl && (
          <img className="image-cropper-guide" src={guideOverlayUrl} alt="" draggable={false} />
        )}
      </div>
      <div className="image-cropper-controls">
        <input
          type="range"
          className="image-cropper-zoom"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={crop.zoom}
          onChange={(e) => onChange({ ...crop, zoom: Number(e.target.value) })}
        />
        <button type="button" className="image-cropper-reset" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="image-cropper-hint">Drag to reposition · scroll to zoom</div>
    </div>
  )
}
