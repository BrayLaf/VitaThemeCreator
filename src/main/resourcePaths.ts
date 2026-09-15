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
export const DEFAULT_AUDIO_TRACK_PATH = (): string => themebuilderAssetPath('audio', 'default.at9')
export const AT9TOOL_PATH = (): string => themebuilderAssetPath('bin', 'at9tool.exe')

export function iconOverlayPath(glyphStyle: string, slot: string): string {
  return themebuilderAssetPath('iconBuilder', 'Overlays', glyphStyle, `${slot}.png`)
}

export function iconSwatchPath(swatchName: string): string {
  return themebuilderAssetPath('iconBuilder', 'Colors', `${swatchName}.png`)
}
