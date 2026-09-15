/**
 * The app's entry screen — replaces booting straight into a blank "Untitled
 * Theme". Four ways in: start a new theme, open an existing project file,
 * build a standalone icon set, or manage what's already been built. No
 * domain logic here, just navigation + the existing Open-project IPC round
 * trip (same `dialog:pickProjectOpenPath` / `project:loadThemeProject`
 * channels TopBar's own Open button uses).
 */
import { useState } from 'react'
import type { ThemeProject } from '@shared/types'
import { cleanIpcErrorMessage } from '../lib/uiHelpers'

export function LandingPage({
  onCreateTheme,
  onThemeLoaded,
  onCreateIconSet,
  onManageThemes
}: {
  onCreateTheme: () => void
  onThemeLoaded: (project: ThemeProject) => void
  onCreateIconSet: () => void
  onManageThemes: () => void
}): React.JSX.Element {
  const [status, setStatus] = useState<string | null>(null)

  const handleLoadTheme = async (): Promise<void> => {
    setStatus(null)
    const path = await window.api.pickProjectOpenPath()
    if (!path) return
    try {
      const opened = await window.api.loadThemeProject(path)
      onThemeLoaded(opened)
    } catch (error) {
      setStatus(`Open failed: ${cleanIpcErrorMessage(error)}`)
    }
  }

  return (
    <div className="landing">
      <div className="landing-mark" />
      <h1 className="landing-title">Vita Theme Creator</h1>
      <p className="landing-subtitle">
        Build a PS Vita LiveArea theme, put together a system icon set, or manage what you&apos;ve
        already made.
      </p>

      <div className="landing-grid">
        <button type="button" className="landing-card" onClick={onCreateTheme}>
          <span className="landing-card-glyph">✦</span>
          <span className="landing-card-title">Create theme</span>
          <span className="landing-card-desc">Start a new blank theme project.</span>
        </button>
        <button type="button" className="landing-card" onClick={() => void handleLoadTheme()}>
          <span className="landing-card-glyph">▤</span>
          <span className="landing-card-title">Load / edit theme</span>
          <span className="landing-card-desc">Open an existing theme project file.</span>
        </button>
        <button type="button" className="landing-card" onClick={onCreateIconSet}>
          <span className="landing-card-glyph">⬚</span>
          <span className="landing-card-title">Create icon set</span>
          <span className="landing-card-desc">Build a standalone 17-icon system set.</span>
        </button>
        <button type="button" className="landing-card" onClick={onManageThemes}>
          <span className="landing-card-glyph">☰</span>
          <span className="landing-card-title">Manage created themes</span>
          <span className="landing-card-desc">
            Edit, delete, or re-export themes you&apos;ve built.
          </span>
        </button>
      </div>

      {status && <div className="export-notice export-notice-error landing-status">{status}</div>}
    </div>
  )
}
