import { ThemeProjectProvider } from './state/ThemeProjectProvider'
import { EditorShell } from './components/EditorShell'

function App(): React.JSX.Element {
  return (
    <ThemeProjectProvider>
      <EditorShell />
    </ThemeProjectProvider>
  )
}

export default App
