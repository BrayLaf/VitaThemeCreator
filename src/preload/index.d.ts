import { ElectronAPI } from '@electron-toolkit/preload'
import type { ThemeBuilderApi } from '@shared/ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: ThemeBuilderApi
  }
}
