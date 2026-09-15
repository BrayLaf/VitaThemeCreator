/**
 * Load/save the app's own re-editable project state — the TypeScript
 * analogue of theme.ini.
 *
 * Report ref: §5 "theme.ini — ThemeBUILDER's own project/re-edit file". The
 * original stores this as a plain INI (`sg.UserSettings`) living alongside
 * the built theme assets and explicitly excluded from the exported zip
 * (Theme.py:2698-2728, 242-393, 1379). The rewrite uses plain JSON instead
 * of INI — no domain logic depends on the INI format itself, only on the
 * fields it holds (§5 section list) and the fact that it stays local to the
 * project folder and never ships.
 */
import { readFile, writeFile } from 'fs/promises'
import type { ThemeProject } from '@shared/types'

/** Bumped only if the on-disk project-file shape changes incompatibly. */
const PROJECT_FILE_FORMAT_VERSION = 1

interface ProjectFileEnvelope {
  formatVersion: number
  project: ThemeProject
}

/**
 * Reads a project's save-file back into a `ThemeProject` for re-editing.
 * Report ref: §5; Theme.py:242-393 (original "Load" flow).
 */
export async function loadThemeProject(projectFilePath: string): Promise<ThemeProject> {
  const raw = await readFile(projectFilePath, 'utf-8')
  const envelope = JSON.parse(raw) as ProjectFileEnvelope
  if (envelope.formatVersion !== PROJECT_FILE_FORMAT_VERSION) {
    throw new Error(
      `unsupported project file format version ${envelope.formatVersion} (expected ${PROJECT_FILE_FORMAT_VERSION})`
    )
  }
  return envelope.project
}

/**
 * Persists a `ThemeProject`'s editable state to disk. Never included in the
 * exported zip (§5; Theme.py:1379).
 */
export async function saveThemeProject(
  project: ThemeProject,
  projectFilePath: string
): Promise<void> {
  const envelope: ProjectFileEnvelope = { formatVersion: PROJECT_FILE_FORMAT_VERSION, project }
  await writeFile(projectFilePath, JSON.stringify(envelope, null, 2), 'utf-8')
}
