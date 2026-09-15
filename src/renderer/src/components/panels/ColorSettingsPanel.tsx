/**
 * Editor panel for global (non-page-specific) colors and the clock
 * position. Per-page colors live in PageBackgroundsPanel instead (they're
 * 1:1 with a page). Report §5 <StartScreenProperty> / <InfomationBarProperty>.
 */
import { CLOCK_POSITION_LABELS, type ClockPosition } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { HexColorField } from '../common/HexColorField'

const CLOCK_POSITIONS = Object.keys(CLOCK_POSITION_LABELS).map(Number) as ClockPosition[]

export function ColorSettingsPanel(): React.JSX.Element {
  const { project, setClock, setNotificationColors, setInfoBarColors } = useThemeProject()

  return (
    <section className="panel">
      <h2>Colors &amp; Clock</h2>

      <div className="panel-subsection">
        <h3>Clock</h3>
        <HexColorField
          label="Clock color"
          value={project.clock.color}
          onChange={(color) => setClock({ color })}
        />
        <label className="field field-inline">
          <span className="field-label">Position</span>
          <select
            value={project.clock.position}
            onChange={(e) => setClock({ position: Number(e.target.value) as ClockPosition })}
          >
            {CLOCK_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {CLOCK_POSITION_LABELS[position]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel-subsection">
        <h3>Notification bubble</h3>
        <HexColorField
          label="Box color"
          value={project.notificationColors.boxColor}
          onChange={(boxColor) => setNotificationColors({ boxColor })}
        />
        <HexColorField
          label="Text color"
          value={project.notificationColors.textColor}
          onChange={(textColor) => setNotificationColors({ textColor })}
        />
      </div>

      <div className="panel-subsection">
        <h3>Status bar</h3>
        <HexColorField
          label="Bar color"
          value={project.infoBarColors.barColor}
          onChange={(barColor) => setInfoBarColors({ barColor })}
        />
        <HexColorField
          label="Indicator color"
          value={project.infoBarColors.indicatorColor}
          onChange={(indicatorColor) => setInfoBarColors({ indicatorColor })}
        />
      </div>
    </section>
  )
}
