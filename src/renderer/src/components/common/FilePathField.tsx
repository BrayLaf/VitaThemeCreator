/**
 * Presentational stand-in for a real file picker. Used for both image and
 * audio source paths (`ImageSourceRef.sourcePath`, `AudioSourceConfig.sourcePath`).
 * No dialog, no file processing — a real native file-open dialog arrives
 * with the IPC wiring (step 5), backed by Electron's `dialog.showOpenDialog`
 * in the main process.
 */
interface FilePathFieldProps {
  label: string
  hint?: string
  value: string | null
  onChange: (path: string | null) => void
}

export function FilePathField({
  label,
  hint,
  value,
  onChange
}: FilePathFieldProps): React.JSX.Element {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      <input
        type="text"
        className="field-input"
        placeholder="No file selected"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value.length > 0 ? e.target.value : null)}
      />
    </label>
  )
}
