/**
 * Image resize/compress/mask operations for theme image slots.
 *
 * Ports the behavior currently implemented by scale.bat (WIA `Scale` filter)
 * + ImageMagick `convert`/`composite` + pngquant, per
 * DOMAIN_LOGIC_ANALYSIS.md §2 and §7, using `sharp`: `.resize(w, h, { fit:
 * 'fill' })` for forced-stretch slots, `.resize({ height, fit: 'inside' })`
 * for the aspect-preserved notification-icon slot, and
 * `.composite([{ input: maskBuffer, blend: 'dest-in' }])` for the
 * CopyOpacity-style alpha masking. PNG compression (the pngquant
 * replacement) is `sharp`'s built-in `.png({ palette: true })`, which uses
 * the same libimagequant engine pngquant itself is built on.
 */
import sharp from 'sharp'
import { IMAGE_SPECS, type PackageThumbnailSources } from '@shared/types'
import { MASK_NOT_PATH } from '../resourcePaths'

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
 * 960×512 forced stretch, PNG, pngquant-compressed.
 * Report ref: §2 table row "Lockscreen"; Theme.py:2529-2532.
 */
export async function convertLockscreenImage(
  sourcePath: string,
  outputPath: string
): Promise<ImageOutputPath> {
  const { width, height } = IMAGE_SPECS.lockscreen.dimensions
  await writeForcedStretchPng(sourcePath, width, height, outputPath)
  return outputPath
}

/**
 * Produces both the 960×512 main background and the 360×192 thumbnail for
 * one page, both forced stretch, both pngquant-compressed. Takes two
 * independent source paths (the project's data model allows a separately
 * chosen thumbnail source, unlike the original tool which always derived
 * the thumbnail from the same source as the main background — callers that
 * want the original's behavior should pass the same path for both).
 * Report ref: §2 table row "Page background (×10)"; Theme.py:2536-2643.
 */
export async function convertPageBackground(
  sources: { main: string; thumbnail: string },
  pageIndex: number,
  outputPaths: { main: string; thumbnail: string }
): Promise<{ main: ImageOutputPath; thumbnail: ImageOutputPath }> {
  try {
    const main = IMAGE_SPECS.pageBackgroundMain.dimensions
    const thumb = IMAGE_SPECS.pageBackgroundThumbnail.dimensions
    await writeForcedStretchPng(sources.main, main.width, main.height, outputPaths.main)
    await writeForcedStretchPng(sources.thumbnail, thumb.width, thumb.height, outputPaths.thumbnail)
    return outputPaths
  } catch (error) {
    throw new Error(`failed converting page ${pageIndex} background: ${(error as Error).message}`)
  }
}

/**
 * Scales to max-height 37px (aspect preserved), centers onto a 40×37
 * transparent canvas, then alpha-masks against mask_not.png via CopyOpacity
 * compose, then pngquant-compresses.
 * Report ref: §2 table row "Notification icon"; Theme.py:1063-1066,
 * 1283-1291, 2649-2650.
 */
export async function convertNotificationIcon(
  sourcePath: string,
  _variant: 'noNotice' | 'newNotice',
  outputPath: string
): Promise<ImageOutputPath> {
  const { maxHeight, maskDimensions } = IMAGE_SPECS.notificationIcon
  const resized = await sharp(sourcePath)
    .resize({ height: maxHeight, fit: 'inside' })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: maskDimensions.width,
      height: maskDimensions.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: resized, gravity: 'center' },
      { input: MASK_NOT_PATH(), blend: 'dest-in' }
    ])
    .png({ palette: true })
    .toFile(outputPath)

  return outputPath
}

/**
 * Builds preview_thumbnail.png (226×128) — either an auto-generated 4-page
 * collage, a scaled custom image, or a captured live preview.
 * Report ref: §2 table row "Package thumbnail"; Theme.py:1615-1991,
 * `GenerateTHEME_image`, capture at Theme.py:1983-1986.
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
    const cellWidth = Math.round(width / 2)
    const cellHeight = Math.round(height / 2)
    const tiles = await Promise.all(
      sources.collagePageImagePaths.map((path) =>
        sharp(path).resize(cellWidth, cellHeight, { fit: 'fill' }).toBuffer()
      )
    )
    await sharp({
      create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
    })
      .composite([
        { input: tiles[0], left: 0, top: 0 },
        { input: tiles[1], left: width - cellWidth, top: 0 },
        { input: tiles[2], left: 0, top: height - cellHeight },
        { input: tiles[3], left: width - cellWidth, top: height - cellHeight }
      ])
      .resize(width, height, { fit: 'fill' })
      .png({ palette: true })
      .toFile(outputPath)
    return outputPath
  }

  throw new Error(
    'not implemented: generatePackageThumbnail(live-capture) — no in-app capture UI yet'
  )
}

/**
 * Builds preview_lockscreen.png / preview_page.png (480×272, forced
 * stretch) by downscaling an already-produced source image (the built
 * lockscreen.png, or page 1's background), or captures one from a mounted
 * Vita's screenshot folder.
 * Report ref: §2 table row "VitaShell live preview screenshots";
 * Theme.py:2293-2296, 1304-1311, 2017-2031.
 *
 * TODO: the mounted-device capture path needs a cross-platform volume
 * detection strategy (e.g. `drivelist`) to replace the original's
 * Windows-only drive-letter scan — see report §8 discard list.
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
