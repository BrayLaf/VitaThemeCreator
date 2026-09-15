/**
 * Editor panel for the clock position/color and the status bar colors.
 * Notification-bubble colors live on the Lockscreen panel instead, next to
 * the bubble icon images they're shown with. Report §5
 * <StartScreenProperty> / <InfomationBarProperty>.
 */
import type { ClockPosition } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { ColorSwatchRow } from '../common/ColorSwatchRow'
import { CLOCK_COLOR_PRESETS, STATUS_BG_PRESETS, STATUS_FG_PRESETS } from '../../data/colorPresets'

const CLOCK_POSITIONS: { id: ClockPosition; label: string; dot: React.CSSProperties }[] = [
  { id: 0, label: 'Bottom left', dot: { bottom: '5px', left: '5px' } },
  { id: 1, label: 'Top left', dot: { top: '5px', left: '5px' } },
  { id: 2, label: 'Bottom right', dot: { bottom: '5px', right: '5px' } }
]

export function ColorSettingsPanel(): React.JSX.Element {
  const { project, setClock, setInfoBarColors } = useThemeProject()

  return (
    <section className="panel">
      <h2>Colors &amp; Clock</h2>
      <p className="panel-description">
        Overlay colors used across the lockscreen and the status bar.
      </p>

      <div className="panel-eyebrow">CLOCK POSITION</div>
      <div className="clock-position-grid">
        {CLOCK_POSITIONS.map((p) => {
          const on = project.clock.position === p.id
          return (
            <button
              key={p.id}
              type="button"
              className={on ? 'clock-position clock-position-active' : 'clock-position'}
              onClick={() => setClock({ position: p.id })}
            >
              <div className="clock-position-map">
                <div
                  className="clock-position-dot"
                  style={{ ...p.dot, background: on ? 'var(--accent)' : '#3a404b' }}
                />
              </div>
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>

      <ColorSwatchRow
        label="Clock color"
        value={project.clock.color}
        presets={CLOCK_COLOR_PRESETS}
        onChange={(color) => setClock({ color })}
      />

      <div className="panel-divider" />

      <div className="panel-eyebrow">STATUS BAR</div>
      <div className="two-col">
        <ColorSwatchRow
          label="Fill"
          value={project.infoBarColors.barColor}
          presets={STATUS_BG_PRESETS}
          onChange={(barColor) => setInfoBarColors({ barColor })}
        />
        <ColorSwatchRow
          label="Icons & text"
          value={project.infoBarColors.indicatorColor}
          presets={STATUS_FG_PRESETS}
          onChange={(indicatorColor) => setInfoBarColors({ indicatorColor })}
        />
      </div>
    </section>
  )
}
