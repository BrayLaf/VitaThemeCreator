/**
 * Editor panel for the 17 fixed system icon slots. Each icon is a glyph
 * overlay composited over a chosen background, output 128×128 (report §4;
 * ICON_DIMENSIONS). Glyph-style and background-swatch options are the real
 * bundled asset names under resources/themebuilder-assets/iconBuilder/ —
 * see data/icons.ts.
 */
import { useState } from 'react'
import { ICON_DIMENSIONS, ICON_SLOT_KEYS, type IconSlotKey } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { IconChoiceEditor } from '../common/IconChoiceEditor'
import { IconTile } from '../common/IconTile'
import { ICON_LABELS } from '../../data/icons'

export function SystemIconsPanel(): React.JSX.Element {
  const [selected, setSelected] = useState<IconSlotKey>(ICON_SLOT_KEYS[0])
  const { project, setIconChoice } = useThemeProject()
  const choice = project.iconSet[selected]

  const applyToAllIcons = (): void => {
    for (const slot of ICON_SLOT_KEYS) {
      if (slot === selected) continue
      setIconChoice(slot, { ...choice })
    }
  }

  return (
    <section className="panel">
      <h2>System Icons</h2>
      <p className="panel-description">
        17 fixed app slots, {ICON_DIMENSIONS.width}×{ICON_DIMENSIONS.height} each.
      </p>

      <div className="chip-grid chip-grid-4">
        {ICON_SLOT_KEYS.map((slot) => {
          const on = slot === selected
          return (
            <button
              key={slot}
              type="button"
              className={on ? 'icon-chip icon-chip-active' : 'icon-chip'}
              onClick={() => setSelected(slot)}
            >
              <IconTile slot={slot} choice={project.iconSet[slot]} className="icon-chip-tile" />
              <span>{ICON_LABELS[slot]}</span>
            </button>
          )
        })}
      </div>

      <div className="icon-editor">
        <div className="icon-editor-title">{ICON_LABELS[selected]} icon</div>

        <IconChoiceEditor choice={choice} onChange={(next) => setIconChoice(selected, next)} />

        <button type="button" className="hint-button" onClick={applyToAllIcons}>
          Copy this icon&apos;s style &amp; background to all 17 slots →
        </button>
      </div>
    </section>
  )
}
