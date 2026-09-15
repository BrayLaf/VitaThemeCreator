/**
 * Assembles the build folder and zips it into the exportable theme package.
 *
 * Report ref: §6. Build target is `<buildRootDir>/<ThemeName>/`, containing
 * theme.xml, project.json (this rewrite's theme.ini analogue, excluded from
 * the zip), all converted images, the 17 system icons, bgm.at9, and the
 * three preview images. The zip is a plain zip (not a real 7z archive
 * despite the original shelling out to 7z.exe) via `archiver` — no need to
 * shell out to any zip binary.
 *
 * All output filenames are lowercase (`bg1.png`, not `BG1.png`) — see the
 * casing decision in exportMeta.ts. Does not reproduce the original's
 * Windows-only case-insensitivity assumption.
 */
import * as archiver from 'archiver'
import { createWriteStream } from 'fs'
import { copyFile, mkdir, readdir, writeFile } from 'fs/promises'
import { basename, join } from 'path'
import { ICON_SLOT_KEYS, type ExportResult, type ThemeProject } from '@shared/types'
import {
  convertLockscreenImage,
  convertNotificationIcon,
  convertPageBackground,
  generateLockscreenPreviewScreenshot,
  generatePackageThumbnail,
  generatePreviewScreenshot
} from './imageConversion'
import { compositeSystemIcon } from './iconGeneration'
import { convertAudioTrack } from './audioConversion'
import { generateManifest, serializeManifestXml } from './manifestGeneration'
import { saveThemeProject } from './projectPersistence'
import {
  BASE_PAGE_ASSET_PATH,
  CUR_PAGE_ASSET_PATH,
  DEFAULT_LOCKSCREEN_IMAGE_PATH,
  DEFAULT_NEW_NOTICE_ICON_PATH,
  DEFAULT_NO_NOTICE_ICON_PATH,
  DEFAULT_PAGE_BACKGROUND_PATH
} from '../resourcePaths'

/** The project-state save file's name inside the build folder — excluded from the zip, same role as the original's theme.ini (§5). */
const PROJECT_FILE_NAME = 'project.json'

/**
 * Only for slots with no sensible bundled default — a package-thumbnail
 * custom image is a deliberate user choice with nothing to fall back to.
 * Everything else that used to require a source path now has a real
 * default instead (see `resourcePaths.ts`'s DECISION note) — no export
 * should ever fail just because an optional slot was left unset.
 */
function requireSourcePath(sourcePath: string | null, label: string): string {
  if (!sourcePath) throw new Error(`buildThemeFolder: ${label} has no source image set`)
  return sourcePath
}

/**
 * Runs every conversion (images, audio, manifest, icons) and assembles the
 * full build folder layout described in §6. Does not zip.
 * Report ref: §6; Theme.py:1976-1981, 2300.
 */
export async function buildThemeFolder(
  project: ThemeProject,
  buildRootDir: string
): Promise<string> {
  const buildFolderPath = join(buildRootDir, project.meta.name)
  await mkdir(buildFolderPath, { recursive: true })

  await convertLockscreenImage(
    project.lockscreenImage.sourcePath ?? DEFAULT_LOCKSCREEN_IMAGE_PATH(),
    join(buildFolderPath, 'lockscreen.png')
  )

  // A page background is optional (§5 <m_waveType> — every page defaults to
  // empty in the legacy tool and is never required before export; the Vita
  // firmware itself draws the page's wave pattern when no bgN.png exists).
  // bgN.png/bgNt.png are simply not generated for a page with no source
  // image — the manifest still references those filenames unconditionally
  // (manifestGeneration.ts), matching the original's own behavior.
  const builtPageMainPaths: (string | null)[] = []
  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i]
    const pageNumber = i + 1
    const mainSource = page.images.main.sourcePath
    if (!mainSource) {
      builtPageMainPaths.push(null)
      continue
    }
    const thumbnailSource = page.images.thumbnail.sourcePath ?? mainSource
    const mainOut = join(buildFolderPath, `bg${pageNumber}.png`)
    await convertPageBackground({ main: mainSource, thumbnail: thumbnailSource }, pageNumber, {
      main: mainOut,
      thumbnail: join(buildFolderPath, `bg${pageNumber}t.png`)
    })
    builtPageMainPaths.push(mainOut)
  }

  await convertNotificationIcon(
    project.notificationIcons.noNotice.sourcePath ?? DEFAULT_NO_NOTICE_ICON_PATH(),
    'noNotice',
    join(buildFolderPath, 'notices.png')
  )
  await convertNotificationIcon(
    project.notificationIcons.newNotice.sourcePath ?? DEFAULT_NEW_NOTICE_ICON_PATH(),
    'newNotice',
    join(buildFolderPath, 'notice.png')
  )

  await copyFile(BASE_PAGE_ASSET_PATH(), join(buildFolderPath, 'basePage.png'))
  await copyFile(CUR_PAGE_ASSET_PATH(), join(buildFolderPath, 'curPage.png'))

  await Promise.all(
    ICON_SLOT_KEYS.map((slot) =>
      compositeSystemIcon(slot, project.iconSet[slot], join(buildFolderPath, `${slot}.png`))
    )
  )

  await convertAudioTrack(project.audio, join(buildFolderPath, 'bgm.at9'))

  const manifest = generateManifest(project)
  const xml = serializeManifestXml(manifest)
  await writeFile(join(buildFolderPath, 'theme.xml'), xml, 'utf-8')

  if (project.packageThumbnail.mode === 'auto-collage') {
    // Pages 1-4, in order — a page with no background renders as a neutral
    // placeholder tile (generatePackageThumbnail) rather than requiring 4
    // pages to have real images set.
    await generatePackageThumbnail(
      'auto-collage',
      {
        collagePageImagePaths: builtPageMainPaths.slice(0, 4) as [
          string | null,
          string | null,
          string | null,
          string | null
        ],
        themeName: project.meta.name
      },
      join(buildFolderPath, 'preview_thumbnail.png')
    )
  } else if (project.packageThumbnail.mode === 'custom-image') {
    await generatePackageThumbnail(
      'custom-image',
      {
        customImagePath: requireSourcePath(
          project.packageThumbnail.customImage?.sourcePath ?? null,
          'Package thumbnail custom image'
        )
      },
      join(buildFolderPath, 'preview_thumbnail.png')
    )
  } else {
    await generatePackageThumbnail(
      'live-capture',
      {},
      join(buildFolderPath, 'preview_thumbnail.png')
    )
  }

  if (project.previewScreenshots.source === 'captured-from-device') {
    await generatePreviewScreenshot(
      'captured-from-device',
      null,
      join(buildFolderPath, 'preview_lockscreen.png')
    )
  } else {
    await generateLockscreenPreviewScreenshot(
      join(buildFolderPath, 'lockscreen.png'),
      project.clock,
      project.infoBarColors,
      join(buildFolderPath, 'preview_lockscreen.png')
    )
  }
  const firstAvailablePageImage =
    builtPageMainPaths.find((p): p is string => p !== null) ?? DEFAULT_PAGE_BACKGROUND_PATH()
  await generatePreviewScreenshot(
    project.previewScreenshots.source,
    project.previewScreenshots.source === 'generated' ? firstAvailablePageImage : null,
    join(buildFolderPath, 'preview_page.png')
  )

  await saveThemeProject(project, join(buildFolderPath, PROJECT_FILE_NAME))

  return buildFolderPath
}

/**
 * Zips an already-built theme folder into `<exportDir>/<ThemeName>.zip`,
 * excluding project.json (this rewrite's theme.ini analogue — never ships).
 * Report ref: §6; Theme.py:1363-1386.
 */
export async function packageTheme(
  buildFolderPath: string,
  exportDir: string
): Promise<ExportResult> {
  await mkdir(exportDir, { recursive: true })
  const themeName = basename(buildFolderPath)
  const zipPath = join(exportDir, `${themeName}.zip`)

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath)
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } })
    output.on('close', () => resolve())
    archive.on('error', (err) => reject(err))
    archive.pipe(output)
    archive.glob('**/*', {
      cwd: buildFolderPath,
      ignore: [PROJECT_FILE_NAME]
    })
    archive.finalize()
  })

  return { buildFolderPath, zipPath }
}

/** Lists the build folder's contents — used by tests/verification only. */
export async function listBuildFolder(buildFolderPath: string): Promise<string[]> {
  return readdir(buildFolderPath)
}
