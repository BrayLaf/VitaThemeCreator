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
import {
  DEFAULT_IMAGE_CROP,
  type CroppableImageSlot,
  type PreviewImageSlot,
  type PreviewScreenshotSlot,
  type ThemeProject
} from '@shared/types'

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
  return withCropDefaults(envelope.project)
}

/** Fills in a `CroppableImageSlot`'s `fitMode`/`crop` when a pre-crop-feature project.json lacks them — defaults to the original 'stretch' behavior, never a silent 'crop'. */
function withCroppableDefaults(slot: CroppableImageSlot): CroppableImageSlot {
  return {
    ...slot,
    fitMode: slot.fitMode ?? 'stretch',
    crop: slot.crop ?? { ...DEFAULT_IMAGE_CROP }
  }
}

/**
 * `crop` was added to the notification-icon slots (2026-09-15, see the
 * `NotificationIconImageSlot` DECISION note, imageSlots.ts), and `fitMode`/
 * `crop` to the lockscreen and page-background slots (`CroppableImageSlot`)
 * shortly after — both without bumping the format version, so a project.json
 * saved before either change is missing those fields. Default them in
 * rather than failing to load.
 */
function withCropDefaults(project: ThemeProject): ThemeProject {
  return {
    ...project,
    lockscreenImage: withCroppableDefaults(project.lockscreenImage),
    pages: project.pages.map((page) => ({
      ...page,
      images: {
        main: withCroppableDefaults(page.images.main),
        thumbnail: withCroppableDefaults(page.images.thumbnail)
      }
    })) as ThemeProject['pages'],
    notificationIcons: {
      noNotice: {
        ...project.notificationIcons.noNotice,
        crop: project.notificationIcons.noNotice.crop ?? { ...DEFAULT_IMAGE_CROP }
      },
      newNotice: {
        ...project.notificationIcons.newNotice,
        crop: project.notificationIcons.newNotice.crop ?? { ...DEFAULT_IMAGE_CROP }
      }
    },
    // `pageIndicator` was added 2026-09-15 (see the `PageIndicatorImageSlot`
    // DECISION note, imageSlots.ts) without bumping the format version, so a
    // project.json saved before that is missing it entirely — default both
    // slots to unset, which falls back to the bundled basePage.png/curPage.png
    // at build time, matching what an old project already produced.
    pageIndicator: project.pageIndicator ?? {
      basePage: { sourcePath: null },
      curPage: { sourcePath: null }
    },
    previewScreenshots: withPreviewScreenshotsDefaults(project.previewScreenshots)
  }
}

/**
 * `previewScreenshots` was reshaped 2026-09-15 from a single flat
 * `{ source }` applied to both preview images at once into an independent
 * `{ lockscreen, homePage }` pair (see the `PreviewImageSlot` doc comment,
 * imageSlots.ts — this mirrors the original's own per-image
 * `-LSPRE-`/`-LAPRE-` custom-image override) — without bumping the format
 * version. A pre-reshape project.json still has the old flat shape; apply
 * its single `source` to both new slots rather than failing to load.
 */
function withPreviewScreenshotsDefaults(raw: unknown): PreviewScreenshotSlot {
  if (raw && typeof raw === 'object' && 'lockscreen' in raw && 'homePage' in raw) {
    return raw as PreviewScreenshotSlot
  }
  const legacySource =
    (raw as { source?: PreviewImageSlot['source'] } | undefined)?.source ?? 'generated'
  const slot: PreviewImageSlot = { source: legacySource, customImage: null }
  return { lockscreen: { ...slot }, homePage: { ...slot } }
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
