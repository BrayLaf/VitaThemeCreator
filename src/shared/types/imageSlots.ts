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

// ---------------------------------------------------------------------------
// Lockscreen — 960×512 forced stretch, PNG, pngquant-compressed.
// Source ref: Theme.py:2529-2532
// ---------------------------------------------------------------------------
export type LockscreenImageSlot = ImageSourceRef

// ---------------------------------------------------------------------------
// Page background — one of 10 pages. Each has a 960×512 main image and a
// 360×192 thumbnail, both forced stretch. Source ref: Theme.py:2536-2643.
// ---------------------------------------------------------------------------
export interface PageBackgroundImageSlot {
  /** Full-size background, 960×512 forced. */
  main: ImageSourceRef
  /** Home-screen page-picker thumbnail, 360×192 forced. */
  thumbnail: ImageSourceRef
}

// ---------------------------------------------------------------------------
// Notification icons — "no notice" and "new notice" bubble icons. Scaled to
// max-height 110px with aspect preserved, then alpha-masked to the 120×110
// pill shape via mask_not.png (CopyOpacity compose) — see the
// `IMAGE_SPECS.notificationIcon` DECISION comment for why this isn't 40×37.
// Source ref: Theme.py:1063-1066, 1283-1291; written as notices.png/notice.png
// at Theme.py:2649-2650.
// ---------------------------------------------------------------------------
export interface NotificationIconImageSlot {
  noNotice: ImageSourceRef
  newNotice: ImageSourceRef
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
   * 120×110; `mask_not.png` (still only bundled at 40×37 — no 3× asset
   * exists) is upscaled at composite time in `convertNotificationIcon`.
   */
  notificationIcon: {
    /** Aspect-preserved scale bound (only height is constrained per §2). */
    maxHeight: 110,
    fit: 'aspect-preserved' as ResizeFit,
    /** The mask (mask_not.png, upscaled 3× from its bundled 40×37) is what actually clips the final shape. */
    maskDimensions: { width: 120, height: 110 } satisfies PixelDimensions
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
