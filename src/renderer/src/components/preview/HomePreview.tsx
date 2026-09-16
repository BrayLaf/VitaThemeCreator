/**
 * Live home-screen preview for the currently selected page (1-10). The wave
 * pattern is the page's actual background whenever no image is set — the
 * Vita firmware draws it itself (and during page-swipe transitions), it is
 * never composited on top of a real background image (§5 <m_bgParam>,
 * `ThemeBUILDER/assets/waves.png` — every one of the 31 indices is the same
 * shape, just a different color; see data/wavePattern.ts). Only the numeric
 * wave index is actually stored — the art itself is a procedural stand-in,
 * since no reference art ships with this project. Icon tiles (`IconTile`)
 * render the real bundled background-swatch/glyph-overlay PNGs the same way
 * `compositeSystemIcon` composites them at build time, not a flat color +
 * generic glyph standing in for them.
 *
 * Status bar content/order (icon cluster ending in the clock, right-
 * aligned, nothing on the left) mirrors Theme.py:2208's own preview draw
 * call — a single string "o)) ... [] ... 12:00" (signal, battery, time)
 * right-anchored in the bar. `StatusBarOverlay` renders that same cluster
 * with real SVG icons instead of Theme.py's ASCII-art stand-ins (it could
 * only draw literal text onto its preview canvas) — shared verbatim with
 * `LockscreenPreview`, since Theme.py draws this identical bar on both of
 * its preview canvases. There's no "Page N of 10" text on a real status
 * bar; that was this app's own fabricated debug label — the page number
 * lives in the page-dot indicator instead, same as real hardware.
 *
 * Page indicator: a vertical dot strip on the left edge, centered
 * vertically — matches the real Vita's LiveArea (Theme.py's own preview
 * never draws a page indicator at all, so this is sourced from the device
 * itself, not the legacy tool), not a bottom dot bar. Renders the user's
 * actual basePage.png/curPage.png (`project.pageIndicator`) when set, the
 * same way the LiveArea would, instead of always showing the flat-color
 * placeholder dot — see the `PageIndicatorImageSlot` DECISION note,
 * imageSlots.ts.
 *
 * Icon layout: the Vita's LiveArea packs icons as circular "bubbles" in a
 * honeycomb pattern — rows of alternating length 3/4/3 (centered, so the
 * shorter rows nest between the wider ones), not a rectangular grid. A real
 * LiveArea page holds at most 10 bubbles this way (3+4+3) — it never grows
 * a 4th or 5th row to fit more.
 *
 * DECISION (2026-09-14): this preview isn't simulating which of the 17
 * system icons a real device would place on which page — that's
 * install-order-dependent and nothing this app's data model tracks. Its
 * job is just to show what a page's background/wave/text-color looks like
 * with icons sitting on top of it, capped at the real 10-icon/3-4-3 layout
 * limit — so the same first-10 icon slots render on every page, every time.
 *
 * Notification icon (inline in the status bar's right cluster, after the
 * battery icon): per Theme.py:2211-2213, the LiveArea preview always draws a
 * small notice/newNotice icon at the top-right corner of its own canvas
 * (`Image_NoteNO`/`Image_NoteNEW` — the same `notificationIcons` assets used
 * by the lockscreen's wide notification bubble), and a real exported
 * `preview_page.png` the user supplied confirms it sits inline with the
 * clock/battery cluster, not as an oversized floating badge — this is
 * LiveArea-only in the legacy tool; the lockscreen shows its notification as
 * the separate wide bubble instead (`LockscreenPreview`), never this small
 * icon. Always renders the "new notice" asset here, matching
 * `LockscreenPreview`'s own choice to always preview the "has a
 * notification" demo state.
 */
import { ICON_SLOT_KEYS, type IconSlotKey, type PageIndex, type ThemeProject } from '@shared/types'
import { ICON_LABELS } from '../../data/icons'
import { waveTileColor, wavePatternBackground } from '../../data/wavePattern'
import { withAlpha, toFileUrl } from '../../lib/uiHelpers'
import { IconTile } from '../common/IconTile'
import { CroppedImageLayer } from '../common/CroppedImageLayer'
import { StatusBarOverlay } from './StatusBarOverlay'

const PAGE_INDICES: PageIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const ICON_ROW_SIZES = [3, 4, 3] as const

const PREVIEW_ICON_ROWS: readonly IconSlotKey[][] = (() => {
  const rows: IconSlotKey[][] = []
  let cursor = 0
  for (const size of ICON_ROW_SIZES) {
    rows.push(ICON_SLOT_KEYS.slice(cursor, cursor + size))
    cursor += size
  }
  return rows
})()

export function HomePreview({
  project,
  now,
  selectedPage,
  onSelectPage,
  showIcons
}: {
  project: ThemeProject
  now: Date
  selectedPage: PageIndex
  onSelectPage: (page: PageIndex) => void
  showIcons: boolean
}): React.JSX.Element {
  const page = project.pages[selectedPage - 1]
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const fontColor = `#${page.colors.fontColor}`
  const bgImage = page.images.main
  const newNoticePath = project.notificationIcons.newNotice.sourcePath
  const basePageIconPath = project.pageIndicator.basePage.sourcePath
  const curPageIconPath = project.pageIndicator.curPage.sourcePath

  return (
    <div className="preview-home">
      <StatusBarOverlay
        infoBarColors={project.infoBarColors}
        time={time}
        showHome
        noticeIconPath={newNoticePath ?? ''}
      />

      <div className="preview-home-content">
        {bgImage.sourcePath ? (
          bgImage.fitMode === 'crop' ? (
            <CroppedImageLayer
              className="preview-bg-image"
              sourcePath={bgImage.sourcePath}
              crop={bgImage.crop}
            />
          ) : (
            <img className="preview-bg-image" src={toFileUrl(bgImage.sourcePath)} alt="" />
          )
        ) : (
          // No background image set for this page — the Vita firmware
          // itself draws the page's m_waveType pattern in that case (§5),
          // it is NOT a decorative layer drawn on top of a real background.
          <div
            className="preview-wave-layer"
            style={{
              backgroundColor: waveTileColor(page.colors.waveType),
              backgroundImage: wavePatternBackground()
            }}
          />
        )}
        {showIcons && (
          <div className="preview-icon-grid">
            {PREVIEW_ICON_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="preview-icon-row">
                {row.map((slot) => {
                  const choice = project.iconSet[slot]
                  return (
                    <div key={slot} className="preview-icon-cell">
                      <IconTile slot={slot} choice={choice} className="preview-icon-tile" />
                      <div
                        className="preview-icon-label"
                        style={{
                          color: fontColor,
                          textShadow: page.colors.fontShadow ? '0 1px 6px rgba(0,0,0,.5)' : 'none'
                        }}
                      >
                        {ICON_LABELS[slot]}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="preview-page-dots">
        {PAGE_INDICES.map((n) => {
          const isCurrent = n === selectedPage
          const iconPath = isCurrent ? curPageIconPath : basePageIconPath
          return (
            <button
              key={n}
              type="button"
              aria-label={`Page ${n}`}
              className="preview-page-dot"
              onClick={() => onSelectPage(n)}
              style={
                iconPath
                  ? undefined
                  : { background: isCurrent ? fontColor : withAlpha(fontColor, 0.35) }
              }
            >
              {iconPath && (
                <img className="preview-page-dot-image" src={toFileUrl(iconPath)} alt="" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
