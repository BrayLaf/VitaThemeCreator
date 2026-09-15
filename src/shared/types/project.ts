/**
 * The "theme project" aggregate — the app's own editable/re-openable project
 * state. This is the TypeScript analogue of theme.ini (§5): NOT the exported
 * manifest, but the source-of-truth the editor UI binds to and that
 * `generateManifest()` reads from to produce a `ThemeManifest`.
 *
 * Grounded in DOMAIN_LOGIC_ANALYSIS.md §5 (theme.ini sections: [THEME],
 * [CLOCK], [NOTIFICATION], [INFOBAR], [WAVE PATTERNS], [PAGE TEXT COLORS])
 * plus the image/audio/icon state needed to actually build those sections.
 */
import type { Tuple10 } from './common'
import type {
  ClockSettings,
  InfoBarColorSettings,
  NotificationColorSettings,
  PageColorSettings
} from './colorSettings'
import type {
  LockscreenImageSlot,
  NotificationIconImageSlot,
  PackageThumbnailSlot,
  PageBackgroundSlots,
  PreviewScreenshotSlot
} from './imageSlots'
import type { IconSetSelection } from './icons'
import type { AudioSourceConfig } from './audio'

/** `[THEME]` section of theme.ini. */
export interface ThemeProjectMeta {
  name: string
  version: string
  creator: string
}

/** One page's combined color settings + image assets. */
export interface PageProject {
  colors: PageColorSettings
  images: PageBackgroundSlots[number]
}

export interface ThemeProject {
  meta: ThemeProjectMeta

  clock: ClockSettings
  notificationColors: NotificationColorSettings
  infoBarColors: InfoBarColorSettings

  lockscreenImage: LockscreenImageSlot
  pages: Tuple10<PageProject>
  notificationIcons: NotificationIconImageSlot
  iconSet: IconSetSelection

  audio: AudioSourceConfig

  packageThumbnail: PackageThumbnailSlot
  previewScreenshots: PreviewScreenshotSlot
}
