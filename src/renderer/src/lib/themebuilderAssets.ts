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
