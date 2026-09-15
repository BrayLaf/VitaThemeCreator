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
  generatePackageThumbnail,
  generatePreviewScreenshot
} from './imageConversion'
import { compositeSystemIcon } from './iconGeneration'
import { convertAudioTrack } from './audioConversion'
import { generateManifest, serializeManifestXml } from './manifestGeneration'
import { saveThemeProject } from './projectPersistence'
import { BASE_PAGE_ASSET_PATH, CUR_PAGE_ASSET_PATH } from '../resourcePaths'

/** The project-state save file's name inside the build folder — excluded from the zip, same role as the original's theme.ini (§5). */
const PROJECT_FILE_NAME = 'project.json'

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
    requireSourcePath(project.lockscreenImage.sourcePath, 'Lockscreen image'),
    join(buildFolderPath, 'lockscreen.png')
  )

  const builtPageMainPaths: string[] = []
  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i]
    const pageNumber = i + 1
    const mainSource = requireSourcePath(
      page.images.main.sourcePath,
      `Page ${pageNumber} background`
    )
    const thumbnailSource = page.images.thumbnail.sourcePath ?? mainSource
    const mainOut = join(buildFolderPath, `bg${pageNumber}.png`)
    await convertPageBackground({ main: mainSource, thumbnail: thumbnailSource }, pageNumber, {
      main: mainOut,
      thumbnail: join(buildFolderPath, `bg${pageNumber}t.png`)
    })
    builtPageMainPaths.push(mainOut)
  }

  await convertNotificationIcon(
    requireSourcePath(project.notificationIcons.noNotice.sourcePath, '"No notice" icon'),
    'noNotice',
    join(buildFolderPath, 'notices.png')
  )
  await convertNotificationIcon(
    requireSourcePath(project.notificationIcons.newNotice.sourcePath, '"New notice" icon'),
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
    if (builtPageMainPaths.length < 4) {
      throw new Error('buildThemeFolder: auto-collage package thumbnail requires at least 4 pages')
    }
    await generatePackageThumbnail(
      'auto-collage',
      { collagePageImagePaths: builtPageMainPaths.slice(0, 4) as [string, string, string, string] },
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

  await generatePreviewScreenshot(
    project.previewScreenshots.source,
    project.previewScreenshots.source === 'generated'
      ? join(buildFolderPath, 'lockscreen.png')
      : null,
    join(buildFolderPath, 'preview_lockscreen.png')
  )
  await generatePreviewScreenshot(
    project.previewScreenshots.source,
    project.previewScreenshots.source === 'generated' ? builtPageMainPaths[0] : null,
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
