import { useSettings } from '@renderer/context/Settings'
import { FM } from '@renderer/utils/i18helper'
import { Button } from 'flowbite-react'
import { Link } from 'react-router-dom'

type Props = {
  //
}

export default function About(_props: Props): JSX.Element {
  const { settings, updateSettings } = useSettings()

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  // set theme system
  const setSystemTheme = () => {
    updateSettings({ theme: 'system' })
  }

  // change the language by updating the settings
  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'en' ? 'ar' : 'en' })
  }

  return (
    <div>
      <h1>{FM('committees')}</h1>
      <h1 className="text-3xl font-bold underline">{FM('settings')}</h1>
      <p>Current Language: {settings.language}</p>
      <p>Current Theme: {settings.theme}</p>
      <Button onClick={toggleTheme}>Toggle Theme</Button>
      <Button onClick={setSystemTheme}>Set System Theme</Button>
      <Button onClick={toggleLanguage}>Toggle Language</Button>
      <Button>Click me</Button>
      <Link to="/">Home</Link>
    </div>
  )
}
