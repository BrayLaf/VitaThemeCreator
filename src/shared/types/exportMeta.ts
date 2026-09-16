/**
 * Packaging/export structure. Grounded in DOMAIN_LOGIC_ANALYSIS.md §6.
 */

/**
 * The exact flat file list a built theme folder contains before zipping
 * (§6). `theme.ini` is app-only project state and is excluded from the zip
 * (`-x!theme.ini`, Theme.py:1379) — modeled here for completeness of the
 * build-folder contract, not as something that ships.
 */
export interface ThemeBuildOutputManifest {
  themeXml: 'theme.xml'
  themeIni: 'theme.ini'
  lockscreen: 'lockscreen.png'
  pageBackgrounds: string[] // bg1.png … bg10.png
  pageThumbnails: string[] // bg1t.png … bg10t.png
  notificationIcons: ['notice.png', 'notices.png']
  /** Page-indicator dots — user-customizable (`PageIndicatorImageSlot`, imageSlots.ts), despite the name: kept as `staticAssets` since the original tool always copied these verbatim and the output filenames/shape never change. */
  staticAssets: ['basePage.png', 'curPage.png']
  systemIcons: string[] // icon_*.png × 17
  audio: 'bgm.at9'
  previews: ['preview_lockscreen.png', 'preview_page.png', 'preview_thumbnail.png']
}

/**
 * DECISION (2026-09-14, report §Open Questions #4 — case sensitivity): the
 * original tool inconsistently reads uppercase (`BG1.png`) on load and
 * writes lowercase (`bg1.png`) on build, which only "works" on Windows'
 * case-insensitive filesystem. Since Electron dev targets (macOS/Linux) are
 * case-sensitive, the rewrite standardizes on **all-lowercase** filenames
 * everywhere (matching what Theme.py actually writes on build, and what
 * theme.xml's own `<m_imageFilePath>`-style values reference) — the write
 * path is authoritative since that's what real exported themes contain.
 * `buildThemeFolder()`/`packageTheme()` must not reproduce the original's
 * load-path uppercase assumption.
 */
export const BUILD_OUTPUT_FILENAME_CASING = 'lowercase' as const

export interface ExportResult {
  /** Path to the built (unzipped) theme folder, `Created Themes/<ThemeName>/`. */
  buildFolderPath: string
  /**
   * Path to the packaged zip, `Exported/<ThemeName>.zip`. A plain zip, not a
   * real 7z archive and not a Vita-specific container — see §6.
   */
  zipPath: string
}

export interface ExportMetadata {
  themeName: string
  version: string
  creator: string
  /** ISO 8601 timestamp of when the export was produced. */
  exportedAt: string
}
