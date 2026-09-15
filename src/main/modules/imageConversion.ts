/**
 * Image resize/compress operations for theme image slots.
 *
 * Ports the behavior currently implemented by scale.bat (WIA `Scale` filter)
 * + ImageMagick `convert`/`composite` + pngquant, per
 * DOMAIN_LOGIC_ANALYSIS.md §2 and §7, using `sharp`: `.resize(w, h, { fit:
 * 'fill' })` for forced-stretch slots (distorts to exactly fill the frame,
 * never cropped — the live preview's `.preview-bg-image` CSS must use
 * `object-fit: fill` to match, not `cover`), and a cover-fit `.resize` +
 * `.extract` crop for the notification-icon slot (see the
 * `NotificationIconImageSlot` DECISION note, shared/types/imageSlots.ts).
 * PNG compression (the pngquant replacement) is `sharp`'s built-in `.png({
 * palette: true })`, which uses the same libimagequant engine pngquant
 * itself is built on.
 */
import sharp, { type OverlayOptions } from 'sharp'
import {
  IMAGE_SPECS,
  type ClockPosition,
  type ClockSettings,
  type ImageCrop,
  type InfoBarColorSettings,
  type PackageThumbnailSources
} from '@shared/types'
import { LOCKSCREEN_PREVIEW_OVERLAY_PATH } from '../resourcePaths'

/** Absolute path to a produced PNG file. */
export type ImageOutputPath = string

async function writeForcedStretchPng(
  sourcePath: string,
  width: number,
  height: number,
  outputPath: string
): Promise<void> {
  await sharp(sourcePath)
    .resize(width, height, { fit: 'fill' })
    .png({ palette: true })
    .toFile(outputPath)
}

/**
 * Cover-fits the source image onto a fixed `width`×`height` frame, cropped
 * by a user-adjustable zoom + focal point (`crop`) — the shared math behind
 * both `CroppableImageSlot`'s opt-in "crop" fit mode and the
 * notification-icon slot's always-on cropping (see both types' DECISION
 * notes, shared/types/imageSlots.ts). `flatten`, when given, drops the
 * alpha channel onto that background color instead of preserving it —
 * the notification-icon slot's shipped format never has one.
 */
async function writeCoverFitCropPng(
  sourcePath: string,
  width: number,
  height: number,
  crop: ImageCrop,
  outputPath: string,
  flatten?: { r: number; g: number; b: number }
): Promise<void> {
  const { width: srcWidth, height: srcHeight } = await sharp(sourcePath).metadata()
  if (!srcWidth || !srcHeight) {
    throw new Error(`writeCoverFitCropPng: could not read dimensions of ${sourcePath}`)
  }

  const zoom = Math.max(1, crop.zoom)
  const coverScale = Math.max(width / srcWidth, height / srcHeight) * zoom
  const scaledWidth = Math.max(width, Math.round(srcWidth * coverScale))
  const scaledHeight = Math.max(height, Math.round(srcHeight * coverScale))

  const focusX = Math.min(1, Math.max(0, crop.focusX))
  const focusY = Math.min(1, Math.max(0, crop.focusY))
  const left = Math.min(
    scaledWidth - width,
    Math.max(0, Math.round(focusX * scaledWidth - width / 2))
  )
  const top = Math.min(
    scaledHeight - height,
    Math.max(0, Math.round(focusY * scaledHeight - height / 2))
  )

  let pipeline = sharp(sourcePath)
    .resize(scaledWidth, scaledHeight, { fit: 'fill' })
    .extract({ left, top, width, height })
  if (flatten) pipeline = pipeline.flatten({ background: flatten })
  await pipeline.png({ palette: true }).toFile(outputPath)
}

/**
 * 960×512, PNG, pngquant-compressed — forced-stretch by default, or
 * cover-fit cropped by a user-adjustable zoom + focal point when `crop` is
 * given (`CroppableImageSlot.fitMode === 'crop'`; a pure authoring
 * convenience this app adds — either path ends in a plain resize to
 * 960×512, so the on-device result is always Theme.py's own shape).
 * Report ref: §2 table row "Lockscreen"; Theme.py:2529-2532.
 */
export async function convertLockscreenImage(
  sourcePath: string,
  crop: ImageCrop | null,
  outputPath: string
): Promise<ImageOutputPath> {
  const { width, height } = IMAGE_SPECS.lockscreen.dimensions
  if (crop) {
    await writeCoverFitCropPng(sourcePath, width, height, crop, outputPath)
  } else {
    await writeForcedStretchPng(sourcePath, width, height, outputPath)
  }
  return outputPath
}

/**
 * Produces both the 960×512 main background and the 360×192 thumbnail for
 * one page, each independently forced-stretch or cover-fit cropped (see
 * `convertLockscreenImage`'s doc comment), both pngquant-compressed. Takes
 * two independent source paths (the project's data model allows a
 * separately chosen thumbnail source, unlike the original tool which always
 * derived the thumbnail from the same source as the main background —
 * callers that want the original's behavior should pass the same path for
 * both).
 * Report ref: §2 table row "Page background (×10)"; Theme.py:2536-2643.
 */
export async function convertPageBackground(
  sources: { main: string; thumbnail: string },
  crops: { main: ImageCrop | null; thumbnail: ImageCrop | null },
  pageIndex: number,
  outputPaths: { main: string; thumbnail: string }
): Promise<{ main: ImageOutputPath; thumbnail: ImageOutputPath }> {
  try {
    const main = IMAGE_SPECS.pageBackgroundMain.dimensions
    const thumb = IMAGE_SPECS.pageBackgroundThumbnail.dimensions
    if (crops.main) {
      await writeCoverFitCropPng(
        sources.main,
        main.width,
        main.height,
        crops.main,
        outputPaths.main
      )
    } else {
      await writeForcedStretchPng(sources.main, main.width, main.height, outputPaths.main)
    }
    if (crops.thumbnail) {
      await writeCoverFitCropPng(
        sources.thumbnail,
        thumb.width,
        thumb.height,
        crops.thumbnail,
        outputPaths.thumbnail
      )
    } else {
      await writeForcedStretchPng(
        sources.thumbnail,
        thumb.width,
        thumb.height,
        outputPaths.thumbnail
      )
    }
    return outputPaths
  } catch (error) {
    throw new Error(`failed converting page ${pageIndex} background: ${(error as Error).message}`)
  }
}

/**
 * Cover-fits the source image onto the flat, opaque 120×110 notification-
 * icon frame, cropped by a user-adjustable zoom + focal point (`crop`), then
 * flattens (no alpha channel — see the `NotificationIconImageSlot` DECISION
 * note, imageSlots.ts, for why this isn't an alpha-masked pill: a real
 * exported theme's shipped notices.png/notice.png are both flat 120×110
 * PNGs with no alpha channel, and the on-device circular reveal happens live
 * in the Vita firmware, not in this file's pixels) and pngquant-compresses.
 * Report ref: §2 table row "Notification icon"; Theme.py:1063-1066, 2649-2650.
 */
export async function convertNotificationIcon(
  sourcePath: string,
  crop: ImageCrop,
  outputPath: string
): Promise<ImageOutputPath> {
  const { width, height } = IMAGE_SPECS.notificationIcon.dimensions
  await writeCoverFitCropPng(sourcePath, width, height, crop, outputPath, { r: 0, g: 0, b: 0 })
  return outputPath
}

/**
 * Escapes text for safe embedding in an SVG `<text>` node.
 */
function escapeSvgText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Font size for the auto-collage caption, shrinking for longer theme names.
 * Mirrors the original's own intent (Theme.py:1652-1658 buckets font size
 * down as the name gets longer so it still fits the 226px-wide canvas) as a
 * continuous approximation rather than replicating its exact bucket table.
 */
function captionFontSize(text: string, captionHeight: number): number {
  const base = Math.round(captionHeight * 0.62)
  if (text.length <= 9) return base
  const shrink = Math.max(0.4, 9 / text.length)
  return Math.max(Math.round(captionHeight * 0.28), Math.round(base * shrink))
}

/**
 * Builds preview_thumbnail.png (226×128) — either an auto-generated 4-page
 * collage, a scaled custom image, or a captured live preview.
 * Report ref: §2 table row "Package thumbnail"; Theme.py:1615-1991,
 * `GenerateTHEME_image`, capture at Theme.py:1983-1986.
 *
 * The auto-collage's caption band (theme name, centered, on solid black
 * beneath the 4-tile grid) is confirmed against a real ThemeBUILDER-exported
 * preview_thumbnail.png — the collage fills roughly the top 76% of the
 * canvas, leaving a reserved band for the title rather than covering the
 * full 226×128.
 */
export async function generatePackageThumbnail(
  mode: 'auto-collage' | 'custom-image' | 'live-capture',
  sources: PackageThumbnailSources,
  outputPath: string
): Promise<ImageOutputPath> {
  const { width, height } = IMAGE_SPECS.packageThumbnail.dimensions

  if (mode === 'custom-image') {
    if (!sources.customImagePath) {
      throw new Error('generatePackageThumbnail: custom-image mode requires customImagePath')
    }
    await writeForcedStretchPng(sources.customImagePath, width, height, outputPath)
    return outputPath
  }

  if (mode === 'auto-collage') {
    if (!sources.collagePageImagePaths || sources.collagePageImagePaths.length !== 4) {
      throw new Error(
        'generatePackageThumbnail: auto-collage mode requires exactly 4 collagePageImagePaths'
      )
    }
    const collageHeight = Math.round(height * 0.76)
    const captionHeight = height - collageHeight
    const cellWidth = Math.round(width / 2)
    const cellHeight = Math.round(collageHeight / 2)
    // A page with no background set renders as a flat placeholder tile
    // (matching the editor's own `.preview-bg-placeholder` neutral tone)
    // instead of requiring 4 real page images before export can proceed.
    const tiles = await Promise.all(
      sources.collagePageImagePaths.map((path) =>
        path
          ? sharp(path).resize(cellWidth, cellHeight, { fit: 'fill' }).toBuffer()
          : sharp({
              create: { width: cellWidth, height: cellHeight, channels: 4, background: '#20242c' }
            })
              .png()
              .toBuffer()
      )
    )

    const composites: OverlayOptions[] = [
      { input: tiles[0], left: 0, top: 0 },
      { input: tiles[1], left: width - cellWidth, top: 0 },
      { input: tiles[2], left: 0, top: collageHeight - cellHeight },
      { input: tiles[3], left: width - cellWidth, top: collageHeight - cellHeight }
    ]

    const themeName = sources.themeName?.trim()
    if (themeName) {
      const fontSize = captionFontSize(themeName, captionHeight)
      const captionSvg = Buffer.from(
        `<svg width="${width}" height="${captionHeight}" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
            font-family="Helvetica, Arial, sans-serif" font-weight="700"
            font-size="${fontSize}" fill="#ffffff">${escapeSvgText(themeName)}</text>
        </svg>`
      )
      composites.push({ input: captionSvg, left: 0, top: collageHeight })
    }

    await sharp({
      create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
    })
      .composite(composites)
      .png({ palette: true })
      .toFile(outputPath)
    return outputPath
  }

  throw new Error(
    'not implemented: generatePackageThumbnail(live-capture) — no in-app capture UI yet'
  )
}

/**
 * Builds preview_page.png (480×272, forced stretch) by downscaling page 1's
 * already-built background, or captures one from a mounted Vita's
 * screenshot folder. (`preview_lockscreen.png` is NOT built this way — see
 * `generateLockscreenPreviewScreenshot` below, which bakes in the demo
 * clock text and page-lip overlay the way the original tool's own
 * screen-grab-based export actually does.)
 * Report ref: §2 table row "VitaShell live preview screenshots";
 * Theme.py:2293-2296, 1304-1311, 2017-2031.
 *
 * TODO: the mounted-device capture path needs a cross-platform volume
 * detection strategy (e.g. `drivelist`) to replace the original's
 * Windows-only drive-letter scan — see report §8 discard list. TODO:
 * preview_page.png similarly doesn't yet bake in the icons/labels/status
 * bar the original's own screen-grab includes — a plain background resize
 * for now.
 */
export async function generatePreviewScreenshot(
  source: 'generated' | 'captured-from-device',
  sourceImagePath: string | null,
  outputPath: string
): Promise<ImageOutputPath> {
  if (source === 'captured-from-device') {
    throw new Error(
      'not implemented: generatePreviewScreenshot(captured-from-device) — no mounted-Vita detection yet'
    )
  }
  if (!sourceImagePath) {
    throw new Error('generatePreviewScreenshot: generated mode requires sourceImagePath')
  }
  const { width, height } = IMAGE_SPECS.previewScreenshot.dimensions
  await writeForcedStretchPng(sourceImagePath, width, height, outputPath)
  return outputPath
}

/** Escapes text for safe embedding in an SVG `<text>` node. */
function escapeSvg(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * The demo date/time `preview_lockscreen.png` shows — a static build-time
 * image, not a live clock, so the original tool always draws the same fixed
 * "January 1 (Monday)" / "12:00" placeholder regardless of the real date
 * (Theme.py:2158-2164). See LockscreenPreview.tsx's doc comment for the
 * live-preview version of this same date-format grounding.
 */
const PREVIEW_DEMO_DATE = 'January 1 (Monday)'
const PREVIEW_DEMO_TIME = '12:00'

/**
 * Clock text placement for the baked preview, as fractions of the canvas
 * width (matching the live preview's CSS `cqw` units — see
 * `LockscreenPreview.tsx`'s `clockAlignStyle`) rather than a fresh
 * re-derivation of Theme.py's own ambiguous PySimpleGUI draw coordinates
 * (report's own caveat on `draw_*` anchor semantics). Keeping this in sync
 * with the live editor preview matters more here than independently
 * chasing pixel-exact parity with the original — DECISION (2026-09-14).
 */
function clockPreviewLayout(
  position: ClockPosition,
  width: number
): { x: number; anchor: 'start' | 'end'; blockTop: number | null; blockBottom: number | null } {
  const left = width * 0.035
  const right = width * (1 - 0.035)
  if (position === 1) return { x: left, anchor: 'start', blockTop: width * 0.07, blockBottom: null }
  if (position === 2) {
    return { x: right, anchor: 'end', blockTop: null, blockBottom: width * 0.058 }
  }
  return { x: left, anchor: 'start', blockTop: null, blockBottom: width * 0.058 }
}

function buildClockSvg(
  width: number,
  height: number,
  position: ClockPosition,
  color: string
): Buffer {
  const dateFontSize = width * 0.0135
  const timeFontSize = width * 0.056
  const gap = width * 0.002
  const blockHeight = dateFontSize + gap + timeFontSize
  const { x, anchor, blockTop, blockBottom } = clockPreviewLayout(position, width)
  const top = blockTop ?? height - (blockBottom as number) - blockHeight
  const dateCenterY = top + dateFontSize / 2
  const timeCenterY = top + dateFontSize + gap + timeFontSize / 2

  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${x}" y="${dateCenterY}" text-anchor="${anchor}" dominant-baseline="central"
        font-family="Helvetica, Arial, sans-serif" font-size="${dateFontSize}" fill="#${color}"
        opacity="0.85">${escapeSvg(PREVIEW_DEMO_DATE)}</text>
      <text x="${x}" y="${timeCenterY}" text-anchor="${anchor}" dominant-baseline="central"
        font-family="Helvetica, Arial, sans-serif" font-weight="650" font-size="${timeFontSize}"
        fill="#${color}">${escapeSvg(PREVIEW_DEMO_TIME)}</text>
    </svg>`
  )
}

function buildStatusBarSvg(width: number, statusBarHeight: number, color: string): Buffer {
  const fontSize = statusBarHeight * 0.6
  return Buffer.from(
    `<svg width="${width}" height="${statusBarHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width - width * 0.02}" y="${statusBarHeight / 2}" text-anchor="end"
        dominant-baseline="central" font-family="Helvetica, Arial, sans-serif"
        font-size="${fontSize}" fill="#${color}">${escapeSvg(PREVIEW_DEMO_TIME)}</text>
    </svg>`
  )
}

/**
 * Builds `preview_lockscreen.png` (480×272) the way the original tool
 * actually produces it: not a plain resize of the lockscreen background, but
 * a screen-grab of its own live-preview widget (Theme.py:2247) — background
 * + demo clock text + a status-bar band + the preview-only page-lip/bezel
 * overlay (`Image_LS_Overlay`, Theme.py:2167; see
 * `LOCKSCREEN_PREVIEW_OVERLAY_PATH`) all baked in together. The status bar
 * occupies the top 12/220 of the legacy tool's own 390×220 preview canvas
 * (Theme.py:2148-2167) — reproduced here as the top 12/220 of this image's
 * height.
 * Report ref: §2 table row "VitaShell live preview screenshots";
 * Theme.py:2148-2167, 2247, 2293.
 */
export async function generateLockscreenPreviewScreenshot(
  lockscreenImagePath: string,
  clock: ClockSettings,
  infoBarColors: InfoBarColorSettings,
  outputPath: string
): Promise<ImageOutputPath> {
  const { width, height } = IMAGE_SPECS.previewScreenshot.dimensions
  const statusBarHeight = Math.round(height * (12 / 220))
  const backgroundHeight = height - statusBarHeight

  const background = await sharp(lockscreenImagePath)
    .resize(width, backgroundHeight, { fit: 'fill' })
    .toBuffer()

  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
  })
    .composite([
      { input: background, left: 0, top: statusBarHeight },
      {
        input: {
          create: {
            width,
            height: statusBarHeight,
            channels: 4,
            background: `#${infoBarColors.barColor}`
          }
        },
        left: 0,
        top: 0
      },
      { input: buildClockSvg(width, height, clock.position, clock.color), left: 0, top: 0 },
      {
        input: buildStatusBarSvg(width, statusBarHeight, infoBarColors.indicatorColor),
        left: 0,
        top: 0
      },
      {
        input: await sharp(LOCKSCREEN_PREVIEW_OVERLAY_PATH())
          .resize(width, height, { fit: 'fill' })
          .toBuffer(),
        left: 0,
        top: 0
      }
    ])
    .png({ palette: true })
    .toFile(outputPath)

  return outputPath
}
