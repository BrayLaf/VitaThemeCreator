/**
 * Live home-screen preview for the currently selected page (1-10). Wave
 * pattern art is a procedural stand-in (see data/wavePattern.ts) — the real
 * pattern is firmware-drawn and only its numeric index (§5 <m_bgParam>) is
 * actually stored. Icon tiles reflect the real per-slot background choice
 * (icons.ts §4) with a glyph overlay standing in for the composited overlay
 * art `compositeSystemIcon` produces at build time.
 *
 * Status bar content/order (icon cluster ending in the clock, right-
 * aligned, nothing on the left) mirrors Theme.py:2208's own preview draw
 * call — a single string "o)) ... [] ... 12:00" (signal, battery, time)
 * right-anchored in the bar. There's no "Page N of 10" text on a real
 * status bar; that was this app's own fabricated debug label — the page
 * number lives in the page-dot indicator instead, same as real hardware.
 *
 * Page indicator: a vertical dot strip on the left edge, centered
 * vertically — matches the real Vita's LiveArea (Theme.py's own preview
 * never draws a page indicator at all, so this is sourced from the device
 * itself, not the legacy tool), not a bottom dot bar.
 *
 * Icon layout: the Vita's LiveArea packs icons as circular "bubbles" in a
 * honeycomb pattern — rows of alternating length (3/4/3/4/3, centered, so
 * the shorter rows nest between the wider ones), not a rectangular grid.
 * 3+4+3+4+3 = 17, matching the fixed icon-slot count exactly.
 */
import { ICON_SLOT_KEYS, type IconSlotKey, type PageIndex, type ThemeProject } from '@shared/types'
import { ICON_GLYPHS, ICON_LABELS, iconTileBackground } from '../../data/icons'
import { wavePatternBackground } from '../../data/wavePattern'
import { withAlpha, toFileUrl } from '../../lib/uiHelpers'

const PAGE_INDICES: PageIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const ICON_ROW_SIZES = [3, 4, 3, 4, 3] as const

const ICON_ROWS: IconSlotKey[][] = (() => {
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
  const bgPath = page.images.main.sourcePath

  return (
    <div className="preview-home">
      <div
        className="preview-status-bar"
        style={{
          background: `#${project.infoBarColors.barColor}`,
          color: `#${project.infoBarColors.indicatorColor}`
        }}
      >
        <div className="preview-status-right">
          <span>▮▮▯</span>
          <span>⌁</span>
          <span className="preview-status-battery">84%</span>
          <span className="preview-status-time">{time}</span>
        </div>
      </div>

      <div className="preview-home-content">
        {bgPath ? (
          <img className="preview-bg-image" src={toFileUrl(bgPath)} alt="" />
        ) : (
          // No caption here (unlike the lockscreen placeholder) — the icon
          // grid covers most of this area, and text underneath it would
          // bleed through the transparent gaps between icon labels.
          <div className="preview-bg-placeholder" />
        )}
        {bgPath && (
          <div
            className="preview-wave-layer"
            style={{
              backgroundImage: wavePatternBackground(page.colors.waveType, 'rgba(255,255,255,.22)')
            }}
          />
        )}
        {showIcons && (
          <div className="preview-icon-grid">
            {ICON_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="preview-icon-row">
                {row.map((slot) => {
                  const choice = project.iconSet[slot]
                  return (
                    <div key={slot} className="preview-icon-cell">
                      <div className="preview-icon-tile" style={iconTileBackground(choice)}>
                        {ICON_GLYPHS[slot]}
                      </div>
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
        {PAGE_INDICES.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Page ${n}`}
            className="preview-page-dot"
            onClick={() => onSelectPage(n)}
            style={{
              background: n === selectedPage ? fontColor : withAlpha(fontColor, 0.35)
            }}
          />
        ))}
      </div>
    </div>
  )
}
