import { useState } from 'react'
import type { PageIndex } from '@shared/types'
import { TopBar } from './TopBar'
import { SectionNav, type SectionDef } from './SectionNav'
import { DevicePreview, type PreviewTab } from './preview/DevicePreview'
import { LockscreenPanel } from './panels/LockscreenPanel'
import { PageBackgroundsPanel } from './panels/PageBackgroundsPanel'
import { SystemIconsPanel } from './panels/SystemIconsPanel'
import { ColorSettingsPanel } from './panels/ColorSettingsPanel'
import { AudioPanel } from './panels/AudioPanel'
import { ExportPanel } from './panels/ExportPanel'
import { useThemeProject } from '../state/useThemeProject'
import {
  LockscreenSectionIcon,
  PagesSectionIcon,
  SystemIconsSectionIcon,
  ColorsClockSectionIcon,
  AudioSectionIcon,
  ExportSectionIcon
} from './common/Icons'

type SectionId = 'lock' | 'pages' | 'icons' | 'colors' | 'audio' | 'export'

const SECTIONS: readonly SectionDef<SectionId>[] = [
  { id: 'lock', icon: LockscreenSectionIcon, label: 'Lockscreen' },
  { id: 'pages', icon: PagesSectionIcon, label: 'Pages' },
  { id: 'icons', icon: SystemIconsSectionIcon, label: 'System Icons' },
  { id: 'colors', icon: ColorsClockSectionIcon, label: 'Colors & Clock' },
  { id: 'audio', icon: AudioSectionIcon, label: 'Audio' },
  { id: 'export', icon: ExportSectionIcon, label: 'Export' }
]

/** Sections that pin the live-preview tab to one side (matches what each section edits). */
const SECTION_PREVIEW_TAB: Partial<Record<SectionId, PreviewTab>> = {
  lock: 'lock',
  pages: 'home',
  icons: 'home'
}

export function EditorShell({ onHome }: { onHome: () => void }): React.JSX.Element {
  const { project } = useThemeProject()
  const [activeSection, setActiveSection] = useState<SectionId>('lock')
  const [previewTab, setPreviewTab] = useState<PreviewTab>('lock')
  const [selectedPage, setSelectedPage] = useState<PageIndex>(1)

  const selectSection = (id: SectionId): void => {
    setActiveSection(id)
    const pinnedTab = SECTION_PREVIEW_TAB[id]
    if (pinnedTab) setPreviewTab(pinnedTab)
  }

  return (
    <div className="editor-shell">
      <TopBar onBuildExport={() => selectSection('export')} onHome={onHome} />
      <div className="editor-body">
        <SectionNav sections={SECTIONS} active={activeSection} onSelect={selectSection} />

        <div className="editor-content">
          {activeSection === 'lock' && <LockscreenPanel />}
          {activeSection === 'pages' && (
            <PageBackgroundsPanel selectedPage={selectedPage} onSelectPage={setSelectedPage} />
          )}
          {activeSection === 'icons' && <SystemIconsPanel />}
          {activeSection === 'colors' && <ColorSettingsPanel />}
          {activeSection === 'audio' && <AudioPanel />}
          {activeSection === 'export' && <ExportPanel />}
        </div>

        <div className="editor-preview">
          <DevicePreview
            project={project}
            tab={previewTab}
            onTabChange={setPreviewTab}
            selectedPage={selectedPage}
            onSelectPage={setSelectedPage}
          />
        </div>
      </div>
    </div>
  )
}
