/**
 * A summary of one built theme folder under `Created Themes/` — backs the
 * landing page's "Manage created themes" library view. Not part of the
 * theme.ini/theme.xml domain model itself; derived by reading each build
 * folder's `project.json` (packaging.ts's `PROJECT_FILE_NAME`) back out via
 * `loadThemeProject`.
 */
export interface CreatedThemeSummary {
  name: string
  version: string
  creator: string
  /** `Created Themes/<ThemeName>/` — pass back into `deleteCreatedTheme`/`packageTheme`. */
  buildFolderPath: string
  /** `Created Themes/<ThemeName>/project.json` — pass straight into `loadThemeProject`. */
  projectFilePath: string
  /** `Created Themes/<ThemeName>/preview_thumbnail.png`, if the build folder has one. */
  thumbnailPath: string | null
  /** ISO 8601 — the build folder's project.json last-modified time. */
  updatedAt: string
}
