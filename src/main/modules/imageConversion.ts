/**
 * Image resize/compress/mask operations for theme image slots.
 *
 * Ports the behavior currently implemented by scale.bat (WIA `Scale` filter)
 * + ImageMagick `convert`/`composite` + pngquant, per
 * DOMAIN_LOGIC_ANALYSIS.md §2 and §7. Intended implementation library:
 * `sharp` — `.resize(w, h, { fit: 'fill' })` for forced-stretch slots,
 * `.resize(undefined, h, { fit: 'inside' })` for aspect-preserved slots, and
 * `.composite([{ input: maskBuffer, blend: 'dest-in' }])` for the
 * CopyOpacity-style alpha masking. PNG compression (pngquant replacement)
 * should be applied as a final pass, likely via `sharp`'s palette/quality
 * PNG options or `pngquant-bin`.
 *
 * STUB MODULE — no real image processing yet. All functions throw.
 */

/** Absolute path to a produced PNG file. */
export type ImageOutputPath = string

/**
 * 960×512 forced stretch, PNG, pngquant-compressed.
 * Report ref: §2 table row "Lockscreen"; Theme.py:2529-2532.
 */
export function convertLockscreenImage(
  _sourcePath: string,
  _outputPath: string
): Promise<ImageOutputPath> {
  throw new Error('not implemented: convertLockscreenImage')
}

/**
 * Produces both the 960×512 main background and the 360×192 thumbnail for
 * one page, both forced stretch, both pngquant-compressed.
 * Report ref: §2 table row "Page background (×10)"; Theme.py:2536-2643.
 */
export function convertPageBackground(
  _sourcePath: string,
  _pageIndex: number,
  _outputPaths: { main: string; thumbnail: string }
): Promise<{ main: ImageOutputPath; thumbnail: ImageOutputPath }> {
  throw new Error('not implemented: convertPageBackground')
}

/**
 * Scales to max-height 37px (aspect preserved), then alpha-masks against
 * mask_not.png (40×37) via CopyOpacity compose, then pngquant-compresses.
 * Report ref: §2 table row "Notification icon"; Theme.py:1063-1066,
 * 1283-1291, 2649-2650.
 */
export function convertNotificationIcon(
  _sourcePath: string,
  _variant: 'noNotice' | 'newNotice',
  _outputPath: string
): Promise<ImageOutputPath> {
  throw new Error('not implemented: convertNotificationIcon')
}

/**
 * Builds preview_thumbnail.png (226×128) — either an auto-generated 4-page
 * collage, a scaled custom image, or a captured live preview.
 * Report ref: §2 table row "Package thumbnail"; Theme.py:1615-1991,
 * `GenerateTHEME_image`, capture at Theme.py:1983-1986.
 */
export function generatePackageThumbnail(
  _mode: 'auto-collage' | 'custom-image' | 'live-capture',
  _outputPath: string
): Promise<ImageOutputPath> {
  throw new Error('not implemented: generatePackageThumbnail')
}

/**
 * Builds preview_lockscreen.png / preview_page.png (480×272, forced
 * stretch), either scaled from in-app assets or captured from a mounted
 * Vita's screenshot folder.
 * Report ref: §2 table row "VitaShell live preview screenshots";
 * Theme.py:2293-2296, 1304-1311, 2017-2031.
 *
 * TODO: the mounted-device capture path needs a cross-platform volume
 * detection strategy (e.g. `drivelist`) to replace the original's
 * Windows-only drive-letter scan — see report §8 discard list.
 */
export function generatePreviewScreenshot(
  _source: 'generated' | 'captured-from-device',
  _outputPath: string
): Promise<ImageOutputPath> {
  throw new Error('not implemented: generatePreviewScreenshot')
}
