/**
 * Live 960×544 lockscreen preview. Renders straight off `ThemeProject` state
 * (report §5 <StartScreenProperty> / <InfomationBarProperty>) — no fabricated
 * fields (there's no "dim overlay" or "bubble glyph" slider in the real
 * schema; the notification bubble reflects `notificationColors` + the real
 * `notificationIcons.newNotice` image, and nothing else).
 *
 * The notification banner's position/size (a wide horizontal band in the
 * upper-middle of the screen, not a top-right corner badge) is read off
 * ThemeBUILDER's own live-preview drawing code: Theme.py:2228-2229 draws it
 * at graph coords (25,156)-(278,185) on a 390×220 canvas — converted here to
 * fractions of the 960×544 screen (left 6.4%, right 28.7% from edge, top
 * 9.1cqw, height 7.4cqw). The real Vita's unlock affordance is a small
 * silent drag handle, not text — Theme.py's own preview never draws a
 * "slide to unlock" label (there's nothing themeable there to preview), so
 * this renders a small handle instead of fabricating the label.
 *
 * Clock stacking order (date above, large time below) and date format
 * ("January 1 (Monday)" — Month Day (Weekday), not the locale default
 * "Weekday, Month Day") are both confirmed against a real exported
 * preview_lockscreen.png from the legacy tool, matching its own live-preview
 * draw call (Theme.py:2158-2164: `draw_text("January 1 (Monday)", ...)`).
 *
 * The page-lip/bezel frame in the corner is `assets/preview/default/
 * overlay.png` (`Image_LS_Overlay`, Theme.py:2167) — a fixed 390×221
 * decoration (matching the live-preview canvas's own aspect ratio) drawn on
 * top of everything else in the original tool's own preview widget, then
 * baked into the exported preview_lockscreen.png itself (Theme.py:2247
 * screen-grabs that same widget). It is not part of the real device
 * lockscreen — only of the preview chrome — so it renders above the
 * background/clock/notification bubble here too.
 */
import type { CSSProperties } from 'react'
import type { ClockPosition, ThemeProject } from '@shared/types'
import { toFileUrl } from '../../lib/uiHelpers'
import { CroppedImageLayer } from '../common/CroppedImageLayer'
import lockscreenOverlayUrl from '../../assets/lockscreen-preview-overlay.png'

function clockAlignStyle(position: ClockPosition): CSSProperties {
  if (position === 1) return { left: '3.5cqw', top: '7cqw', alignItems: 'flex-start' }
  if (position === 2) return { right: '3.5cqw', bottom: '5.8cqw', alignItems: 'flex-end' }
  return { left: '3.5cqw', bottom: '5.8cqw', alignItems: 'flex-start' }
}

export function LockscreenPreview({
  project,
  now
}: {
  project: ThemeProject
  now: Date
}): React.JSX.Element {
  const { clock, notificationColors, notificationIcons, lockscreenImage } = project
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const month = now.toLocaleDateString(undefined, { month: 'long' })
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' })
  const date = `${month} ${now.getDate()} (${weekday})`
  const newNoticePath = notificationIcons.newNotice.sourcePath

  return (
    <div className="preview-lockscreen">
      {lockscreenImage.sourcePath ? (
        lockscreenImage.fitMode === 'crop' ? (
          <CroppedImageLayer
            className="preview-bg-image"
            sourcePath={lockscreenImage.sourcePath}
            crop={lockscreenImage.crop}
          />
        ) : (
          <img className="preview-bg-image" src={toFileUrl(lockscreenImage.sourcePath)} alt="" />
        )
      ) : (
        <div className="preview-bg-placeholder">
          <span>LOCKSCREEN IMAGE · 960 × 512</span>
        </div>
      )}
      <div className="preview-scrim" />

      <div className="preview-clock" style={clockAlignStyle(clock.position)}>
        <div className="preview-clock-date" style={{ color: `#${clock.color}` }}>
          {date}
        </div>
        <div className="preview-clock-time" style={{ color: `#${clock.color}` }}>
          {time}
        </div>
      </div>

      <div className="preview-bubble" style={{ background: `#${notificationColors.boxColor}` }}>
        <div className="preview-bubble-icon">
          {newNoticePath ? (
            <img src={toFileUrl(newNoticePath)} alt="" />
          ) : (
            <span style={{ color: `#${notificationColors.textColor}` }}>✉</span>
          )}
        </div>
        <div className="preview-bubble-text" style={{ color: `#${notificationColors.textColor}` }}>
          This is a sample notification
        </div>
      </div>

      <div className="preview-unlock-handle" />

      <img className="preview-lockscreen-overlay" src={lockscreenOverlayUrl} alt="" />
    </div>
  )
}
