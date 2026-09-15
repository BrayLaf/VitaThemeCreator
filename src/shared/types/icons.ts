/**
 * System icon generation (Icon.py) and the 17 fixed icon slots.
 * Grounded in DOMAIN_LOGIC_ANALYSIS.md §4 (icon generation logic) and §5
 * (theme.xml's 17 fixed icon-slot blocks).
 */
import type { PixelDimensions } from './common'

/**
 * The 17 icon-set filenames Icon.py produces (Icon.py:1256-1390), and that
 * Theme.py copies verbatim into the exported package (Theme.py:2660-2665).
 */
export type IconSlotKey =
  | 'icon_web'
  | 'icon_trophies'
  | 'icon_friends'
  | 'icon_messages'
  | 'icon_party'
  | 'icon_ps4link'
  | 'icon_parental'
  | 'icon_music'
  | 'icon_videos'
  | 'icon_ps3link'
  | 'icon_cma'
  | 'icon_settings'
  | 'icon_calendar'
  | 'icon_mail'
  | 'icon_near'
  | 'icon_photos'
  | 'icon_power'

export const ICON_SLOT_KEYS: readonly IconSlotKey[] = [
  'icon_web',
  'icon_trophies',
  'icon_friends',
  'icon_messages',
  'icon_party',
  'icon_ps4link',
  'icon_parental',
  'icon_music',
  'icon_videos',
  'icon_ps3link',
  'icon_cma',
  'icon_settings',
  'icon_calendar',
  'icon_mail',
  'icon_near',
  'icon_photos',
  'icon_power'
]

/**
 * The 17 fixed icon-slot tag names theme.xml's <HomeProperty> writes (§5).
 * NOTE: this is a *different* naming scheme than IconSlotKey above.
 */
export type ManifestIconTag =
  | 'm_browser'
  | 'm_calendar'
  | 'm_camera'
  | 'm_email'
  | 'm_friend'
  | 'm_hostCollabo'
  | 'm_message'
  | 'm_music'
  | 'm_near'
  | 'm_parental'
  | 'm_party'
  | 'm_ps3Link'
  | 'm_ps4Link'
  | 'm_power'
  | 'm_settings'
  | 'm_trophy'
  | 'm_video'

/**
 * The IconSlotKey → ManifestIconTag correspondence, read directly from the
 * hardcoded per-icon blocks in Theme.py:2469-2521 (each `<m_X>` block's
 * `<m_iconFilePath>` literal names the icon_*.png it expects). Confirmed
 * from source, not inferred — note the non-obvious pairs:
 * `icon_photos` → `m_camera` (not `m_photo`) and `icon_web` → `m_browser`.
 */
export const ICON_SLOT_TO_MANIFEST_TAG: Record<IconSlotKey, ManifestIconTag> = {
  icon_web: 'm_browser',
  icon_calendar: 'm_calendar',
  icon_photos: 'm_camera',
  icon_mail: 'm_email',
  icon_friends: 'm_friend',
  icon_cma: 'm_hostCollabo',
  icon_messages: 'm_message',
  icon_music: 'm_music',
  icon_near: 'm_near',
  icon_parental: 'm_parental',
  icon_party: 'm_party',
  icon_ps3link: 'm_ps3Link',
  icon_ps4link: 'm_ps4Link',
  icon_power: 'm_power',
  icon_settings: 'm_settings',
  icon_trophies: 'm_trophy',
  icon_videos: 'm_video'
}

/** A glyph-style folder name under assets/IconBuilder/Overlays/<Style>/. */
export type IconGlyphStyle = string

/** A background choice for one icon: a bundled swatch, a custom image, or a live capture. */
export type IconBackgroundChoice =
  { kind: 'swatch'; name: string } | { kind: 'custom'; sourcePath: string } | { kind: 'snapshot' }

/** Per-icon generation choice (Icon.py §4, steps 1-2). */
export interface IconGenerationChoice {
  glyphStyle: IconGlyphStyle
  background: IconBackgroundChoice
}

/** The full 17-slot icon set the user is configuring for this theme project. */
export type IconSetSelection = Record<IconSlotKey, IconGenerationChoice>

export const ICON_DIMENSIONS: PixelDimensions = { width: 128, height: 128 }
