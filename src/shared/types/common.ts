/**
 * Shared primitive types used across the theme data model.
 * Grounded in DOMAIN_LOGIC_ANALYSIS.md §2 (image spec), §5 (manifest schema).
 */

/** 6 hex digits, no leading '#', e.g. "1a2b3c". */
export type HexColor6 = string

/**
 * theme.xml serializes every color as a hardcoded "ff" alpha byte followed by
 * a bare 6-hex-digit RGB string (§5): `ff<RRGGBB>`. This is the on-disk wire
 * format; `HexColor6` above is the value the UI/data model actually edits.
 */
export type ManifestColor = `ff${string}`

export interface PixelDimensions {
  width: number
  height: number
}

/**
 * Maps to scale.bat's `-keep-ratio` flag (§2):
 * - "forced-stretch"    → `-keep-ratio no`, exact W×H, distorts source aspect ratio
 * - "aspect-preserved"  → `-keep-ratio yes`, fits within a max box, no distortion
 *
 * DECISION (2026-09-14, report §Open Questions #3): production image slots
 * (lockscreen, page backgrounds, thumbnails) keep forced-stretch only, no
 * crop-to-fill mode — matches the original tool exactly, since existing
 * community source art was prepared expecting stretch behavior.
 * "aspect-preserved" remains in this union only because it's genuinely used
 * elsewhere (the notification icon slot, §2) — it is not a general-purpose
 * alternative fit mode offered to users for production images.
 */
export type ResizeFit = 'forced-stretch' | 'aspect-preserved'

/**
 * Locales theme.xml writes under `<m_title><m_param>` (§5). Notably there is
 * no "en" entry in the original tool — confirmed finding, not an omission.
 */
export type ManifestLocale =
  'da' | 'de' | 'es' | 'fi' | 'fr' | 'it' | 'nl' | 'no' | 'pl' | 'pt' | 'ru' | 'sv'

export const MANIFEST_LOCALES: readonly ManifestLocale[] = [
  'da',
  'de',
  'es',
  'fi',
  'fr',
  'it',
  'nl',
  'no',
  'pl',
  'pt',
  'ru',
  'sv'
]

/** Fixed-length tuple helper — the Vita home screen has exactly 10 pages (§5, §6). */
export type Tuple10<T> = [T, T, T, T, T, T, T, T, T, T]

export const PAGE_COUNT = 10 as const
export type PageIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
