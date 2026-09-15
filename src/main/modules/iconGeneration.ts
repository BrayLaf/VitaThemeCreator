/**
 * System icon-set generation — port of Icon.py's per-icon pipeline.
 *
 * Report ref: §4. For each of the 17 fixed icon slots: force-scale the
 * chosen background to 128×128 (`sharp` `.resize(128, 128, { fit: 'fill' })`),
 * composite the pre-drawn glyph overlay on top with standard "over" alpha
 * blending (`sharp` `.composite([{ input: overlayBuffer }])`), then
 * pngquant-compress into `IconSet/<SetName>/icon_X.png`.
 */
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import {
  ICON_DIMENSIONS,
  ICON_SLOT_KEYS,
  type IconSetSelection,
  type IconSlotKey
} from '@shared/types'
import { iconOverlayPath, iconSwatchPath } from '../resourcePaths'

/**
 * Composites one icon: background (swatch/custom, force-scaled to 128×128)
 * + glyph overlay for the given style.
 * Report ref: §4, steps 3-5; Icon.py:1253-1390.
 *
 * The 'snapshot' background kind (live on-screen capture, Icon.py's
 * `ImageGrab.grab`) has no in-app capture UI yet — see report §8 discard
 * list — and throws.
 */
export async function compositeSystemIcon(
  slot: IconSlotKey,
  choice: IconSetSelection[IconSlotKey],
  outputPath: string
): Promise<string> {
  const { background, glyphStyle } = choice
  let backgroundSourcePath: string
  if (background.kind === 'swatch') {
    backgroundSourcePath = iconSwatchPath(background.name)
  } else if (background.kind === 'custom') {
    backgroundSourcePath = background.sourcePath
  } else {
    throw new Error(
      `not implemented: compositeSystemIcon(${slot}) with 'snapshot' background — no in-app capture UI yet`
    )
  }

  const backgroundResized = await sharp(backgroundSourcePath)
    .resize(ICON_DIMENSIONS.width, ICON_DIMENSIONS.height, { fit: 'fill' })
    .toBuffer()

  await sharp(backgroundResized)
    .composite([{ input: iconOverlayPath(glyphStyle, slot) }])
    .png({ palette: true })
    .toFile(outputPath)

  return outputPath
}

/**
 * Runs `compositeSystemIcon` for all 17 slots and writes them into
 * `IconSet/<SetName>/`. This folder is the data contract Theme.py's export
 * step consumes verbatim (§4) — any hand-made community icon sets that
 * follow the same 17-filename contract must continue to work.
 * Report ref: §4; Icon.py:1253-1390.
 */
export async function generateIconSet(
  setName: string,
  selection: IconSetSelection,
  outputDir: string
): Promise<string> {
  const setDir = join(outputDir, setName)
  await mkdir(setDir, { recursive: true })

  await Promise.all(
    ICON_SLOT_KEYS.map((slot) =>
      compositeSystemIcon(slot, selection[slot], join(setDir, `${slot}.png`))
    )
  )

  return setDir
}
