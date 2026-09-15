/**
 * Builds a blank `ThemeProject` — the initial state for a new, unsaved
 * theme in the editor. Every field is a neutral default; nothing here is
 * validated or written to disk (that's `saveThemeProject`, step 3).
 */
import {
  DEFAULT_IMAGE_CROP,
  ICON_SLOT_KEYS,
  type CroppableImageSlot,
  type IconSlotKey,
  type IconGenerationChoice,
  type NotificationIconImageSlot,
  type PageProject,
  type ThemeProject,
  type Tuple10
} from '@shared/types'

/** Forced-stretch is the default fit mode — see the `ResizeFit` DECISION note, shared/types/common.ts. */
function emptyCroppableImageSlot(): CroppableImageSlot {
  return { sourcePath: null, fitMode: 'stretch', crop: { ...DEFAULT_IMAGE_CROP } }
}

function emptyNotificationIcons(): NotificationIconImageSlot {
  return {
    noNotice: { sourcePath: null, crop: { ...DEFAULT_IMAGE_CROP } },
    newNotice: { sourcePath: null, crop: { ...DEFAULT_IMAGE_CROP } }
  }
}

/** Matches Icon.py's own real first-run defaults (Icon.py:89,106: `icon1col = 'White'`, `icon1bgc = 'None.'`) — a valid, real bundled swatch from the start, never an empty name nothing resolves to. */
function emptyIconChoice(): IconGenerationChoice {
  return {
    glyphStyle: 'White',
    background: { kind: 'swatch', name: 'None.' }
  }
}

function emptyPage(): PageProject {
  return {
    colors: { waveType: 0, fontColor: 'ffffff', fontShadow: true },
    images: { main: emptyCroppableImageSlot(), thumbnail: emptyCroppableImageSlot() }
  }
}

function emptyPages(): Tuple10<PageProject> {
  return [
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage(),
    emptyPage()
  ]
}

function emptyIconSet(): Record<IconSlotKey, IconGenerationChoice> {
  return Object.fromEntries(ICON_SLOT_KEYS.map((key) => [key, emptyIconChoice()])) as Record<
    IconSlotKey,
    IconGenerationChoice
  >
}

/** Same real first-run defaults as a fresh theme's `iconSet`, for the standalone icon-set creator. */
export function createEmptyIconSetSelection(): Record<IconSlotKey, IconGenerationChoice> {
  return emptyIconSet()
}

export function createEmptyThemeProject(): ThemeProject {
  return {
    meta: { name: 'Untitled Theme', version: '01.00', creator: '' },
    clock: { color: 'ffffff', position: 0 },
    notificationColors: { boxColor: '000000', textColor: 'ffffff' },
    infoBarColors: { barColor: '000000', indicatorColor: 'ffffff' },
    lockscreenImage: emptyCroppableImageSlot(),
    pages: emptyPages(),
    notificationIcons: emptyNotificationIcons(),
    iconSet: emptyIconSet(),
    audio: { kind: 'default-bundled', sourcePath: null },
    packageThumbnail: { mode: 'auto-collage', customImage: null },
    previewScreenshots: { source: 'generated' }
  }
}
