/**
 * Reads back the `Created Themes/` build-output directory (packaging.ts's
 * `buildThemeFolder` destination) for the landing page's "Manage created
 * themes" view, and deletes a built theme folder. Pure filesystem
 * bookkeeping around the existing build/export pipeline — no new domain
 * logic, no new on-disk format (a summary is derived from the same
 * `project.json` envelope `projectPersistence.ts` already reads/writes).
 */
import type { Dirent } from 'fs'
import { readdir, rm, stat } from 'fs/promises'
import { join, resolve } from 'path'
import type { CreatedThemeSummary } from '@shared/types'
import { loadThemeProject } from './projectPersistence'

const PROJECT_FILE_NAME = 'project.json'
const THUMBNAIL_FILE_NAME = 'preview_thumbnail.png'

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/**
 * Lists every subfolder of `buildRootDir` that looks like a built theme
 * (has a readable `project.json`). A stray directory without one is skipped
 * rather than failing the whole listing.
 */
export async function listCreatedThemes(buildRootDir: string): Promise<CreatedThemeSummary[]> {
  // Resolved to an absolute path (not just joined) — a relative buildRootDir
  // (e.g. ExportPanel.tsx's literal 'Created Themes') still resolves fine
  // for fs calls, but the renderer also loads each thumbnail through the
  // `themefile://` protocol (toFileUrl -> pathToFileURL), which requires an
  // absolute path.
  const absoluteBuildRootDir = resolve(buildRootDir)
  let entries: Dirent[]
  try {
    entries = await readdir(absoluteBuildRootDir, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }

  const summaries = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry): Promise<CreatedThemeSummary | null> => {
        const buildFolderPath = join(absoluteBuildRootDir, entry.name)
        const projectFilePath = join(buildFolderPath, PROJECT_FILE_NAME)
        try {
          const [project, fileStat, hasThumbnail] = await Promise.all([
            loadThemeProject(projectFilePath),
            stat(projectFilePath),
            pathExists(join(buildFolderPath, THUMBNAIL_FILE_NAME))
          ])
          return {
            name: project.meta.name,
            version: project.meta.version,
            creator: project.meta.creator,
            buildFolderPath,
            projectFilePath,
            thumbnailPath: hasThumbnail ? join(buildFolderPath, THUMBNAIL_FILE_NAME) : null,
            updatedAt: fileStat.mtime.toISOString()
          }
        } catch {
          return null
        }
      })
  )

  return summaries
    .filter((summary): summary is CreatedThemeSummary => summary !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/**
 * Deletes a built theme folder. Refuses to touch a folder that doesn't look
 * like one of our own build outputs (no `project.json`), rather than
 * `rm -rf`-ing whatever path a caller passes in.
 */
export async function deleteCreatedTheme(buildFolderPath: string): Promise<void> {
  const hasProjectFile = await pathExists(join(buildFolderPath, PROJECT_FILE_NAME))
  if (!hasProjectFile) {
    throw new Error(
      `deleteCreatedTheme: ${buildFolderPath} has no project.json — refusing to delete`
    )
  }
  await rm(buildFolderPath, { recursive: true, force: true })
}
