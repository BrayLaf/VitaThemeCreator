import { useState } from 'react'
import type { ThemeProject } from '@shared/types'
import { ThemeProjectProvider } from './state/ThemeProjectProvider'
import { useThemeProject } from './state/useThemeProject'
import { createEmptyThemeProject } from './state/createEmptyThemeProject'
import { EditorShell } from './components/EditorShell'
import { LandingPage } from './components/LandingPage'
import { IconSetCreatorPage } from './components/IconSetCreatorPage'
import { ManageThemesPage } from './components/ManageThemesPage'

type View = 'landing' | 'editor' | 'icon-set' | 'manage'

/** Routes between the landing page and the app's three destinations — no persistence of its own, just picks which screen owns the shared `ThemeProjectProvider` state. */
function AppShell(): React.JSX.Element {
  const { loadProject } = useThemeProject()
  const [view, setView] = useState<View>('landing')

  const goHome = (): void => setView('landing')

  const handleCreateTheme = (): void => {
    loadProject(createEmptyThemeProject())
    setView('editor')
  }

  const handleThemeLoaded = (project: ThemeProject): void => {
    loadProject(project)
    setView('editor')
  }

  if (view === 'editor') return <EditorShell onHome={goHome} />
  if (view === 'icon-set') return <IconSetCreatorPage onHome={goHome} />
  if (view === 'manage') return <ManageThemesPage onHome={goHome} onEditTheme={handleThemeLoaded} />

  return (
    <LandingPage
      onCreateTheme={handleCreateTheme}
      onThemeLoaded={handleThemeLoaded}
      onCreateIconSet={() => setView('icon-set')}
      onManageThemes={() => setView('manage')}
    />
  )
}

function App(): React.JSX.Element {
  return (
    <ThemeProjectProvider>
      <AppShell />
    </ThemeProjectProvider>
  )
}

export default App
