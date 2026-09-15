/**
 * System icon-set generation — port of Icon.py's per-icon pipeline.
 *
 * Report ref: §4. For each of the 17 fixed icon slots: force-scale the
 * chosen background to 128×128 (`sharp` `.resize(128, 128, { fit: 'fill' })`),
 * composite the pre-drawn glyph overlay on top with standard "over" alpha
 * blending (`sharp` `.composite([{ input: overlayBuffer }])`), then
 * pngquant-compress into `IconSet/<SetName>/icon_X.png`.
 *
 * STUB MODULE — no real compositing yet. All functions throw.
 */
import type { IconSetSelection, IconSlotKey } from '@shared/types'

/**
 * Composites one icon: background (swatch/custom/snapshot, force-scaled to
 * 128×128) + glyph overlay for the given style.
 * Report ref: §4, steps 3-5; Icon.py:1253-1390.
 */
export function compositeSystemIcon(
  _slot: IconSlotKey,
  _choice: IconSetSelection[IconSlotKey],
  _outputPath: string
): Promise<string> {
  throw new Error('not implemented: compositeSystemIcon')
}

/**
 * Runs `compositeSystemIcon` for all 17 slots and writes them into
 * `IconSet/<SetName>/`. This folder is the data contract Theme.py's export
 * step consumes verbatim (§4) — any hand-made community icon sets that
 * follow the same 17-filename contract must continue to work.
 * Report ref: §4; Icon.py:1253-1390.
 */
export function generateIconSet(
  _setName: string,
  _selection: IconSetSelection,
  _outputDir: string
): Promise<string> {
  throw new Error('not implemented: generateIconSet')
}
