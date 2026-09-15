/**
 * One system-icon tile, rendered from the *real* bundled art
 * (resources/themebuilder-assets/iconBuilder/) the same way
 * `compositeSystemIcon` composites it at build time — a background-swatch
 * layer plus a transparent glyph-overlay layer on top — instead of a flat
 * approximate color + a generic Unicode glyph standing in for it.
 * `iconTileBackground` still supplies the base fill (a custom image, or the
 * eyeballed swatch color/placeholder pattern) so the tile isn't empty while
 * the one-time asset-root IPC round trip is in flight.
 */
import { ICON_BACKGROUND_SWATCHES, ICON_GLYPHS, iconTileBackground } from '../../data/icons'
import {
  iconOverlayUrl,
  iconSwatchImageUrl,
  useThemebuilderAssetsRoot
} from '../../lib/themebuilderAssets'
import type { IconGenerationChoice, IconSlotKey } from '@shared/types'

export function IconTile({
  slot,
  choice,
  className
}: {
  slot: IconSlotKey
  choice: IconGenerationChoice
  className: string
}): React.JSX.Element {
  const root = useThemebuilderAssetsRoot()
  const overlaySrc = root ? iconOverlayUrl(root, choice.glyphStyle, slot) : null
  // A default/unset icon choice starts as `{ kind: 'swatch', name: '' }`
  // (createEmptyThemeProject.ts) — no bundled asset exists for that name, so
  // only request the swatch image once it names a real one (otherwise every
  // icon in its default state fires a failed file request on every render).
  const background = choice.background
  const swatchName =
    background.kind === 'swatch' && ICON_BACKGROUND_SWATCHES.some((s) => s.name === background.name)
      ? background.name
      : null
  const swatchImageSrc = root && swatchName ? iconSwatchImageUrl(root, swatchName) : null

  return (
    <div className={className} style={iconTileBackground(choice)}>
      {swatchImageSrc && <img className="icon-tile-layer" src={swatchImageSrc} alt="" />}
      {overlaySrc ? (
        <img className="icon-tile-layer" src={overlaySrc} alt="" />
      ) : (
        <span>{ICON_GLYPHS[slot]}</span>
      )}
    </div>
  )
}
