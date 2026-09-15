import { useEffect, useState } from 'react'
import type { PageIndex, ThemeProject } from '@shared/types'
import { LockscreenPreview } from './LockscreenPreview'
import { HomePreview } from './HomePreview'

export type PreviewTab = 'lock' | 'home'

const TABS: { id: PreviewTab; label: string }[] = [
  { id: 'lock', label: 'Lockscreen' },
  { id: 'home', label: 'Home page' }
]

export function DevicePreview({
  project,
  tab,
  onTabChange,
  selectedPage,
  onSelectPage
}: {
  project: ThemeProject
  tab: PreviewTab
  onTabChange: (tab: PreviewTab) => void
  selectedPage: PageIndex
  onSelectPage: (page: PageIndex) => void
}): React.JSX.Element {
  const [now, setNow] = useState(() => new Date())
  const [showIcons, setShowIcons] = useState(true)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="preview-column">
      <div className="preview-toolbar">
        <div className="preview-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === tab ? 'preview-tab preview-tab-active' : 'preview-tab'}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'home' && (
          <label className="preview-icon-toggle">
            <input
              type="checkbox"
              checked={showIcons}
              onChange={(e) => setShowIcons(e.target.checked)}
            />
            Show icons
          </label>
        )}
      </div>

      <div className="preview-frame">
        <div className="preview-screen">
          {tab === 'lock' ? (
            <LockscreenPreview project={project} now={now} />
          ) : (
            <HomePreview
              project={project}
              now={now}
              selectedPage={selectedPage}
              onSelectPage={onSelectPage}
              showIcons={showIcons}
            />
          )}
        </div>
      </div>

      <div className="preview-caption">
        <span>960 × 544 · live preview</span>
        <span className="preview-caption-dot" />
        <span>
          {tab === 'lock'
            ? `clock ${['bottom left', 'top left', 'bottom right'][project.clock.position]}`
            : `page ${selectedPage} of 10 · wave ${project.pages[selectedPage - 1].colors.waveType}`}
        </span>
      </div>
    </div>
  )
}
