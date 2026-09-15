/**
 * Local editor state for the theme project currently open. Deliberately
 * in-memory only (React state) — no persistence, no IPC calls. Loading/
 * saving via `loadThemeProject`/`saveThemeProject` (main-process stubs)
 * gets wired up once IPC channels exist.
 */
import { useMemo, useState, type ReactNode } from 'react'
import type { PageIndex, ThemeProject } from '@shared/types'
import { createEmptyThemeProject } from './createEmptyThemeProject'
import { ThemeProjectContext, type ThemeProjectContextValue } from './themeProjectContextValue'

export function ThemeProjectProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [project, setProject] = useState<ThemeProject>(createEmptyThemeProject)

  const value = useMemo<ThemeProjectContextValue>(() => {
    const updatePage = (
      page: PageIndex,
      updater: (p: ThemeProject['pages'][number]) => ThemeProject['pages'][number]
    ): void => {
      setProject((prev) => {
        const pages = [...prev.pages] as ThemeProject['pages']
        pages[page - 1] = updater(pages[page - 1])
        return { ...prev, pages }
      })
    }

    return {
      project,
      setMeta: (patch) => setProject((prev) => ({ ...prev, meta: { ...prev.meta, ...patch } })),
      setClock: (patch) => setProject((prev) => ({ ...prev, clock: { ...prev.clock, ...patch } })),
      setNotificationColors: (patch) =>
        setProject((prev) => ({
          ...prev,
          notificationColors: { ...prev.notificationColors, ...patch }
        })),
      setInfoBarColors: (patch) =>
        setProject((prev) => ({ ...prev, infoBarColors: { ...prev.infoBarColors, ...patch } })),
      setLockscreenImage: (patch) =>
        setProject((prev) => ({ ...prev, lockscreenImage: { ...prev.lockscreenImage, ...patch } })),
      setPageColors: (page, patch) =>
        updatePage(page, (p) => ({ ...p, colors: { ...p.colors, ...patch } })),
      setPageImage: (page, slot, patch) =>
        updatePage(page, (p) => ({
          ...p,
          images: { ...p.images, [slot]: { ...p.images[slot], ...patch } }
        })),
      setNotificationIcon: (variant, patch) =>
        setProject((prev) => ({
          ...prev,
          notificationIcons: {
            ...prev.notificationIcons,
            [variant]: { ...prev.notificationIcons[variant], ...patch }
          }
        })),
      setIconChoice: (slot, choice) =>
        setProject((prev) => ({ ...prev, iconSet: { ...prev.iconSet, [slot]: choice } })),
      setAudio: (patch) => setProject((prev) => ({ ...prev, audio: { ...prev.audio, ...patch } })),
      setPackageThumbnail: (patch) =>
        setProject((prev) => ({
          ...prev,
          packageThumbnail: { ...prev.packageThumbnail, ...patch }
        })),
      setPreviewScreenshots: (patch) =>
        setProject((prev) => ({
          ...prev,
          previewScreenshots: { ...prev.previewScreenshots, ...patch }
        }))
    }
  }, [project])

  return <ThemeProjectContext.Provider value={value}>{children}</ThemeProjectContext.Provider>
}
