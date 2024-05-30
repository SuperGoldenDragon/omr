import { useThemeMode } from 'flowbite-react'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Setting } from 'src/main/entities/Setting'

// Define the type for your settings
interface Settings {
  language: string
  theme: 'light' | 'dark' | 'system'
  appName: string
}

// Define the initial settings
const initialSettings: Settings = {
  language: 'en', // Default language
  theme: 'light', // Default theme
  appName: 'OMR STUDIO' // Default page title
}

// Create a context for settings
const SettingsContext = createContext<{
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}>({
  settings: initialSettings,
  updateSettings: () => {}
})

// Custom hook to consume the settings context
export const useSettings = () => useContext(SettingsContext)

// Settings provider component
export const SettingsProvider = ({ children }: { children: JSX.Element }) => {
  const ipc = window.electron.ipcRenderer
  const { setMode } = useThemeMode()
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const { i18n } = useTranslation<any>()

  // Function to update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings
    }))

    ipc.invoke('updateSetting', {
      appLanguage: newSettings?.language,
      mode: newSettings?.theme
    } as Setting)
  }

  // update i18next language when settings.language changes
  useEffect(() => {
    if (i18n.language === settings.language) {
      console.log(i18n.language, settings.language)
      const direction = settings.language === 'ar' ? 'rtl' : 'ltr'
      document.body.dir = direction
      document.documentElement.lang = settings.language
      return
    }
    i18n.changeLanguage(settings.language)
    const direction = settings.language === 'ar' ? 'rtl' : 'ltr'
    document.body.dir = direction
    document.documentElement.lang = settings.language
  }, [settings.language])

  //   // Effect to handle side effects of setting changes
  //   useEffect(() => {
  //     if (settings.theme === 'system') {
  //       // system theme detection
  //       const isDark = document.documentElement.classList.contains('system-dark')
  //       if (isDark) {
  //         setMode('dark')
  //       } else {
  //         setMode('light')
  //       }
  //     } else {
  //       setMode(settings.theme === 'dark' ? 'dark' : 'light')
  //     }
  //   }, [settings.theme])

  // system theme detection
  useEffect(() => {
    ipc.invoke('getSetting').then((response: Setting) => {
      console.log(response)

      if (i18n.language !== response.appLanguage) {
        // update i18next language
        i18n.changeLanguage(response.appLanguage)
      }
      // update theme
      if (response.mode === 'system') {
        // check if html element has 'dark' class
        const isDark = document.documentElement.classList.contains('system-dark')

        if (isDark) {
          setMode('dark')
          updateSettings({ theme: 'system', language: response.appLanguage })
        } else {
          setMode('light')
          updateSettings({ theme: 'system', language: response.appLanguage })
        }
        console.log('isDark', isDark)
      } else {
        console.log('response.mode', settings)

        setSettings((pre) => {
          return {
            ...pre,
            theme: response.mode,
            language: response.appLanguage
          }
        })
        setMode(response.mode)
      }
    })

    console.log('SettingsProvider initialized', new Date())
  }, [])

  // update page title
  useEffect(() => {
    const cetTitle = document.getElementsByClassName('cet-title')

    console.log(cetTitle)

    if (cetTitle.length > 0) {
      cetTitle[0].textContent = settings.appName
    }
  }, [settings.appName])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
