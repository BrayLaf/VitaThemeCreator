/**
 * Color and clock-position settings. Grounded in DOMAIN_LOGIC_ANALYSIS.md §5
 * (theme.xml schema) — these are the user-editable values; fields noted as
 * "hardcoded" below are never exposed to the UI, only baked into the
 * generated manifest by `generateManifest()`.
 */
import type { HexColor6 } from './common'

/**
 * `<m_dateLayout>` — clock position on the lockscreen (§5).
 * 0 = Bottom Left, 1 = Top Left, 2 = Bottom Right.
 */
export type ClockPosition = 0 | 1 | 2

export const CLOCK_POSITION_LABELS: Record<ClockPosition, string> = {
  0: 'Bottom Left',
  1: 'Top Left',
  2: 'Bottom Right'
}

/** `<StartScreenProperty>` clock color, editable. Box/font colors below. */
export interface ClockSettings {
  color: HexColor6
  position: ClockPosition
}

/**
 * `<StartScreenProperty>` notification bubble colors.
 * `m_notifyBorderColor` is hardcoded to "ffcccccc" in the original tool and
 * is not user-editable — intentionally excluded from this type.
 */
export interface NotificationColorSettings {
  boxColor: HexColor6
  textColor: HexColor6
}

/**
 * `<InfomationBarProperty>` [sic] status bar colors.
 * `m_noticeFontColor` ("ffffffff") and `m_noticeGlowColor` ("ffca0000") are
 * hardcoded in the original tool and excluded here.
 */
export interface InfoBarColorSettings {
  barColor: HexColor6
  indicatorColor: HexColor6
}

/**
 * Per-page settings from `<HomeProperty><m_bgParam>` (§5) — one per page (1-10).
 *
 * `m_fontShadow` is hardcoded to "1" for every page in the original tool,
 * with no UI toggle anywhere in Theme.py. DECISION (2026-09-14): expose it
 * here as a user-editable per-page boolean rather than assume it's a fixed
 * firmware requirement — `generateManifest()` maps it to the manifest's
 * `'0' | '1'` wire value (see `ManifestBackgroundParam.fontShadow`).
 */
export interface PageColorSettings {
  /** Wave background pattern index, 0-30 (§5). */
  waveType: number
  fontColor: HexColor6
  fontShadow: boolean
}
