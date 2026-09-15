/**
 * Standalone system icon-set creator, reachable from the landing page
 * without opening a full theme project. Builds the same 17-slot
 * `IconSetSelection` the editor's `SystemIconsPanel` does and hands it to
 * the same `generateIconSet` main-process pipeline (iconGeneration.ts) —
 * only the destination differs: `Icon Sets/<SetName>/` instead of a theme's
 * build folder, since a standalone set isn't attached to any one theme.
 */
import { useState } from 'react'
import {
  ICON_DIMENSIONS,
  ICON_SLOT_KEYS,
  type IconSetSelection,
  type IconSlotKey
} from '@shared/types'
import { createEmptyIconSetSelection } from '../state/createEmptyThemeProject'
import { IconChoiceEditor } from './common/IconChoiceEditor'
import { IconTile } from './common/IconTile'
import { ICON_LABELS } from '../data/icons'
import { cleanIpcErrorMessage } from '../lib/uiHelpers'

/** Sibling of `Created Themes/`/`Exported/` — same "generated output, gitignored" convention (.gitignore). */
const ICON_SETS_DIR = 'Icon Sets'

type BuildStatus =
  { kind: 'building' } | { kind: 'success'; setDir: string } | { kind: 'error'; message: string }

export function IconSetCreatorPage({ onHome }: { onHome: () => void }): React.JSX.Element {
  const [setName, setSetName] = useState('My Icon Set')
  const [selection, setSelection] = useState<IconSetSelection>(createEmptyIconSetSelection)
  const [selected, setSelected] = useState<IconSlotKey>(ICON_SLOT_KEYS[0])
  const [status, setStatus] = useState<BuildStatus | null>(null)
  const choice = selection[selected]

  const setIconChoice = (slot: IconSlotKey, next: IconSetSelection[IconSlotKey]): void => {
    setSelection((prev) => ({ ...prev, [slot]: next }))
  }

  const applyToAllIcons = (): void => {
    setSelection((prev) => {
      const next = { ...prev }
      for (const slot of ICON_SLOT_KEYS) next[slot] = { ...choice }
      return next
    })
  }

  const handleGenerate = async (): Promise<void> => {
    setStatus({ kind: 'building' })
    try {
      const setDir = await window.api.generateIconSet(setName, selection, ICON_SETS_DIR)
      setStatus({ kind: 'success', setDir })
    } catch (error) {
      setStatus({ kind: 'error', message: cleanIpcErrorMessage(error) })
    }
  }

  return (
    <div className="editor-shell">
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-mark" />
          <div className="topbar-title">Vita Theme Creator</div>
          <div className="topbar-divider" />
          <div className="topbar-badge">
            <span className="topbar-badge-label">icon set</span>
            <span className="topbar-badge-name">{setName}</span>
          </div>
        </div>
        <div className="topbar-right">
          <button type="button" className="topbar-button" onClick={onHome}>
            ← Library
          </button>
        </div>
      </div>

      <div className="single-pane-body">
        <section className="panel">
          <h2>Create Icon Set</h2>
          <p className="panel-description">
            17 fixed app slots, {ICON_DIMENSIONS.width}×{ICON_DIMENSIONS.height} each — a standalone
            set you can reuse across themes, independent of any one project.
          </p>

          <label className="field">
            <span className="field-label">Set name</span>
            <input
              type="text"
              className="field-input"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
            />
          </label>

          <div className="chip-grid chip-grid-4">
            {ICON_SLOT_KEYS.map((slot) => {
              const on = slot === selected
              return (
                <button
                  key={slot}
                  type="button"
                  className={on ? 'icon-chip icon-chip-active' : 'icon-chip'}
                  onClick={() => setSelected(slot)}
                >
                  <IconTile slot={slot} choice={selection[slot]} className="icon-chip-tile" />
                  <span>{ICON_LABELS[slot]}</span>
                </button>
              )
            })}
          </div>

          <div className="icon-editor">
            <div className="icon-editor-title">{ICON_LABELS[selected]} icon</div>
            <IconChoiceEditor choice={choice} onChange={(next) => setIconChoice(selected, next)} />
            <button type="button" className="hint-button" onClick={applyToAllIcons}>
              Copy this icon&apos;s style &amp; background to all 17 slots →
            </button>
          </div>

          <button
            type="button"
            className="export-button"
            style={{ marginTop: 20 }}
            onClick={() => void handleGenerate()}
          >
            Generate Icon Set
          </button>
          {status?.kind === 'building' && <p className="panel-status">Building…</p>}
          {status?.kind === 'success' && (
            <div className="export-notice export-notice-success">
              Icon set created at {status.setDir}
            </div>
          )}
          {status?.kind === 'error' && (
            <div className="export-notice export-notice-error">
              <div className="export-notice-title">Generate failed</div>
              <div className="export-notice-message">{status.message}</div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
