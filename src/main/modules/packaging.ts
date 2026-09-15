/**
 * Assembles the build folder and zips it into the exportable theme package.
 *
 * Report ref: §6. Build target is `Created Themes/<ThemeName>/`, containing
 * theme.xml, theme.ini (excluded from the zip), all converted images, the
 * 17 system icons, bgm.at9, and the three preview images. The zip is a
 * plain zip (not a real 7z archive despite the original shelling out to
 * 7z.exe) — intended replacement per §7 is `archiver` or `adm-zip`, no need
 * to shell out to any zip binary.
 *
 * STUB MODULE — no real file I/O or zipping yet. All functions throw.
 */
import type { ExportResult, ThemeProject } from '@shared/types'

/**
 * Runs every conversion (images, audio, manifest) and assembles the full
 * build folder layout described in §6. Does not zip.
 * Report ref: §6; Theme.py:1976-1981, 2300.
 *
 * All output filenames are lowercase (`bg1.png`, not `BG1.png`) — see the
 * casing decision in exportMeta.ts. Do not reproduce the original's
 * Windows-only case-insensitivity assumption.
 */
export function buildThemeFolder(_project: ThemeProject, _buildRootDir: string): Promise<string> {
  throw new Error('not implemented: buildThemeFolder')
}

/**
 * Zips an already-built theme folder into `Exported/<ThemeName>.zip`,
 * excluding theme.ini.
 * Report ref: §6; Theme.py:1363-1386.
 */
export function packageTheme(_buildFolderPath: string, _exportDir: string): Promise<ExportResult> {
  throw new Error('not implemented: packageTheme')
}
