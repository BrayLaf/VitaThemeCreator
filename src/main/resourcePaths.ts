/**
 * Resolves paths into the bundled `resources/themebuilder-assets/` tree —
 * the icon glyph/background art, masks, static page assets, default audio
 * track, and the bundled `at9tool.exe` ported over from the legacy
 * ThemeBUILDER repo's `assets/` folder (see DOMAIN_LOGIC_ANALYSIS.md §1, §4).
 *
 * In dev, `app.getAppPath()` resolves to the project root, so these sit at
 * `<project>/resources/themebuilder-assets/...`. In a packaged build they're
 * copied out via electron-builder's `extraResources` (electron-builder.yml)
 * to `process.resourcesPath/themebuilder-assets/...` instead — they must
 * live outside the asar archive since `at9tool.exe` is spawned as a real
 * subprocess and asar-packed binaries can't be executed directly.
 */
import { app } from 'electron'
import { join } from 'path'

function assetsRoot(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'themebuilder-assets')
    : join(app.getAppPath(), 'resources', 'themebuilder-assets')
}

export function themebuilderAssetPath(...segments: string[]): string {
  return join(assetsRoot(), ...segments)
}

export const MASK_NOT_PATH = (): string => themebuilderAssetPath('masks', 'mask_not.png')
export const BASE_PAGE_ASSET_PATH = (): string => themebuilderAssetPath('static', 'basePage.png')
export const CUR_PAGE_ASSET_PATH = (): string => themebuilderAssetPath('static', 'curPage.png')
/** The preview-only page-lip/bezel overlay (Image_LS_Overlay, Theme.py:82) — never shipped in the built theme, only baked into preview_lockscreen.png. */
export const LOCKSCREEN_PREVIEW_OVERLAY_PATH = (): string =>
  themebuilderAssetPath('static', 'overlay.png')
export const DEFAULT_AUDIO_TRACK_PATH = (): string => themebuilderAssetPath('audio', 'default.at9')
export const AT9TOOL_PATH = (): string => themebuilderAssetPath('bin', 'at9tool.exe')

/**
 * Fallback source images used when the user never picks one, so export
 * never fails for a missing-but-defaultable slot (DECISION 2026-09-14 —
 * see `packaging.ts`). `defaultLS.png`/`LAnoteno_def.png`/`LAnotenew_def.png`
 * are the legacy tool's own bundled defaults (Theme.py:82-88's top-level
 * `LS`/`NOTI_inon`/`NOTI_inew` defaults, and the "Default" reset buttons at
 * Theme.py:909/928) — for the lockscreen this is a genuine deviation from
 * the original (which has no lockscreen fallback at all and would itself
 * produce a broken theme if exported unset), while the notification icons
 * reproduce real original behavior: leaving them untouched and exporting
 * ships these exact bundled PNGs as notices.png/notice.png (Theme.py:2646-2650).
 */
export const DEFAULT_LOCKSCREEN_IMAGE_PATH = (): string =>
  themebuilderAssetPath('static', 'defaultLockscreen.png')
export const DEFAULT_NO_NOTICE_ICON_PATH = (): string =>
  themebuilderAssetPath('static', 'defaultNoNoticeIcon.png')
export const DEFAULT_NEW_NOTICE_ICON_PATH = (): string =>
  themebuilderAssetPath('static', 'defaultNewNoticeIcon.png')
/** Ultimate fallback for `preview_page.png` when literally no page has a background set (Theme.py's own `defaultLA.png`, used by its LiveArea preview widget for the same reason). */
export const DEFAULT_PAGE_BACKGROUND_PATH = (): string =>
  themebuilderAssetPath('static', 'defaultPageBackground.png')

export function iconOverlayPath(glyphStyle: string, slot: string): string {
  return themebuilderAssetPath('iconBuilder', 'Overlays', glyphStyle, `${slot}.png`)
}

export function iconSwatchPath(swatchName: string): string {
  return themebuilderAssetPath('iconBuilder', 'Colors', `${swatchName}.png`)
}
