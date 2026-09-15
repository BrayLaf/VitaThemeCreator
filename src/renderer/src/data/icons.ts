/**
 * Display-only metadata for the 17 fixed icon slots (`IconSlotKey`, see
 * shared/types/icons.ts) plus the bundled glyph-overlay/background-swatch
 * asset names shipped under resources/themebuilder-assets/iconBuilder/.
 * The swatch hex values below are eyeballed approximations of the bundled
 * PNGs (for a quick-pick preview) — the real pixels come from
 * `compositeSystemIcon` at build time, not from these values.
 */
import type { IconGenerationChoice, IconSlotKey } from '@shared/types'
import type { CSSProperties } from 'react'
import { toFileUrl } from '../lib/uiHelpers'

export const ICON_LABELS: Record<IconSlotKey, string> = {
  icon_web: 'Browser',
  icon_trophies: 'Trophies',
  icon_friends: 'Friends',
  icon_messages: 'Messages',
  icon_party: 'Party',
  icon_ps4link: 'PS4 Link',
  icon_parental: 'Parental',
  icon_music: 'Music',
  icon_videos: 'Videos',
  icon_ps3link: 'PS3 Link',
  icon_cma: 'Content Manager',
  icon_settings: 'Settings',
  icon_calendar: 'Calendar',
  icon_mail: 'Mail',
  icon_near: 'Near',
  icon_photos: 'Photos',
  icon_power: 'Power'
}

export const ICON_GLYPHS: Record<IconSlotKey, string> = {
  icon_web: '◎',
  icon_trophies: '★',
  icon_friends: '☰',
  icon_messages: '✉',
  icon_party: '⬡',
  icon_ps4link: '⇄',
  icon_parental: '⚿',
  icon_music: '♪',
  icon_videos: '▶',
  icon_ps3link: '⇋',
  icon_cma: '⧉',
  icon_settings: '⚙',
  icon_calendar: '▦',
  icon_mail: '✦',
  icon_near: '◈',
  icon_photos: '◉',
  icon_power: '⏻'
}

/** Overlay-glyph color variants — resources/themebuilder-assets/iconBuilder/Overlays/<name>/. */
export const ICON_GLYPH_STYLES: readonly string[] = [
  'Default',
  'Black',
  'White',
  'Grey',
  'Dark-Grey',
  'Blue',
  'Dark-Blue',
  'Cyan',
  'Dark-Cyan',
  'Green',
  'Dark-Green',
  'Yellow',
  'Dark-Yellow',
  'Red',
  'Dark-Red',
  'Pink',
  'Purple',
  'None'
]

export interface IconSwatchOption {
  /** The exact `IconBackgroundChoice.name` value — matches the asset filename stem. */
  name: string
  label: string
  /** null = the bundled swatch is transparent ("None."). */
  hex: string | null
}

/** resources/themebuilder-assets/iconBuilder/Colors/*.png, minus Custom/Snapshot (those are separate `IconBackgroundChoice.kind`s). */
export const ICON_BACKGROUND_SWATCHES: readonly IconSwatchOption[] = [
  { name: 'Black', label: 'Black', hex: '#141414' },
  { name: 'White', label: 'White', hex: '#eef1f5' },
  { name: 'Grey', label: 'Grey', hex: '#888d96' },
  { name: 'Dark-Grey', label: 'Dark Grey', hex: '#35383e' },
  { name: 'Blue', label: 'Blue', hex: '#2f5bd9' },
  { name: 'Dark-Blue', label: 'Dark Blue', hex: '#1a2a52' },
  { name: 'Cyan', label: 'Cyan', hex: '#18b9c9' },
  { name: 'Dark-Cyan', label: 'Dark Cyan', hex: '#0f4850' },
  { name: 'Green', label: 'Green', hex: '#2fae54' },
  { name: 'Dark-Green', label: 'Dark Green', hex: '#1c4327' },
  { name: 'Yellow', label: 'Yellow', hex: '#e2c934' },
  { name: 'Dark-Yellow', label: 'Dark Yellow', hex: '#6b5710' },
  { name: 'Red', label: 'Red', hex: '#d5423f' },
  { name: 'Dark-Red', label: 'Dark Red', hex: '#5a1c1c' },
  { name: 'Pink', label: 'Pink', hex: '#e06fa0' },
  { name: 'Purple', label: 'Purple', hex: '#7c4fd6' },
  { name: 'None.', label: 'None', hex: null }
]

/** Shared by the System Icons panel's slot tiles and the home-screen live preview. */
export function iconTileBackground(choice: IconGenerationChoice): CSSProperties {
  const background = choice.background
  if (background.kind === 'custom' && background.sourcePath) {
    return {
      backgroundImage: `url("${toFileUrl(background.sourcePath)}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  if (background.kind === 'swatch') {
    const swatch = ICON_BACKGROUND_SWATCHES.find((s) => s.name === background.name)
    if (swatch?.hex) return { background: swatch.hex }
    return {
      backgroundImage:
        'repeating-linear-gradient(45deg,#20242c 0 6px,#181b21 6px 12px,#20242c 12px 18px,#181b21 18px 24px)'
    }
  }
  return { background: '#20242c' }
}
