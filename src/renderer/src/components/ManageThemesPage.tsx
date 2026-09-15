/**
 * Landing page's "Manage created themes" view — lists every build folder
 * under `Created Themes/` (packaging.ts's `buildThemeFolder` destination,
 * read back via themeLibrary.ts's `listCreatedThemes`) with edit/export/
 * delete actions. Export re-zips the folder's already-built assets via the
 * same `packageTheme` call ExportPanel.tsx uses — no rebuild, just a fresh
 * zip, matching the "just creates a new zip file" ask.
 */
import { useEffect, useState } from 'react'
import type { CreatedThemeSummary, ThemeProject } from '@shared/types'
import { cleanIpcErrorMessage, toFileUrl } from '../lib/uiHelpers'

const CREATED_THEMES_DIR = 'Created Themes'
const EXPORTED_DIR = 'Exported'

type RowStatus =
  { kind: 'exporting' } | { kind: 'exported'; zipPath: string } | { kind: 'error'; message: string }

export function ManageThemesPage({
  onHome,
  onEditTheme
}: {
  onHome: () => void
  onEditTheme: (project: ThemeProject) => void
}): React.JSX.Element {
  const [themes, setThemes] = useState<CreatedThemeSummary[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({})

  const refresh = async (): Promise<void> => {
    try {
      const list = await window.api.listCreatedThemes(CREATED_THEMES_DIR)
      setThemes(list)
      setListError(null)
    } catch (error) {
      setListError(cleanIpcErrorMessage(error))
    }
  }

  useEffect(() => {
    let cancelled = false
    window.api
      .listCreatedThemes(CREATED_THEMES_DIR)
      .then((list) => {
        if (!cancelled) {
          setThemes(list)
          setListError(null)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setListError(cleanIpcErrorMessage(error))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setStatusFor = (buildFolderPath: string, status: RowStatus): void =>
    setRowStatus((prev) => ({ ...prev, [buildFolderPath]: status }))

  const handleEdit = async (theme: CreatedThemeSummary): Promise<void> => {
    try {
      const project = await window.api.loadThemeProject(theme.projectFilePath)
      onEditTheme(project)
    } catch (error) {
      setStatusFor(theme.buildFolderPath, { kind: 'error', message: cleanIpcErrorMessage(error) })
    }
  }

  const handleExport = async (theme: CreatedThemeSummary): Promise<void> => {
    setStatusFor(theme.buildFolderPath, { kind: 'exporting' })
    try {
      const result = await window.api.packageTheme(theme.buildFolderPath, EXPORTED_DIR)
      setStatusFor(theme.buildFolderPath, { kind: 'exported', zipPath: result.zipPath })
    } catch (error) {
      setStatusFor(theme.buildFolderPath, { kind: 'error', message: cleanIpcErrorMessage(error) })
    }
  }

  const handleDelete = async (theme: CreatedThemeSummary): Promise<void> => {
    try {
      await window.api.deleteCreatedTheme(theme.buildFolderPath)
      setConfirmingDelete(null)
      await refresh()
    } catch (error) {
      setStatusFor(theme.buildFolderPath, { kind: 'error', message: cleanIpcErrorMessage(error) })
    }
  }

  return (
    <div className="library">
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-mark" />
          <div className="topbar-title">Created Themes</div>
        </div>
        <div className="topbar-right">
          <button type="button" className="topbar-button" onClick={onHome}>
            ← Library
          </button>
        </div>
      </div>

      <div className="library-body">
        {listError && <div className="export-notice export-notice-error">{listError}</div>}
        {themes === null && !listError && <p className="panel-description">Loading…</p>}
        {themes !== null && themes.length === 0 && (
          <p className="panel-description">
            No built themes yet — build one from the editor&apos;s Export panel first.
          </p>
        )}

        <div className="library-grid">
          {themes?.map((theme) => {
            const status = rowStatus[theme.buildFolderPath]
            return (
              <div key={theme.buildFolderPath} className="library-card">
                <div className="library-card-thumb">
                  {theme.thumbnailPath ? (
                    <img src={toFileUrl(theme.thumbnailPath)} alt="" />
                  ) : (
                    <div className="library-card-thumb-placeholder" />
                  )}
                </div>
                <div className="library-card-body">
                  <div className="library-card-name">{theme.name}</div>
                  <div className="library-card-meta">
                    v{theme.version} · {theme.creator || 'Unknown creator'}
                  </div>
                  <div className="library-card-meta">
                    {new Date(theme.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="library-card-actions">
                  <button
                    type="button"
                    className="topbar-button"
                    onClick={() => void handleEdit(theme)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="topbar-button"
                    onClick={() => void handleExport(theme)}
                  >
                    Export
                  </button>
                  {confirmingDelete === theme.buildFolderPath ? (
                    <>
                      <button
                        type="button"
                        className="topbar-button-danger"
                        onClick={() => void handleDelete(theme)}
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        className="topbar-button"
                        onClick={() => setConfirmingDelete(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="topbar-button"
                      onClick={() => setConfirmingDelete(theme.buildFolderPath)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                {status?.kind === 'exporting' && <div className="panel-status">Exporting…</div>}
                {status?.kind === 'exported' && (
                  <div className="export-notice export-notice-success">
                    Exported to{' '}
                    <button
                      type="button"
                      className="export-notice-link"
                      onClick={() => void window.api.revealFile(status.zipPath)}
                    >
                      {status.zipPath}
                    </button>
                  </div>
                )}
                {status?.kind === 'error' && (
                  <div className="export-notice export-notice-error">{status.message}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
