/**
 * Registers one `ipcMain.handle` per `ThemeBuilderApi` channel (shared/ipc.ts),
 * each delegating straight to its step-3 stub module function. Every handler
 * currently just rejects with "not implemented" — that's the stub modules'
 * behavior, not something faked here. This file only establishes the wiring.
 */
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import {
  convertLockscreenImage,
  convertNotificationIcon,
  convertPageBackground,
  generateLockscreenPreviewScreenshot,
  generatePackageThumbnail,
  generatePreviewScreenshot
} from './modules/imageConversion'
import { compositeSystemIcon, generateIconSet } from './modules/iconGeneration'
import { convertAudioTrack } from './modules/audioConversion'
import { generateManifest, serializeManifestXml } from './modules/manifestGeneration'
import { buildThemeFolder, packageTheme } from './modules/packaging'
import { loadThemeProject, saveThemeProject } from './modules/projectPersistence'
import { deleteCreatedTheme, listCreatedThemes } from './modules/themeLibrary'
import {
  pickAudioFile,
  pickImageFile,
  pickProjectOpenPath,
  pickProjectSavePath,
  revealFile
} from './modules/dialogs'
import { themebuilderAssetPath } from './resourcePaths'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.convertLockscreenImage, (_event, sourcePath, outputPath) =>
    convertLockscreenImage(sourcePath, outputPath)
  )
  ipcMain.handle(IPC_CHANNELS.convertPageBackground, (_event, sources, pageIndex, outputPaths) =>
    convertPageBackground(sources, pageIndex, outputPaths)
  )
  ipcMain.handle(IPC_CHANNELS.convertNotificationIcon, (_event, sourcePath, variant, outputPath) =>
    convertNotificationIcon(sourcePath, variant, outputPath)
  )
  ipcMain.handle(IPC_CHANNELS.generatePackageThumbnail, (_event, mode, sources, outputPath) =>
    generatePackageThumbnail(mode, sources, outputPath)
  )
  ipcMain.handle(
    IPC_CHANNELS.generatePreviewScreenshot,
    (_event, source, sourceImagePath, outputPath) =>
      generatePreviewScreenshot(source, sourceImagePath, outputPath)
  )
  ipcMain.handle(
    IPC_CHANNELS.generateLockscreenPreviewScreenshot,
    (_event, lockscreenImagePath, clock, infoBarColors, outputPath) =>
      generateLockscreenPreviewScreenshot(lockscreenImagePath, clock, infoBarColors, outputPath)
  )

  ipcMain.handle(IPC_CHANNELS.compositeSystemIcon, (_event, slot, choice, outputPath) =>
    compositeSystemIcon(slot, choice, outputPath)
  )
  ipcMain.handle(IPC_CHANNELS.generateIconSet, (_event, setName, selection, outputDir) =>
    generateIconSet(setName, selection, outputDir)
  )

  ipcMain.handle(IPC_CHANNELS.convertAudioTrack, (_event, config, outputPath) =>
    convertAudioTrack(config, outputPath)
  )

  ipcMain.handle(IPC_CHANNELS.generateManifest, (_event, project) => generateManifest(project))
  ipcMain.handle(IPC_CHANNELS.serializeManifestXml, (_event, manifest) =>
    serializeManifestXml(manifest)
  )

  ipcMain.handle(IPC_CHANNELS.buildThemeFolder, (_event, project, buildRootDir) =>
    buildThemeFolder(project, buildRootDir)
  )
  ipcMain.handle(IPC_CHANNELS.packageTheme, (_event, buildFolderPath, exportDir) =>
    packageTheme(buildFolderPath, exportDir)
  )

  ipcMain.handle(IPC_CHANNELS.loadThemeProject, (_event, projectFilePath) =>
    loadThemeProject(projectFilePath)
  )
  ipcMain.handle(IPC_CHANNELS.saveThemeProject, (_event, project, projectFilePath) =>
    saveThemeProject(project, projectFilePath)
  )

  ipcMain.handle(IPC_CHANNELS.listCreatedThemes, (_event, buildRootDir) =>
    listCreatedThemes(buildRootDir)
  )
  ipcMain.handle(IPC_CHANNELS.deleteCreatedTheme, (_event, buildFolderPath) =>
    deleteCreatedTheme(buildFolderPath)
  )

  ipcMain.handle(IPC_CHANNELS.pickImageFile, () => pickImageFile())
  ipcMain.handle(IPC_CHANNELS.pickAudioFile, () => pickAudioFile())
  ipcMain.handle(IPC_CHANNELS.pickProjectOpenPath, () => pickProjectOpenPath())
  ipcMain.handle(IPC_CHANNELS.pickProjectSavePath, (_event, defaultName) =>
    pickProjectSavePath(defaultName)
  )
  ipcMain.handle(IPC_CHANNELS.revealFile, (_event, path) => revealFile(path))

  ipcMain.handle(IPC_CHANNELS.resolveThemebuilderAssetPath, (_event, segments: string[]) =>
    themebuilderAssetPath(...segments)
  )
}
