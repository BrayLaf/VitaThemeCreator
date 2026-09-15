import { useState } from 'react'
import { LockscreenPanel } from './panels/LockscreenPanel'
import { PageBackgroundsPanel } from './panels/PageBackgroundsPanel'
import { NotificationIconsPanel } from './panels/NotificationIconsPanel'
import { SystemIconsPanel } from './panels/SystemIconsPanel'
import { ColorSettingsPanel } from './panels/ColorSettingsPanel'
import { AudioPanel } from './panels/AudioPanel'
import { ExportPanel } from './panels/ExportPanel'

const TABS = [
  { id: 'lockscreen', label: 'Lockscreen', panel: LockscreenPanel },
  { id: 'pages', label: 'Page Backgrounds', panel: PageBackgroundsPanel },
  { id: 'notifications', label: 'Notification Icons', panel: NotificationIconsPanel },
  { id: 'icons', label: 'System Icons', panel: SystemIconsPanel },
  { id: 'colors', label: 'Colors & Clock', panel: ColorSettingsPanel },
  { id: 'audio', label: 'Audio', panel: AudioPanel },
  { id: 'export', label: 'Export', panel: ExportPanel }
] as const

type TabId = (typeof TABS)[number]['id']

export function EditorShell(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('lockscreen')
  const ActivePanel = TABS.find((tab) => tab.id === activeTab)?.panel ?? LockscreenPanel

  return (
    <div className="editor-shell">
      <nav className="editor-nav">
        <div className="editor-nav-title">Vita Theme Creator</div>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'nav-item nav-item-active' : 'nav-item'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="editor-content">
        <ActivePanel />
      </main>
    </div>
  )
}
