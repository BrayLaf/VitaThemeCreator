/**
 * One type + processing spec per image slot identified in
 * DOMAIN_LOGIC_ANALYSIS.md §2 (image spec table) and §6 (packaging structure).
 *
 * These types hold only the *editable project state* for each slot (which
 * source file the user picked, plus any slot-specific interactive state).
 * The fixed output dimensions/fit behavior live in `IMAGE_SPECS` below as a
 * single source of truth the main-process conversion stubs (step 3) and any
 * UI validation (step 4) both read from.
 */
import type { PixelDimensions, ResizeFit, Tuple10 } from './common'

/** A slot backed by exactly one user-selected source image on disk. */
export interface ImageSourceRef {
  /** Absolute path to the user-selected source image. Null until chosen. */
  sourcePath: string | null
}

/** Cover-fit zoom + focal point for positioning a source image within a fixed target frame. */
export interface ImageCrop {
  /** >=1. 1 = the smallest scale that fully covers the frame with no extra zoom. */
  zoom: number
  /** 0-1 fractional focal point within the scaled image that aligns to the frame's center. 0.5/0.5 = centered. */
  focusX: number
  focusY: number
}

export const DEFAULT_IMAGE_CROP: ImageCrop = {
  zoom: 1,
  focusX: 0.5,
  focusY: 0.5
}

export type ImageFitMode = 'stretch' | 'crop'

/**
 * A slot whose source image can either be force-stretched (distorted to
 * exactly fill the target frame — the original tool's only behavior for
 * these slots, and still the default here: see the `ResizeFit` DECISION
 * note, common.ts) or cover-cropped via a user-adjustable zoom + focal point
 * (`ImageCrop`, the same mechanism `NotificationIconImageSlot` uses). This
 * is purely an authoring convenience this app adds on top of the original —
 * either mode still ends in a plain force-resize to the exact target
 * dimensions (`writeForcedStretchPng`/`writeCoverFitCrop`,
 * imageConversion.ts), so the on-disk/on-device result is exactly the shape
 * Theme.py always produced; `fitMode` only changes what gets fed into that
 * final resize.
 */
export interface CroppableImageSlot {
  sourcePath: string | null
  fitMode: ImageFitMode
  crop: ImageCrop
}

// ---------------------------------------------------------------------------
// Lockscreen — 960×512, force-stretch by default. Source ref: Theme.py:2529-2532.
// ---------------------------------------------------------------------------
export type LockscreenImageSlot = CroppableImageSlot

// ---------------------------------------------------------------------------
// Page background — one of 10 pages. Each has a 960×512 main image and a
// 360×192 thumbnail, both force-stretch by default. Source ref: Theme.py:2536-2643.
// ---------------------------------------------------------------------------
export interface PageBackgroundImageSlot {
  /** Full-size background, 960×512. */
  main: CroppableImageSlot
  /** Home-screen page-picker thumbnail, 360×192. */
  thumbnail: CroppableImageSlot
}

// ---------------------------------------------------------------------------
// Notification icons — "no notice" and "new notice" bubble icons.
//
// DECISION (2026-09-15): corrected against a real ThemeBUILDER-exported
// theme's shipped notices.png/notice.png (both 120×110, no alpha channel —
// confirmed with `sips`) plus the bundled default assets, which are
// identically shaped: this is NOT an alpha-masked pill. The final shipped
// file is a flat, fully opaque 120×110 image; mask_not.png (itself alpha-free
// per `sips`) never clips it — Theme.py:2649-2650 (the actual export step for
// a customized icon) just pngquant-compresses whatever `NOTI_inon`/`NOTI_inew`
// already resolved to, no masking call at all. The `-alpha off -compose
// CopyOpacity` calls at Theme.py:1283-1291 are the tool's own separate
// 40×37 in-app preview-widget pipeline (see the `IMAGE_SPECS.notificationIcon`
// note below), not the shipped-asset path.
//
// The actual on-device clipping happens live in the Vita firmware's info-bar
// badge, which only reveals a roughly circular region toward the *upper
// right* of the 120×110 frame — confirmed by rendering ThemeBUILDER's own
// position-guide asset (`assets/preview/default/LAnotemsk.png`, bundled here
// as `masks/notificationGuide.png`) that its own notification-icon editor
// (`NOTIFICATION_EDIT`, Theme.py:843-1295) overlays while the user manually
// pans/zooms their icon with UP/DOWN/LEFT/RIGHT + zoom buttons. `crop`
// (`ImageCrop`, defined above — shared with the opt-in crop mode on
// `CroppableImageSlot`) is this app's equivalent: a cover-fit zoom + focal
// point the renderer's notification-icon cropper writes to and
// `convertNotificationIcon` reads at export time, with the same guide asset
// shown live as an overlay. Unlike `CroppableImageSlot`, there's no
// "stretch" mode here — a 120×110 pill has no forced-stretch precedent to
// preserve, so cropping is always on.
// ---------------------------------------------------------------------------

export interface NotificationIconImageSlot {
  noNotice: ImageSourceRef & { crop: ImageCrop }
  newNotice: ImageSourceRef & { crop: ImageCrop }
}

// ---------------------------------------------------------------------------
// System icons (17 fixed slots) — produced entirely by the icon-generation
// pipeline (see icons.ts), not resized/re-masked again at theme export time.
// Theme.py just copies icon_*.png verbatim (Theme.py:2660-2665). Modeled in
// icons.ts as `IconSetSelection`, not here.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Package thumbnail (preview_thumbnail.png) — 226×128, the theme-store icon.
// Three possible generation modes per Theme.py:1615-1991 / 1983-1986.
// ---------------------------------------------------------------------------
export type PackageThumbnailMode = 'auto-collage' | 'custom-image' | 'live-capture'

export interface PackageThumbnailSlot {
  mode: PackageThumbnailMode
  /** Only meaningful when mode === 'custom-image'. */
  customImage: ImageSourceRef | null
}

/**
 * Source data `generatePackageThumbnail` needs to actually build the image,
 * shaped by `mode`. Split out from `PackageThumbnailSlot` (project state)
 * since the auto-collage mode needs already-converted page background
 * output paths, not raw project state.
 */
export interface PackageThumbnailSources {
  /**
   * Required when mode === 'auto-collage': 4 built page background images,
   * arranged top-left/top-right/bottom-left/bottom-right. `null` for a page
   * with no background set — rendered as a neutral placeholder tile rather
   * than failing the export.
   */
  collagePageImagePaths?: [string | null, string | null, string | null, string | null]
  /**
   * Used when mode === 'auto-collage': the theme name, rendered centered in
   * a reserved black caption band under the collage — confirmed against a
   * real ThemeBUILDER-exported preview_thumbnail.png (Theme.py's
   * `GenerateTHEME_image`, report §2 "Package thumbnail" row).
   */
  themeName?: string
  /** Required when mode === 'custom-image'. */
  customImagePath?: string
}

// ---------------------------------------------------------------------------
// VitaShell live-preview screenshots — preview_lockscreen.png, preview_page.png.
// 480×272 forced stretch, or captured directly from a mounted Vita's
// picture/screenshot folder ("Extra Tools" flow). Source ref: Theme.py:2293-2296,
// Theme.py:1304-1311, Theme.py:2017-2031.
//
// TODO(report §8 discard list): the Windows drive-letter scanning used to find
// a mounted Vita is Windows-only and needs a from-scratch cross-platform
// design (e.g. `drivelist`) — not something to port line-for-line. This type
// only models the resulting state, not the detection mechanism.
// ---------------------------------------------------------------------------
export type PreviewScreenshotSource = 'generated' | 'captured-from-device'

export interface PreviewScreenshotSlot {
  source: PreviewScreenshotSource
}

// ---------------------------------------------------------------------------
// Static, non-editable assets copied verbatim into every theme package.
// basePage.png / curPage.png, 22×22, from assets/preview/default/{base,curs}.png.
// Source ref: §6 packaging table. No user-facing slot — listed for completeness
// of the export contract (see export.ts).
// ---------------------------------------------------------------------------

/** All ten page background slots, in page order (index 0 = page 1). */
export type PageBackgroundSlots = Tuple10<PageBackgroundImageSlot>

/**
 * Fixed output dimensions + resize behavior per slot, exactly as observed in
 * the original tool (§2). This is the contract the step-3 conversion stubs
 * and any renderer-side preview/validation logic must agree on.
 */
export const IMAGE_SPECS = {
  lockscreen: {
    dimensions: { width: 960, height: 512 } satisfies PixelDimensions,
    fit: 'forced-stretch' as ResizeFit
  },
  pageBackgroundMain: {
    dimensions: { width: 960, height: 512 } satisfies PixelDimensions,
    fit: 'forced-stretch' as ResizeFit
  },
  pageBackgroundThumbnail: {
    dimensions: { width: 360, height: 192 } satisfies PixelDimensions,
    fit: 'forced-stretch' as ResizeFit
  },
  /**
   * DECISION (2026-09-15): the domain report's §2 citation (`Theme.py:1283
   * -1291`, max-height 37 -> `mask_not.png` at its native 40×37) is the
   * tool's own small in-app preview-widget pipeline, not the size it ships
   * in a built theme. `Theme.py:1063` (the *custom-icon-picker* path, taken
   * when a user actually sets a notification icon) scales to `-max-height
   * 120` alongside a paired `V1=110` constant — and a real third-party PS
   * Vita theme validator flags this app's 40×37 output as wrong, expecting
   * 120×110. 40×37 × 3 ≈ 120×110 almost exactly, so 40×37 is that preview
   * widget's own size, scaled down 3× from the real shipped asset. Fixed to
   * 120×110. See `NotificationIconImageSlot`'s DECISION note above for why
   * `mask_not.png` does NOT clip this shape — the frame is a flat opaque
   * rectangle, cropped by `ImageCrop`, not alpha-masked.
   */
  notificationIcon: {
    /** The on-disk frame — always exactly this size, fully opaque, no letterboxing. */
    dimensions: { width: 120, height: 110 } satisfies PixelDimensions,
    fit: 'cover-with-pan' as ResizeFit
  },
  systemIcon: {
    dimensions: { width: 128, height: 128 } satisfies PixelDimensions,
    fit: 'forced-stretch' as ResizeFit
  },
  packageThumbnail: {
    dimensions: { width: 226, height: 128 } satisfies PixelDimensions
  },
  previewScreenshot: {
    dimensions: { width: 480, height: 272 } satisfies PixelDimensions,
    fit: 'forced-stretch' as ResizeFit
  },
  staticAsset: {
    dimensions: { width: 22, height: 22 } satisfies PixelDimensions
  }
} as const
