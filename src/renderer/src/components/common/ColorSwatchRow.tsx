import type { HexColor6 } from '@shared/types'

interface ColorSwatchRowProps {
  label: string
  value: HexColor6
  presets: readonly HexColor6[]
  onChange: (value: HexColor6) => void
  size?: number
}

/** A row of quick-pick color swatches plus a native picker for any 24-bit value. */
export function ColorSwatchRow({
  label,
  value,
  presets,
  onChange,
  size = 26
}: ColorSwatchRowProps): React.JSX.Element {
  return (
    <div className="swatch-row-field">
      <span className="field-label">{label}</span>
      <div className="swatch-row">
        {presets.map((hex) => (
          <button
            key={hex}
            type="button"
            className="swatch"
            aria-label={`#${hex}`}
            style={{
              width: size,
              height: size,
              background: `#${hex}`,
              boxShadow:
                value.toLowerCase() === hex.toLowerCase()
                  ? '0 0 0 2px #0b1a2c, 0 0 0 3.5px var(--accent), 0 0 18px rgba(0,210,255,.5)'
                  : 'inset 0 0 0 1px rgba(255,255,255,.14)'
            }}
            onClick={() => onChange(hex)}
          />
        ))}
        <label className="swatch swatch-custom" style={{ width: size, height: size }}>
          <input
            type="color"
            value={`#${value}`}
            onChange={(e) => onChange(e.target.value.replace('#', ''))}
          />
        </label>
        <span className="swatch-hex">#{value}</span>
      </div>
    </div>
  )
}
