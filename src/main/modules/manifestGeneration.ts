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
 */
import { create } from 'xmlbuilder2'
import {
  ICON_SLOT_KEYS,
  ICON_SLOT_TO_MANIFEST_TAG,
  MANIFEST_LOCALES,
  PAGE_COUNT,
  type ManifestColor,
  type ManifestIconBlocks,
  type ThemeManifest,
  type ThemeProject
} from '@shared/types'

/** `theme.xml` writes every color as a hardcoded "ff" alpha byte + bare 6-hex RGB (§5). */
function toManifestColor(hex: string): ManifestColor {
  return `ff${hex.toLowerCase()}`
}

/**
 * Clamps a free-form version string to the "NN.NN" shape theme.xml expects
 * for `m_contentVer` (§5: "clamped 01.00-99.99"). Falls back to "01.00" for
 * anything unparseable rather than guessing at intent.
 */
function clampContentVersion(version: string): string {
  const match = /^(\d{1,2})\.(\d{1,2})$/.exec(version.trim())
  if (!match) return '01.00'
  const major = Math.min(99, Math.max(1, parseInt(match[1], 10)))
  const minor = Math.min(99, Math.max(0, parseInt(match[2], 10)))
  return `${String(major).padStart(2, '0')}.${String(minor).padStart(2, '0')}`
}

/**
 * Maps a `ThemeProject`'s editable state onto the full `ThemeManifest`
 * shape, filling in the fixed/hardcoded manifest values (notifyBorderColor,
 * noticeFontColor, noticeGlowColor) and the icon slot mapping
 * (`ICON_SLOT_TO_MANIFEST_TAG`, shared/types/icons.ts) along the way.
 * Report ref: §5; Theme.py:2300-2522.
 */
export function generateManifest(project: ThemeProject): ThemeManifest {
  const titleByLocale = Object.fromEntries(
    MANIFEST_LOCALES.map((locale) => [locale, project.meta.name])
  ) as ThemeManifest['informationProperty']['titleByLocale']

  const icons: ManifestIconBlocks = Object.fromEntries(
    ICON_SLOT_KEYS.map((slot) => [ICON_SLOT_TO_MANIFEST_TAG[slot], { iconFilePath: `${slot}.png` }])
  ) as ManifestIconBlocks

  const bgParam = project.pages.map((page, index) => ({
    thumbnailFilePath: `bg${index + 1}t.png`,
    imageFilePath: `bg${index + 1}.png`,
    waveType: page.colors.waveType,
    fontColor: toManifestColor(page.colors.fontColor),
    fontShadow: page.colors.fontShadow ? ('1' as const) : ('0' as const)
  })) as ThemeManifest['homeProperty']['bgParam']

  if (bgParam.length !== PAGE_COUNT) {
    throw new Error(`expected ${PAGE_COUNT} pages, got ${bgParam.length}`)
  }

  return {
    formatVersion: '01.00',
    package: '0',
    informationProperty: {
      contentVersion: clampContentVersion(project.meta.version),
      homePreviewFilePath: 'preview_page.png',
      packageImageFilePath: 'preview_thumbnail.png',
      provider: project.meta.creator,
      startPreviewFilePath: 'preview_lockscreen.png',
      title: project.meta.name,
      titleByLocale
    },
    startScreenProperty: {
      dateColor: toManifestColor(project.clock.color),
      dateLayout: project.clock.position,
      filePath: 'lockscreen.png',
      notifyBgColor: toManifestColor(project.notificationColors.boxColor),
      notifyBorderColor: 'ffcccccc',
      notifyFontColor: toManifestColor(project.notificationColors.textColor)
    },
    infomationBarProperty: {
      barColor: toManifestColor(project.infoBarColors.barColor),
      indicatorColor: toManifestColor(project.infoBarColors.indicatorColor),
      noticeFontColor: 'ffffffff',
      noticeGlowColor: 'ffca0000',
      noNoticeFilePath: 'notices.png',
      newNoticeFilePath: 'notice.png'
    },
    homeProperty: {
      bgParam,
      basePageFilePath: 'basePage.png',
      curPageFilePath: 'curPage.png',
      bgmFilePath: 'bgm.at9',
      icons
    }
  }
}

/**
 * Serializes a `ThemeManifest` to the theme.xml string written to disk.
 * Report ref: §5; Theme.py:2333-2522.
 *
 * Emits strictly valid XML — see module-level DECISION note above. Does NOT
 * reproduce the original's malformed leading prolog line or the stray
 * backtick before `<m_calendar>`.
 */
export function serializeManifestXml(manifest: ThemeManifest): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele('theme', {
    'format-ver': manifest.formatVersion,
    package: manifest.package
  })

  const info = doc.ele('InfomationProperty')
  info.ele('m_contentVer').txt(manifest.informationProperty.contentVersion)
  info.ele('m_homePreviewFilePath').txt(manifest.informationProperty.homePreviewFilePath)
  info.ele('m_packageImageFilePath').txt(manifest.informationProperty.packageImageFilePath)
  info.ele('m_provider').ele('m_default').txt(manifest.informationProperty.provider)
  info.ele('m_startPreviewFilePath').txt(manifest.informationProperty.startPreviewFilePath)
  const title = info.ele('m_title')
  title.ele('m_default').txt(manifest.informationProperty.title)
  for (const [locale, value] of Object.entries(manifest.informationProperty.titleByLocale)) {
    title.ele('m_param', { locale }).txt(value)
  }

  const start = doc.ele('StartScreenProperty')
  start.ele('m_dateColor').txt(manifest.startScreenProperty.dateColor)
  start.ele('m_dateLayout').txt(String(manifest.startScreenProperty.dateLayout))
  start.ele('m_filePath').txt(manifest.startScreenProperty.filePath)
  start.ele('m_notifyBgColor').txt(manifest.startScreenProperty.notifyBgColor)
  start.ele('m_notifyBorderColor').txt(manifest.startScreenProperty.notifyBorderColor)
  start.ele('m_notifyFontColor').txt(manifest.startScreenProperty.notifyFontColor)

  const bar = doc.ele('InfomationBarProperty')
  bar.ele('m_barColor').txt(manifest.infomationBarProperty.barColor)
  bar.ele('m_indicatorColor').txt(manifest.infomationBarProperty.indicatorColor)
  bar.ele('m_noticeFontColor').txt(manifest.infomationBarProperty.noticeFontColor)
  bar.ele('m_noticeGlowColor').txt(manifest.infomationBarProperty.noticeGlowColor)
  bar.ele('m_noNoticeFilePath').txt(manifest.infomationBarProperty.noNoticeFilePath)
  bar.ele('m_newNoticeFilePath').txt(manifest.infomationBarProperty.newNoticeFilePath)

  const home = doc.ele('HomeProperty')
  for (const page of manifest.homeProperty.bgParam) {
    const bg = home.ele('m_bgParam').ele('BackgroundParam')
    bg.ele('m_thumbnailFilePath').txt(page.thumbnailFilePath)
    bg.ele('m_imageFilePath').txt(page.imageFilePath)
    bg.ele('m_waveType').txt(String(page.waveType))
    bg.ele('m_fontColor').txt(page.fontColor)
    bg.ele('m_fontShadow').txt(page.fontShadow)
  }
  home.ele('m_basePageFilePath').txt(manifest.homeProperty.basePageFilePath)
  home.ele('m_curPageFilePath').txt(manifest.homeProperty.curPageFilePath)
  home.ele('m_bgmFilePath').txt(manifest.homeProperty.bgmFilePath)
  for (const [tag, block] of Object.entries(manifest.homeProperty.icons)) {
    home.ele(tag).ele('m_iconFilePath').txt(block.iconFilePath)
  }

  return doc.end({ prettyPrint: true })
}
