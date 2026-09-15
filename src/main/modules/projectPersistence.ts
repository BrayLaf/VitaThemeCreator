/**
 * Load/save the app's own re-editable project state — the TypeScript
 * analogue of theme.ini.
 *
 * Report ref: §5 "theme.ini — ThemeBUILDER's own project/re-edit file". The
 * original stores this as a plain INI (`sg.UserSettings`) living alongside
 * the built theme assets and explicitly excluded from the exported zip
 * (Theme.py:2698-2728, 242-393, 1379). The rewrite can use plain JSON instead
 * of INI — no domain logic depends on the INI format itself, only on the
 * fields it holds (§5 section list) and the fact that it stays local to the
 * project folder and never ships.
 *
 * STUB MODULE — no real file I/O yet. All functions throw.
 */
import type { ThemeProject } from '@shared/types'

/**
 * Reads a project's save-file back into a `ThemeProject` for re-editing.
 * Report ref: §5; Theme.py:242-393 (original "Load" flow).
 */
export function loadThemeProject(_projectFilePath: string): Promise<ThemeProject> {
  throw new Error('not implemented: loadThemeProject')
}

/**
 * Persists a `ThemeProject`'s editable state to disk. Never included in the
 * exported zip (§5; Theme.py:1379).
 */
export function saveThemeProject(_project: ThemeProject, _projectFilePath: string): Promise<void> {
  throw new Error('not implemented: saveThemeProject')
}
