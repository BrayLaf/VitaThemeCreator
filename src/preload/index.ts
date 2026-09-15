import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, type ThemeBuilderApi } from '@shared/ipc'

// Typed bridge to the main-process modules via the channels registered in
// src/main/ipc.ts. This file only forwards each call over IPC.
const api: ThemeBuilderApi = {
  convertLockscreenImage: (sourcePath, crop, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.convertLockscreenImage, sourcePath, crop, outputPath),
  convertPageBackground: (sources, crops, pageIndex, outputPaths) =>
    ipcRenderer.invoke(IPC_CHANNELS.convertPageBackground, sources, crops, pageIndex, outputPaths),
  convertNotificationIcon: (sourcePath, crop, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.convertNotificationIcon, sourcePath, crop, outputPath),
  generatePackageThumbnail: (mode, sources, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.generatePackageThumbnail, mode, sources, outputPath),
  generatePreviewScreenshot: (source, sourceImagePath, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.generatePreviewScreenshot, source, sourceImagePath, outputPath),
  generateLockscreenPreviewScreenshot: (lockscreenImagePath, clock, infoBarColors, outputPath) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.generateLockscreenPreviewScreenshot,
      lockscreenImagePath,
      clock,
      infoBarColors,
      outputPath
    ),

  compositeSystemIcon: (slot, choice, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.compositeSystemIcon, slot, choice, outputPath),
  generateIconSet: (setName, selection, outputDir) =>
    ipcRenderer.invoke(IPC_CHANNELS.generateIconSet, setName, selection, outputDir),

  convertAudioTrack: (config, outputPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.convertAudioTrack, config, outputPath),

  generateManifest: (project) => ipcRenderer.invoke(IPC_CHANNELS.generateManifest, project),
  serializeManifestXml: (manifest) =>
    ipcRenderer.invoke(IPC_CHANNELS.serializeManifestXml, manifest),

  buildThemeFolder: (project, buildRootDir) =>
    ipcRenderer.invoke(IPC_CHANNELS.buildThemeFolder, project, buildRootDir),
  packageTheme: (buildFolderPath, exportDir) =>
    ipcRenderer.invoke(IPC_CHANNELS.packageTheme, buildFolderPath, exportDir),

  loadThemeProject: (projectFilePath) =>
    ipcRenderer.invoke(IPC_CHANNELS.loadThemeProject, projectFilePath),
  saveThemeProject: (project, projectFilePath) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveThemeProject, project, projectFilePath),

  listCreatedThemes: (buildRootDir) =>
    ipcRenderer.invoke(IPC_CHANNELS.listCreatedThemes, buildRootDir),
  deleteCreatedTheme: (buildFolderPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.deleteCreatedTheme, buildFolderPath),

  pickImageFile: () => ipcRenderer.invoke(IPC_CHANNELS.pickImageFile),
  pickAudioFile: () => ipcRenderer.invoke(IPC_CHANNELS.pickAudioFile),
  pickProjectOpenPath: () => ipcRenderer.invoke(IPC_CHANNELS.pickProjectOpenPath),
  pickProjectSavePath: (defaultName) =>
    ipcRenderer.invoke(IPC_CHANNELS.pickProjectSavePath, defaultName),
  revealFile: (path) => ipcRenderer.invoke(IPC_CHANNELS.revealFile, path),

  resolveThemebuilderAssetPath: (segments) =>
    ipcRenderer.invoke(IPC_CHANNELS.resolveThemebuilderAssetPath, segments)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
