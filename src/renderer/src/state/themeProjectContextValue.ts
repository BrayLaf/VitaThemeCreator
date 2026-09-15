import { createContext } from 'react'
import type {
  AudioSourceConfig,
  ClockSettings,
  CroppableImageSlot,
  IconGenerationChoice,
  IconSlotKey,
  InfoBarColorSettings,
  NotificationColorSettings,
  NotificationIconImageSlot,
  PackageThumbnailSlot,
  PageColorSettings,
  PageIndex,
  PreviewScreenshotSlot,
  ThemeProject,
  ThemeProjectMeta
} from '@shared/types'

export interface ThemeProjectContextValue {
  project: ThemeProject
  loadProject: (project: ThemeProject) => void
  setMeta: (patch: Partial<ThemeProjectMeta>) => void
  setClock: (patch: Partial<ClockSettings>) => void
  setNotificationColors: (patch: Partial<NotificationColorSettings>) => void
  setInfoBarColors: (patch: Partial<InfoBarColorSettings>) => void
  setLockscreenImage: (patch: Partial<CroppableImageSlot>) => void
  setPageColors: (page: PageIndex, patch: Partial<PageColorSettings>) => void
  setPageImage: (
    page: PageIndex,
    slot: 'main' | 'thumbnail',
    patch: Partial<CroppableImageSlot>
  ) => void
  setNotificationIcon: (
    variant: 'noNotice' | 'newNotice',
    patch: Partial<NotificationIconImageSlot['noNotice']>
  ) => void
  setIconChoice: (slot: IconSlotKey, choice: IconGenerationChoice) => void
  setAudio: (patch: Partial<AudioSourceConfig>) => void
  setPackageThumbnail: (patch: Partial<PackageThumbnailSlot>) => void
  setPreviewScreenshots: (patch: Partial<PreviewScreenshotSlot>) => void
}

export const ThemeProjectContext = createContext<ThemeProjectContextValue | null>(null)
