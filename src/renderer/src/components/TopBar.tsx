/**
 * App chrome: brand mark, the open project's name/version, and the
 * Open/Save/Build actions. Open and Save round-trip through the real
 * `project:*` and `dialog:*` IPC channels (projectPersistence.ts, dialogs.ts)
 * — there is no autosave/undo history in this app, so this bar doesn't
 * pretend to have one.
 */
import { useRef, useState } from 'react'
import { useThemeProject } from '../state/useThemeProject'

export function TopBar({
  onBuildExport,
  onHome
}: {
  onBuildExport: () => void
  onHome: () => void
}): React.JSX.Element {
  const { project, loadProject } = useThemeProject()
  const [status, setStatus] = useState<string | null>(null)
  const lastPathRef = useRef<string | null>(null)
  const statusTimer = useRef<number | null>(null)

  const flash = (message: string): void => {
    setStatus(message)
    if (statusTimer.current) window.clearTimeout(statusTimer.current)
    statusTimer.current = window.setTimeout(() => setStatus(null), 3500)
  }

  const handleOpen = async (): Promise<void> => {
    const path = await window.api.pickProjectOpenPath()
    if (!path) return
    try {
      const opened = await window.api.loadThemeProject(path)
      loadProject(opened)
      lastPathRef.current = path
      flash(`Opened ${opened.meta.name}`)
    } catch (error) {
      flash(`Open failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleSave = async (): Promise<void> => {
    let path = lastPathRef.current
    if (!path) {
      path = await window.api.pickProjectSavePath(project.meta.name || 'Untitled Theme')
      if (!path) return
      lastPathRef.current = path
    }
    try {
      await window.api.saveThemeProject(project, path)
      flash('Saved')
    } catch (error) {
      flash(`Save failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-mark" />
        <div className="topbar-title">Vita Theme Creator</div>
        <div className="topbar-divider" />
        <div className="topbar-badge">
          <span className="topbar-badge-label">theme</span>
          <span className="topbar-badge-name">{project.meta.name}</span>
          <span className="topbar-badge-version">v{project.meta.version}</span>
        </div>
        {status && <div className="topbar-status">{status}</div>}
      </div>
      <div className="topbar-right">
        <button type="button" className="topbar-button" onClick={onHome}>
          ← Library
        </button>
        <button type="button" className="topbar-button" onClick={() => void handleOpen()}>
          Open
        </button>
        <button type="button" className="topbar-button" onClick={() => void handleSave()}>
          Save
        </button>
        <button type="button" className="topbar-button-primary" onClick={onBuildExport}>
          Build &amp; Export
        </button>
      </div>
    </div>
  )
}
