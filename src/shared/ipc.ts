/**
 * The renderer ↔ main IPC contract. One method per main-process stub module
 * function (step 3: src/main/modules/*.ts). This establishes the wiring
 * pattern end-to-end — preload exposes this exact shape on `window.api`,
 * main registers one `ipcMain.handle` per channel — even though every
 * handler still just throws "not implemented".
 *
 * All types here must be structured-clone-safe (plain data, no functions/
 * class instances) since they cross the IPC boundary.
 */
import type {
  AudioSourceConfig,
  ExportResult,
  IconGenerationChoice,
  IconSetSelection,
  IconSlotKey,
  PackageThumbnailMode,
  PackageThumbnailSources,
  PreviewScreenshotSource,
  ThemeManifest,
  ThemeProject
} from './types'

export interface ThemeBuilderApi {
  // imageConversion.ts
  convertLockscreenImage(sourcePath: string, outputPath: string): Promise<string>
  convertPageBackground(
    sources: { main: string; thumbnail: string },
    pageIndex: number,
    outputPaths: { main: string; thumbnail: string }
  ): Promise<{ main: string; thumbnail: string }>
  convertNotificationIcon(
    sourcePath: string,
    variant: 'noNotice' | 'newNotice',
    outputPath: string
  ): Promise<string>
  generatePackageThumbnail(
    mode: PackageThumbnailMode,
    sources: PackageThumbnailSources,
    outputPath: string
  ): Promise<string>
  generatePreviewScreenshot(
    source: PreviewScreenshotSource,
    sourceImagePath: string | null,
    outputPath: string
  ): Promise<string>

  // iconGeneration.ts
  compositeSystemIcon(
    slot: IconSlotKey,
    choice: IconGenerationChoice,
    outputPath: string
  ): Promise<string>
  generateIconSet(setName: string, selection: IconSetSelection, outputDir: string): Promise<string>

  // audioConversion.ts
  convertAudioTrack(config: AudioSourceConfig, outputPath: string): Promise<string>

  // manifestGeneration.ts
  generateManifest(project: ThemeProject): Promise<ThemeManifest>
  serializeManifestXml(manifest: ThemeManifest): Promise<string>

  // packaging.ts
  buildThemeFolder(project: ThemeProject, buildRootDir: string): Promise<string>
  packageTheme(buildFolderPath: string, exportDir: string): Promise<ExportResult>

  // projectPersistence.ts
  loadThemeProject(projectFilePath: string): Promise<ThemeProject>
  saveThemeProject(project: ThemeProject, projectFilePath: string): Promise<void>

  // dialogs.ts
  pickImageFile(): Promise<string | null>
  pickAudioFile(): Promise<string | null>
  pickProjectOpenPath(): Promise<string | null>
  pickProjectSavePath(defaultName: string): Promise<string | null>
}

/**
 * IPC channel names, one per `ThemeBuilderApi` method. Keyed off the
 * interface itself so main/preload can't silently drift out of sync with
 * a method the contract doesn't know about.
 */
export const IPC_CHANNELS: Record<keyof ThemeBuilderApi, string> = {
  convertLockscreenImage: 'image:convertLockscreenImage',
  convertPageBackground: 'image:convertPageBackground',
  convertNotificationIcon: 'image:convertNotificationIcon',
  generatePackageThumbnail: 'image:generatePackageThumbnail',
  generatePreviewScreenshot: 'image:generatePreviewScreenshot',
  compositeSystemIcon: 'icon:compositeSystemIcon',
  generateIconSet: 'icon:generateIconSet',
  convertAudioTrack: 'audio:convertAudioTrack',
  generateManifest: 'manifest:generateManifest',
  serializeManifestXml: 'manifest:serializeManifestXml',
  buildThemeFolder: 'packaging:buildThemeFolder',
  packageTheme: 'packaging:packageTheme',
  loadThemeProject: 'project:loadThemeProject',
  saveThemeProject: 'project:saveThemeProject',
  pickImageFile: 'dialog:pickImageFile',
  pickAudioFile: 'dialog:pickAudioFile',
  pickProjectOpenPath: 'dialog:pickProjectOpenPath',
  pickProjectSavePath: 'dialog:pickProjectSavePath'
}
