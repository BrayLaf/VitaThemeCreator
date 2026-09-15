/**
 * Export panel — theme metadata, the two export-time-only image slots
 * (package thumbnail §2, VitaShell preview screenshots §2), and the build
 * trigger. Report §6: build folder → zip (a plain zip, not a Vita-specific
 * container — see exportMeta.ts's BUILD_OUTPUT_FILENAME_CASING note, hence
 * "Build & Export .zip" below rather than ".vpk").
 */
import { useState } from 'react'
import type { PackageThumbnailMode, PreviewScreenshotSource } from '@shared/types'
import { useThemeProject } from '../../state/useThemeProject'
import { FileDropzone } from '../common/FileDropzone'

const THUMBNAIL_MODE_LABELS: Record<PackageThumbnailMode, string> = {
  'auto-collage': 'Auto-generate from page thumbnails',
  'custom-image': 'Custom image',
  'live-capture': 'Capture live preview'
}
const THUMBNAIL_MODE_IMPLEMENTED: Record<PackageThumbnailMode, boolean> = {
  'auto-collage': true,
  'custom-image': true,
  'live-capture': false
}

const PREVIEW_SOURCE_LABELS: Record<PreviewScreenshotSource, string> = {
  generated: 'Generate from current art',
  'captured-from-device': 'Capture from a connected Vita'
}
const PREVIEW_SOURCE_IMPLEMENTED: Record<PreviewScreenshotSource, boolean> = {
  generated: true,
  'captured-from-device': false
}

export function ExportPanel(): React.JSX.Element {
  const { project, setMeta, setPackageThumbnail, setPreviewScreenshots } = useThemeProject()
  const [status, setStatus] = useState<string | null>(null)

  const handleExport = async (): Promise<void> => {
    setStatus('Building…')
    try {
      const buildFolderPath = await window.api.buildThemeFolder(project, 'Created Themes')
      const result = await window.api.packageTheme(buildFolderPath, 'Exported')
      setStatus(`Exported to ${result.zipPath}`)
    } catch (error) {
      setStatus(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <section className="panel">
      <h2>Export</h2>
      <p className="panel-description">Packages everything into a theme .zip ready to install.</p>

      <div className="panel-eyebrow">THEME DETAILS</div>
      <label className="field">
        <span className="field-label">Theme name</span>
        <input
          type="text"
          className="field-input"
          value={project.meta.name}
          onChange={(e) => setMeta({ name: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-label">Creator</span>
        <input
          type="text"
          className="field-input"
          value={project.meta.creator}
          onChange={(e) => setMeta({ creator: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field-label">Version</span>
        <input
          type="text"
          className="field-input field-input-mono"
          value={project.meta.version}
          onChange={(e) => setMeta({ version: e.target.value })}
        />
      </label>

      <div className="panel-divider" />

      <div className="panel-eyebrow">STORE THUMBNAIL (226×128)</div>
      <div className="chip-row chip-row-wrap">
        {(Object.keys(THUMBNAIL_MODE_LABELS) as PackageThumbnailMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={!THUMBNAIL_MODE_IMPLEMENTED[mode]}
            className={
              project.packageThumbnail.mode === mode
                ? 'chip chip-active'
                : THUMBNAIL_MODE_IMPLEMENTED[mode]
                  ? 'chip'
                  : 'chip chip-disabled'
            }
            title={THUMBNAIL_MODE_IMPLEMENTED[mode] ? undefined : 'Not implemented yet'}
            onClick={() => setPackageThumbnail({ mode })}
          >
            {THUMBNAIL_MODE_LABELS[mode]}
          </button>
        ))}
      </div>
      {project.packageThumbnail.mode === 'custom-image' && (
        <FileDropzone
          label="Custom thumbnail image"
          kind="image"
          compact
          value={project.packageThumbnail.customImage?.sourcePath ?? null}
          onChange={(sourcePath) => setPackageThumbnail({ customImage: { sourcePath } })}
        />
      )}

      <div className="panel-divider" />

      <div className="panel-eyebrow">VITASHELL PREVIEW SCREENSHOTS (480×272)</div>
      <div className="chip-row chip-row-wrap">
        {(Object.keys(PREVIEW_SOURCE_LABELS) as PreviewScreenshotSource[]).map((source) => (
          <button
            key={source}
            type="button"
            disabled={!PREVIEW_SOURCE_IMPLEMENTED[source]}
            className={
              project.previewScreenshots.source === source
                ? 'chip chip-active'
                : PREVIEW_SOURCE_IMPLEMENTED[source]
                  ? 'chip'
                  : 'chip chip-disabled'
            }
            title={PREVIEW_SOURCE_IMPLEMENTED[source] ? undefined : 'Not implemented yet'}
            onClick={() => setPreviewScreenshots({ source })}
          >
            {PREVIEW_SOURCE_LABELS[source]}
          </button>
        ))}
      </div>

      <button type="button" className="export-button" onClick={() => void handleExport()}>
        Build &amp; Export .zip
      </button>
      {status && <p className="panel-status">{status}</p>}
    </section>
  )
}
