import type { HexColor6 } from '@shared/types'

/** Binds a native color input to a bare 6-hex-digit `HexColor6` (no `#`). */
interface HexColorFieldProps {
  label: string
  value: HexColor6
  onChange: (value: HexColor6) => void
}

export function HexColorField({ label, value, onChange }: HexColorFieldProps): React.JSX.Element {
  return (
    <label className="field field-inline">
      <span className="field-label">{label}</span>
      <input
        type="color"
        value={`#${value}`}
        onChange={(e) => onChange(e.target.value.replace('#', ''))}
      />
    </label>
  )
}
