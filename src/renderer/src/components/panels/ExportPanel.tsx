/**
 * Export panel — theme metadata, the two export-time-only image slots
 * (package thumbnail §2, VitaShell preview screenshots §2), and the build
 * trigger. Report §6: build folder → zip. The button calls the real IPC
 * channels (`window.api.buildThemeFolder`/`packageTheme`, step 5) — they
 * still reject with "not implemented" since the main-process modules
 * (step 3) are stubs, but the full renderer→preload→main round trip is real.
 */
import { useState } from 'react'
import type { PackageThumbnailMode, PreviewScreenshotSource } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FilePathField } from '../common/FilePathField'

const THUMBNAIL_MODE_LABELS: Record<PackageThumbnailMode, string> = {
  'auto-collage': 'Auto-generate from page thumbnails',
  'custom-image': 'Custom image',
  'live-capture': 'Capture live preview'
}

const PREVIEW_SOURCE_LABELS: Record<PreviewScreenshotSource, string> = {
  generated: 'Generate from current art',
  'captured-from-device': 'Capture from a connected Vita'
}

export function ExportPanel(): React.JSX.Element {
  const { project, setMeta, setPackageThumbnail, setPreviewScreenshots } = useThemeProject()
  const [status, setStatus] = useState<string | null>(null)

  const handleExport = async (): Promise<void> => {
    setStatus('Building…')
    try {
      const buildFolderPath = await window.api.buildThemeFolder(project, 'Created Themes')
      await window.api.packageTheme(buildFolderPath, 'Exported')
      setStatus('Exported.')
    } catch (error) {
      setStatus(`Not ready yet: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <section className="panel">
      <h2>Export</h2>

      <div className="panel-subsection">
        <h3>Theme details</h3>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            type="text"
            value={project.meta.name}
            onChange={(e) => setMeta({ name: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field-label">Creator</span>
          <input
            type="text"
            value={project.meta.creator}
            onChange={(e) => setMeta({ creator: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="field-label">Version</span>
          <input
            type="text"
            value={project.meta.version}
            onChange={(e) => setMeta({ version: e.target.value })}
          />
        </label>
      </div>

      <div className="panel-subsection">
        <h3>Store thumbnail (226×128)</h3>
        <label className="field field-inline">
          <span className="field-label">Mode</span>
          <select
            value={project.packageThumbnail.mode}
            onChange={(e) => setPackageThumbnail({ mode: e.target.value as PackageThumbnailMode })}
          >
            {(Object.keys(THUMBNAIL_MODE_LABELS) as PackageThumbnailMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {THUMBNAIL_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </label>
        {project.packageThumbnail.mode === 'custom-image' && (
          <FilePathField
            label="Custom thumbnail image"
            value={project.packageThumbnail.customImage?.sourcePath ?? null}
            onChange={(sourcePath) => setPackageThumbnail({ customImage: { sourcePath } })}
          />
        )}
      </div>

      <div className="panel-subsection">
        <h3>VitaShell preview screenshots (480×272)</h3>
        <label className="field field-inline">
          <span className="field-label">Source</span>
          <select
            value={project.previewScreenshots.source}
            onChange={(e) =>
              setPreviewScreenshots({ source: e.target.value as PreviewScreenshotSource })
            }
          >
            {(Object.keys(PREVIEW_SOURCE_LABELS) as PreviewScreenshotSource[]).map((source) => (
              <option key={source} value={source}>
                {PREVIEW_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel-subsection">
        <button type="button" onClick={() => void handleExport()}>
          Build &amp; Export Theme
        </button>
        {status && <p className="panel-status">{status}</p>}
      </div>
    </section>
  )
}
