/**
 * Shared top status-bar strip for both live previews (Lockscreen and
 * LiveArea/Home) — a single implementation so the two screens can't drift.
 *
 * Grounded in Theme.py's own preview widget, which draws a bar-color
 * rectangle across the top 12/220 of its 390×220 canvas on *both* canvases
 * (LS: Theme.py:2165-2167; LA: Theme.py:2208-2210), with `TBTC`-colored text
 * on top of it. The real device renders this bar itself from just two
 * theme.xml colors (`<m_barColor>`/`<m_indicatorColor>`,
 * `InfoBarColorSettings`) — no bitmap ships for it (see manifestGeneration.ts
 * and imageConversion.ts's `generateLockscreenPreviewScreenshot`, which bakes
 * a *preview-only* screenshot, not a themed asset).
 *
 * DECISION (2026-09-15): Theme.py's own preview fakes the whole cluster as
 * one right-anchored text string ("o))" / "[]" / "12:00") since PySimpleGUI's
 * Graph widget can't draw real icon glyphs or lay out a bar with independent
 * left/center/right zones — it isn't evidence for the real firmware's actual
 * icon positions. The layout here (wifi pinned left, a home glyph centered on
 * LiveArea only, then time/battery-%/battery-icon/notification clustered
 * right) instead follows real device/export evidence the user supplied
 * (a screenshot, then a real exported `preview_page.png`), which is stronger
 * evidence than re-deriving from the legacy tool's own approximated preview
 * widget. There's no persistent sound/mute glyph in that evidence, so this
 * cluster doesn't fabricate one, and the home glyph is LiveArea-only —
 * `preview_page.png`'s own corner notice icon sits inline with its "12:00"
 * text, not centered, confirming there's no center-column icon on that
 * screen; the lockscreen doesn't get one either since neither piece of
 * evidence shows a home affordance on a screen with nothing to "go home"
 * from.
 */
import type { InfoBarColorSettings } from '@shared/types'
import { toFileUrl } from '../../lib/uiHelpers'

function WifiIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <path
        d="M1.5 6C4.2 3.3 11.8 3.3 14.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M3.6 8.4C5.6 6.5 10.4 6.5 12.4 8.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.8 10.8C6.9 9.8 9.1 9.8 10.2 10.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
    </svg>
  )
}

function HomeIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
      <path
        d="M2 7.6 8 2.6l6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 6.6V13h9.2V6.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="6.4" y="9" width="3.2" height="4" rx="0.4" fill="currentColor" />
    </svg>
  )
}

function BatteryIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 20 16" width="1.25em" height="1em" fill="none" aria-hidden="true">
      <rect
        x="0.8"
        y="2.8"
        width="16.4"
        height="10.4"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect x="18" y="6" width="1.3" height="4" rx="0.6" fill="currentColor" />
      <rect x="2.6" y="4.6" width="11.6" height="6.8" rx="1" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

export function StatusBarOverlay({
  infoBarColors,
  time,
  batteryPercent = 84,
  variant = 'inline',
  showHome = false,
  noticeIconPath
}: {
  infoBarColors: InfoBarColorSettings
  time: string
  batteryPercent?: number
  /** 'inline' sits as a flex child (Home); 'absolute' pins itself to the
   *  top of a `position: relative`/`absolute` ancestor (Lockscreen). */
  variant?: 'inline' | 'absolute'
  /** LiveArea only — see module doc comment. */
  showHome?: boolean
  /** LiveArea only. `undefined` omits the notice slot entirely (lockscreen);
   *  an empty string renders the fallback glyph (no custom icon set yet). */
  noticeIconPath?: string
}): React.JSX.Element {
  return (
    <div
      className={
        variant === 'absolute'
          ? 'preview-status-bar preview-status-bar-absolute'
          : 'preview-status-bar'
      }
      style={{
        background: `#${infoBarColors.barColor}`,
        color: `#${infoBarColors.indicatorColor}`
      }}
    >
      <div className="preview-status-left">
        <WifiIcon />
      </div>
      {/* Always occupies the grid's middle column (even empty) so the right
          cluster stays pinned to the 3rd column instead of auto-placing into
          the 2nd when there's no home icon (lockscreen). */}
      <div className="preview-status-center">{showHome && <HomeIcon />}</div>
      <div className="preview-status-right">
        <span className="preview-status-time">{time}</span>
        <span className="preview-status-battery-pct">{batteryPercent}%</span>
        <BatteryIcon />
        {noticeIconPath !== undefined && (
          <span className="preview-status-notice">
            {noticeIconPath ? (
              <img src={toFileUrl(noticeIconPath)} alt="" />
            ) : (
              <span className="preview-status-notice-fallback">✉</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
