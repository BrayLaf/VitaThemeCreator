import { useContext } from 'react'
import { ThemeProjectContext, type ThemeProjectContextValue } from './themeProjectContextValue'

export function useThemeProject(): ThemeProjectContextValue {
  const ctx = useContext(ThemeProjectContext)
  if (!ctx) throw new Error('useThemeProject must be used within a ThemeProjectProvider')
  return ctx
}
