/**
 * Builds the theme.xml manifest from a ThemeProject, and serializes it to
 * the on-disk XML format the Vita firmware consumes.
 *
 * Report ref: §5. The original tool hand-builds this via chained `print`
 * calls rather than a real XML serializer, and has two known defects: a
 * non-standard leading line before the real XML prolog, and a stray
 * backtick before `<m_calendar>` (Theme.py:2334-2336, 2473).
 *
 * DECISION (2026-09-14): `serializeManifestXml` emits strictly valid XML —
 * both defects are dropped, not reproduced. No evidence the firmware
 * requires either one; they read as unintentional bugs in the original.
 *
 * STUB MODULE — no real generation/serialization yet. All functions throw.
 */
import type { ThemeManifest, ThemeProject } from '@shared/types'

/**
 * Maps a `ThemeProject`'s editable state onto the full `ThemeManifest`
 * shape, filling in the fixed/hardcoded manifest values (notifyBorderColor,
 * noticeFontColor, noticeGlowColor) and the icon slot mapping
 * (`ICON_SLOT_TO_MANIFEST_TAG`, shared/types/icons.ts) along the way.
 * Report ref: §5; Theme.py:2300-2522.
 */
export function generateManifest(_project: ThemeProject): ThemeManifest {
  throw new Error('not implemented: generateManifest')
}

/**
 * Serializes a `ThemeManifest` to the theme.xml string written to disk.
 * Report ref: §5; Theme.py:2333-2522.
 *
 * Emits strictly valid XML — see module-level DECISION note above. Does NOT
 * reproduce the original's malformed leading prolog line or the stray
 * backtick before `<m_calendar>`.
 */
export function serializeManifestXml(_manifest: ThemeManifest): string {
  throw new Error('not implemented: serializeManifestXml')
}
