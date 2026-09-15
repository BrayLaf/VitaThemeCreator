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
import { FileDropzone } from '../common/FileDropzone'
import {
  ICON_BACKGROUND_SWATCHES,
  ICON_GLYPHS,
  ICON_GLYPH_STYLES,
  ICON_LABELS,
  iconTileBackground
} from '../../data/icons'

export function SystemIconsPanel(): React.JSX.Element {
  const [selected, setSelected] = useState<IconSlotKey>(ICON_SLOT_KEYS[0])
  const { project, setIconChoice } = useThemeProject()
  const choice = project.iconSet[selected]

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
              <div className="icon-chip-tile" style={iconTileBackground(project.iconSet[slot])}>
                {ICON_GLYPHS[slot]}
              </div>
              <span>{ICON_LABELS[slot]}</span>
            </button>
          )
        })}
      </div>

      <div className="icon-editor">
        <div className="icon-editor-title">{ICON_LABELS[selected]} icon</div>

        <div className="panel-eyebrow">GLYPH STYLE</div>
        <div className="chip-row chip-row-wrap">
          {ICON_GLYPH_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              className={choice.glyphStyle === style ? 'chip chip-active' : 'chip'}
              onClick={() => setIconChoice(selected, { ...choice, glyphStyle: style })}
            >
              {style}
            </button>
          ))}
        </div>

        <div className="panel-eyebrow">BACKGROUND</div>
        <div className="swatch-row">
          {ICON_BACKGROUND_SWATCHES.map((swatch) => {
            const on = choice.background.kind === 'swatch' && choice.background.name === swatch.name
            return (
              <button
                key={swatch.name}
                type="button"
                className="swatch"
                title={swatch.label}
                style={{
                  width: 30,
                  height: 30,
                  background: swatch.hex ?? undefined,
                  backgroundImage: swatch.hex
                    ? undefined
                    : 'repeating-linear-gradient(45deg,#20242c 0 5px,#181b21 5px 10px)',
                  boxShadow: on
                    ? 'inset 0 0 0 2px #101318, 0 0 0 2px var(--accent)'
                    : 'inset 0 0 0 1px rgba(255,255,255,.14)'
                }}
                onClick={() =>
                  setIconChoice(selected, {
                    ...choice,
                    background: { kind: 'swatch', name: swatch.name }
                  })
                }
              />
            )
          })}
          <button
            type="button"
            className={choice.background.kind === 'custom' ? 'chip chip-active' : 'chip'}
            onClick={() =>
              setIconChoice(selected, {
                ...choice,
                background: {
                  kind: 'custom',
                  sourcePath:
                    choice.background.kind === 'custom' ? choice.background.sourcePath : ''
                }
              })
            }
          >
            Custom
          </button>
          <button type="button" className="chip chip-disabled" disabled title="Not implemented yet">
            Snapshot
          </button>
        </div>

        {choice.background.kind === 'custom' && (
          <FileDropzone
            label="Custom background image"
            kind="image"
            compact
            value={choice.background.sourcePath || null}
            onChange={(sourcePath) =>
              setIconChoice(selected, {
                ...choice,
                background: { kind: 'custom', sourcePath: sourcePath ?? '' }
              })
            }
          />
        )}
      </div>
    </section>
  )
}
