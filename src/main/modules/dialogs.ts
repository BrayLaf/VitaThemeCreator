/**
 * Native file-picker dialogs backing the editor's image/audio dropzones and
 * project Open/Save actions. Thin wrappers over Electron's `dialog` — no
 * domain logic lives here.
 */
import { dialog, shell, BrowserWindow } from 'electron'
import { resolve } from 'path'

const IMAGE_FILTERS = [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif'] }]
const AUDIO_FILTERS = [{ name: 'Audio', extensions: ['at9', 'wav', 'mp3'] }]
const PROJECT_FILTERS = [{ name: 'Vita Theme Project', extensions: ['json'] }]

function focusedWindow(): BrowserWindow | undefined {
  return BrowserWindow.getFocusedWindow() ?? undefined
}

async function pickOpenFile(filters: Electron.FileFilter[], title: string): Promise<string | null> {
  const win = focusedWindow()
  const options: Electron.OpenDialogOptions = { title, properties: ['openFile'], filters }
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options)
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0]
}

export function pickImageFile(): Promise<string | null> {
  return pickOpenFile(IMAGE_FILTERS, 'Choose an image')
}

export function pickAudioFile(): Promise<string | null> {
  return pickOpenFile(AUDIO_FILTERS, 'Choose an audio file')
}

export function pickProjectOpenPath(): Promise<string | null> {
  return pickOpenFile(PROJECT_FILTERS, 'Open theme project')
}

export async function pickProjectSavePath(defaultName: string): Promise<string | null> {
  const win = focusedWindow()
  const options: Electron.SaveDialogOptions = {
    title: 'Save theme project',
    defaultPath: `${defaultName}.json`,
    filters: PROJECT_FILTERS
  }
  const result = win
    ? await dialog.showSaveDialog(win, options)
    : await dialog.showSaveDialog(options)
  return result.canceled || !result.filePath ? null : result.filePath
}

/**
 * Opens the OS file manager (Finder/Explorer) with `path` selected — used by
 * the export success notices so a user can jump straight to a just-built
 * zip/folder instead of hunting for it. `path` may be relative (e.g. the
 * literal `'Exported'` build-root strings ExportPanel.tsx passes around);
 * `shell.showItemInFolder` needs an absolute one.
 */
export function revealFile(path: string): void {
  shell.showItemInFolder(resolve(path))
}
