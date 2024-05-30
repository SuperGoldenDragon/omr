import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    darkMode: {
      toggle: () => Promise<void>
      system: () => Promise<void>
    }
  }
}
