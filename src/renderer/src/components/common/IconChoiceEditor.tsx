/**
 * The glyph-style + background controls for one icon slot's
 * `IconGenerationChoice` — shared by `SystemIconsPanel` (editing a theme
 * project's `iconSet`) and `IconSetCreatorPage` (editing a standalone
 * selection with no theme attached). Purely presentational: state lives with
 * the caller.
 */
import type { IconGenerationChoice } from '@shared/types'
import { ICON_BACKGROUND_SWATCHES, ICON_GLYPH_STYLES } from '../../data/icons'
import { FileDropzone } from './FileDropzone'

export function IconChoiceEditor({
  choice,
  onChange
}: {
  choice: IconGenerationChoice
  onChange: (next: IconGenerationChoice) => void
}): React.JSX.Element {
  return (
    <>
      <div className="panel-eyebrow">GLYPH STYLE</div>
      <div className="chip-row chip-row-wrap">
        {ICON_GLYPH_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            className={choice.glyphStyle === style ? 'chip chip-active' : 'chip'}
            onClick={() => onChange({ ...choice, glyphStyle: style })}
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
                  : 'repeating-linear-gradient(45deg,#0d2038 0 5px,#0a1730 5px 10px)',
                boxShadow: on
                  ? '0 0 0 2px #0b1a2c, 0 0 0 3.5px var(--accent), 0 0 18px rgba(0,210,255,.5)'
                  : 'inset 0 0 0 1px rgba(255,255,255,.14)'
              }}
              onClick={() =>
                onChange({ ...choice, background: { kind: 'swatch', name: swatch.name } })
              }
            />
          )
        })}
        <button
          type="button"
          className={choice.background.kind === 'custom' ? 'chip chip-active' : 'chip'}
          onClick={() =>
            onChange({
              ...choice,
              background: {
                kind: 'custom',
                sourcePath: choice.background.kind === 'custom' ? choice.background.sourcePath : ''
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
            onChange({ ...choice, background: { kind: 'custom', sourcePath: sourcePath ?? '' } })
          }
        />
      )}
    </>
  )
}
