/**
 * Editor panel for the 17 fixed system icon slots. Each icon is a glyph
 * style composited over a chosen background, output 128×128 (report §4;
 * ICON_DIMENSIONS). Produces the `IconSet/<name>/icon_*.png` folder that
 * `generateIconSet()` (main-process stub) will eventually build.
 */
import {
  ICON_DIMENSIONS,
  ICON_SLOT_KEYS,
  type IconBackgroundChoice,
  type IconSlotKey
} from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'

function IconSlotEditor({ slot }: { slot: IconSlotKey }): React.JSX.Element {
  const { project, setIconChoice } = useThemeProject()
  const choice = project.iconSet[slot]

  const setBackground = (background: IconBackgroundChoice): void =>
    setIconChoice(slot, { ...choice, background })

  return (
    <div className="icon-slot">
      <span className="icon-slot-name">{slot}</span>
      <label className="field field-inline">
        <span className="field-label">Glyph style</span>
        <input
          type="text"
          value={choice.glyphStyle}
          onChange={(e) => setIconChoice(slot, { ...choice, glyphStyle: e.target.value })}
        />
      </label>
      <label className="field field-inline">
        <span className="field-label">Background</span>
        <select
          value={choice.background.kind}
          onChange={(e) => {
            const kind = e.target.value as IconBackgroundChoice['kind']
            if (kind === 'swatch') setBackground({ kind: 'swatch', name: '' })
            else if (kind === 'custom') setBackground({ kind: 'custom', sourcePath: '' })
            else setBackground({ kind: 'snapshot' })
          }}
        >
          <option value="swatch">Swatch</option>
          <option value="custom">Custom image</option>
          <option value="snapshot">Snapshot</option>
        </select>
      </label>
      {choice.background.kind === 'swatch' && (
        <input
          type="text"
          placeholder="Swatch name"
          value={choice.background.name}
          onChange={(e) => setBackground({ kind: 'swatch', name: e.target.value })}
        />
      )}
      {choice.background.kind === 'custom' && (
        <input
          type="text"
          placeholder="No file selected"
          value={choice.background.sourcePath}
          onChange={(e) => setBackground({ kind: 'custom', sourcePath: e.target.value })}
        />
      )}
    </div>
  )
}

export function SystemIconsPanel(): React.JSX.Element {
  return (
    <section className="panel">
      <h2>System Icons</h2>
      <p className="panel-description">
        17 fixed slots, {ICON_DIMENSIONS.width}×{ICON_DIMENSIONS.height} each.
      </p>
      <div className="icon-grid">
        {ICON_SLOT_KEYS.map((slot) => (
          <IconSlotEditor key={slot} slot={slot} />
        ))}
      </div>
    </section>
  )
}
