/**
 * A drop target + native "browse" button for an image or audio source path
 * (`ImageSourceRef.sourcePath` / `AudioSourceConfig.sourcePath`). Backed by
 * the real `dialog:pick*File` IPC channels and by reading a dropped File's
 * `.path` (an Electron-specific extension present because context isolation
 * still exposes the real filesystem path on drag-and-drop).
 */
import { useState, type DragEvent } from 'react'
import { basename, droppedFilePath, toFileUrl } from '../../lib/uiHelpers'

interface FileDropzoneProps {
  label: string
  hint?: string
  value: string | null
  kind: 'image' | 'audio'
  onChange: (path: string | null) => void
  compact?: boolean
}

export function FileDropzone({
  label,
  hint,
  value,
  kind,
  onChange,
  compact
}: FileDropzoneProps): React.JSX.Element {
  const [dragOver, setDragOver] = useState(false)

  const browse = async (): Promise<void> => {
    const path =
      kind === 'image' ? await window.api.pickImageFile() : await window.api.pickAudioFile()
    if (path) onChange(path)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    const path = file ? droppedFilePath(file) : null
    if (path) onChange(path)
  }

  const classes = [
    'dropzone',
    compact ? 'dropzone-compact' : '',
    dragOver ? 'dropzone-active' : '',
    value ? 'dropzone-filled' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="dropzone-field">
      <div className="dropzone-label-row">
        {label && <span className="field-label">{label}</span>}
        {value && (
          <button
            type="button"
            className="dropzone-clear"
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
            }}
          >
            Clear
          </button>
        )}
      </div>
      <div
        className={classes}
        role="button"
        tabIndex={0}
        onClick={() => void browse()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') void browse()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {value && kind === 'image' ? (
          <img className="dropzone-preview" src={toFileUrl(value)} alt="" />
        ) : value ? (
          <div className="dropzone-filename">♪ {basename(value)}</div>
        ) : (
          <>
            <div className="dropzone-cta">
              Drop {kind === 'image' ? 'an image' : 'an audio file'} or browse
            </div>
            {hint && <div className="dropzone-hint">{hint}</div>}
          </>
        )}
      </div>
    </div>
  )
}
