/**
 * "Stretch to fit" / "Crop to fill" toggle for a `CroppableImageSlot`.
 * Stretch (`ResizeFit`'s original, still-default mode — see the DECISION
 * note, shared/types/common.ts) distorts the source image to exactly fill
 * the target frame; crop instead cover-fits it with a user-adjustable
 * zoom/pan (`ImageCropper`), never distorting.
 */
import type { ImageFitMode } from '@shared/types'

export function FitModeToggle({
  value,
  onChange
}: {
  value: ImageFitMode
  onChange: (mode: ImageFitMode) => void
}): React.JSX.Element {
  return (
    <div className="chip-row" role="group" aria-label="Fit mode">
      <button
        type="button"
        className={value === 'stretch' ? 'chip chip-active' : 'chip'}
        onClick={() => onChange('stretch')}
      >
        Stretch to fit
      </button>
      <button
        type="button"
        className={value === 'crop' ? 'chip chip-active' : 'chip'}
        onClick={() => onChange('crop')}
      >
        Crop to fill
      </button>
    </div>
  )
}
