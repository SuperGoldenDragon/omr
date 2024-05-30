import { electronAPI } from '@electron-toolkit/preload'
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'
import { TitleBarOptions } from 'custom-electron-titlebar/titlebar/options'
import { contextBridge, ipcRenderer, nativeImage } from 'electron'
import appIcon from '../../resources/icon.png?asset'

const options: TitleBarOptions = {
  icon: nativeImage.createFromPath(appIcon),
  shadow: true
  // backgroundColor: TitlebarColor.fromHex('#333')
}

// Custom APIs for renderer
const api: any = {}

// Function to handle changes to the 'dark' class on the body element
const handleDarkModeChange = (titlebar) => {
  if (titlebar === undefined) return
  // Check if the 'dark' class is present on the body element
  const isDarkMode = document.documentElement.classList.contains('dark')

  // Do something based on whether dark mode is enabled or not
  if (isDarkMode) {
    // Dark mode is enabled
    console.log('Dark mode is enabled')
    // Add your dark mode-specific logic here
    titlebar.updateBackground(TitlebarColor.fromHex('#374151'))
  } else {
    // Dark mode is not enabled
    console.log('Dark mode is not enabled')
    // Add your light mode-specific logic here
    titlebar.updateBackground(TitlebarColor.fromHex('#0e7490'))
  }
}

ipcRenderer.on('darkMode', (_event, isDarkMode) => {
  console.log('Dark mode is enabled', isDarkMode)
  document.documentElement.classList.toggle('system-dark', isDarkMode)
})

window.addEventListener('DOMContentLoaded', () => {
  const titlebar = new Titlebar(options)

  // Initial check for dark mode
  handleDarkModeChange(titlebar)

  // Create a MutationObserver to monitor changes to the body element
  const observer = new MutationObserver(() => handleDarkModeChange(titlebar))

  // Configuration for the observer (observe changes to attributes)
  const config = { attributes: true, attributeFilter: ['class'] }

  // Start observing changes to the body element
  observer.observe(document.documentElement, config)
})

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
