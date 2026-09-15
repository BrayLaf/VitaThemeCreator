/**
 * Resolves the bundled `resources/themebuilder-assets/` root (see
 * `src/main/resourcePaths.ts`) once per session, so the live preview can
 * load the real icon glyph-overlay/background-swatch PNGs the same way
 * `compositeSystemIcon` does at build time, instead of an approximation.
 */
import { useEffect, useState } from 'react'
import { toFileUrl } from './uiHelpers'

let rootPromise: Promise<string> | null = null

function getThemebuilderAssetsRoot(): Promise<string> {
  if (!rootPromise) rootPromise = window.api.resolveThemebuilderAssetPath([])
  return rootPromise
}

/** null while the one-time IPC round trip to resolve the assets root is in flight. */
export function useThemebuilderAssetsRoot(): string | null {
  const [root, setRoot] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    getThemebuilderAssetsRoot().then((resolved) => {
      if (!cancelled) setRoot(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return root
}

/** `resources/themebuilder-assets/iconBuilder/Overlays/<glyphStyle>/<slot>.png` as a loadable URL. */
export function iconOverlayUrl(root: string, glyphStyle: string, slot: string): string {
  return toFileUrl(`${root}/iconBuilder/Overlays/${glyphStyle}/${slot}.png`)
}

/** `resources/themebuilder-assets/iconBuilder/Colors/<swatchName>.png` as a loadable URL. */
export function iconSwatchImageUrl(root: string, swatchName: string): string {
  return toFileUrl(`${root}/iconBuilder/Colors/${swatchName}.png`)
}

/**
 * `resources/themebuilder-assets/masks/notificationGuide.png` — copied
 * verbatim from ThemeBUILDER's own `assets/preview/default/LAnotemsk.png`,
 * the guide overlay its `NOTIFICATION_EDIT` position editor (Theme.py:843
 * -1295) draws over the icon while the user pans/zooms it: a translucent
 * scrim with a circular cutout showing exactly which part of the 120×110
 * frame is actually visible on the Vita's info-bar badge. Passed as
 * `ImageCropper`'s `guideOverlayUrl` for the notification-icon slots.
 */
export function notificationGuideMaskUrl(root: string): string {
  return toFileUrl(`${root}/masks/notificationGuide.png`)
}
