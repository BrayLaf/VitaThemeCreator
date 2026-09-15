/**
 * theme.xml — the actual Vita-firmware-consumed manifest. This is a
 * *generated output*, not directly edited by the user; `generateManifest()`
 * (main-process stub) builds one of these from a `ThemeProject`.
 *
 * Grounded in DOMAIN_LOGIC_ANALYSIS.md §5. Schema, tag names, and hardcoded
 * values are transcribed as documented there (Theme.py:2300-2522).
 */
import type { ManifestColor, ManifestLocale, Tuple10 } from './common'
import type { ClockPosition } from './colorSettings'
import type { ManifestIconTag } from './icons'

export interface ManifestInformationProperty {
  /** e.g. "01.00", clamped 01.00-99.99. */
  contentVersion: string
  homePreviewFilePath: 'preview_page.png'
  packageImageFilePath: 'preview_thumbnail.png'
  provider: string
  startPreviewFilePath: 'preview_lockscreen.png'
  title: string
  /** Same title repeated per-locale (§5) — no "en" entry, confirmed finding. */
  titleByLocale: Record<ManifestLocale, string>
}

export interface ManifestStartScreenProperty {
  dateColor: ManifestColor
  dateLayout: ClockPosition
  filePath: 'lockscreen.png'
  notifyBgColor: ManifestColor
  /** Hardcoded in the original tool — not user-editable. */
  notifyBorderColor: 'ffcccccc'
  notifyFontColor: ManifestColor
}

/** [sic] — the original tool's tag is literally misspelled "Infomation". */
export interface ManifestInfomationBarProperty {
  barColor: ManifestColor
  indicatorColor: ManifestColor
  /** Hardcoded in the original tool. */
  noticeFontColor: 'ffffffff'
  /** Hardcoded in the original tool. */
  noticeGlowColor: 'ffca0000'
  noNoticeFilePath: 'notices.png'
  newNoticeFilePath: 'notice.png'
}

export interface ManifestBackgroundParam {
  thumbnailFilePath: string
  imageFilePath: string
  /** 0-30. */
  waveType: number
  fontColor: ManifestColor
  /**
   * The original tool hardcodes this to "1" for every page with no UI
   * toggle. DECISION (2026-09-14): expose it as user-editable per page
   * rather than assuming it's a fixed firmware requirement — see
   * `PageColorSettings.fontShadow` in colorSettings.ts.
   */
  fontShadow: '0' | '1'
}

export type ManifestIconBlocks = Record<ManifestIconTag, { iconFilePath: string }>

export interface ManifestHomeProperty {
  bgParam: Tuple10<ManifestBackgroundParam>
  /** Static asset, copied verbatim. */
  basePageFilePath: 'basePage.png'
  /** Static asset, copied verbatim. */
  curPageFilePath: 'curPage.png'
  bgmFilePath: 'bgm.at9'
  icons: ManifestIconBlocks
}

export interface ThemeManifest {
  formatVersion: '01.00'
  package: '0'
  informationProperty: ManifestInformationProperty
  startScreenProperty: ManifestStartScreenProperty
  infomationBarProperty: ManifestInfomationBarProperty
  homeProperty: ManifestHomeProperty
}

/**
 * The original tool emits two known XML defects — a non-standard leading
 * `<?THIS THEME WAS GENERATED...>` line before the real XML prolog, and a
 * stray backtick immediately before `<m_calendar>` (Theme.py:2334-2336,
 * Theme.py:2473). DECISION (2026-09-14): neither is reproduced — see the
 * serialization note on `serializeManifestXml` in
 * main/modules/manifestGeneration.ts. This type represents the logical
 * schema of the clean output.
 */
