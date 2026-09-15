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
 * - "forced-stretch"   → scale.bat's `-keep-ratio no` (§2): exact W×H, distorts source aspect ratio.
 * - "cover-with-pan"   → scale to fully cover a fixed frame with no
 *   distortion, then crop via a user-adjustable zoom + focal point
 *   (`ImageCrop`, imageSlots.ts) — not a letterboxed "fits within a max box"
 *   mode. The notification-icon slot always uses this (no stretch option:
 *   see the DECISION note on `NotificationIconImageSlot`, imageSlots.ts).
 *
 * DECISION (2026-09-14, report §Open Questions #3): production image slots
 * (lockscreen, page backgrounds, thumbnails) default to forced-stretch —
 * matches the original tool exactly, since existing community source art
 * was prepared expecting stretch behavior.
 *
 * DECISION (2026-09-15): those same slots later gained "cover-with-pan" as
 * an opt-in alternative (`CroppableImageSlot.fitMode`, imageSlots.ts) — a
 * pure authoring convenience this app adds on top of the original, not a
 * reproduction of anything Theme.py does. Forced-stretch stays the default
 * so existing projects and community art keep their exact prior output;
 * either mode still ends in a plain resize to the fixed target dimensions,
 * so the on-device result is always the shape Theme.py itself would produce.
 */
export type ResizeFit = 'forced-stretch' | 'cover-with-pan'

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
