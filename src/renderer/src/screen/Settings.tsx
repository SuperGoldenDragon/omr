import { useSettings } from '@renderer/context/Settings'
import { FM } from '@renderer/utils/i18helper'
import { Button, Select, useThemeMode } from 'flowbite-react'
import { HiMiniLanguage } from 'react-icons/hi2'
import { MdOutlineSettings } from 'react-icons/md'
import { VscVmActive } from 'react-icons/vsc'

const Settings = () => {
  const { settings, updateSettings } = useSettings()
  const { setMode } = useThemeMode()

  return (
    <div className="p-4">
      <p className="text-sm font-bold mb-2">{FM('display-settings')}</p>
      <div className="dark:bg-gray-800 bg-gray-100 flex items-center mb-2">
        <div className="text-base p-4 flex justify-center w-16">
          <MdOutlineSettings fontSize={28} />
        </div>
        <div className="text-base flex-1 py-4">
          <p>{FM('dark-mode')}</p>
          <p className="text-xs">{FM('enable-dark-mode')}</p>
        </div>
        <div className="text-base p-4 flex items-center">
          <label className="inline-flex items-center cursor-default">
            <input
              type="checkbox"
              value=""
              checked={settings.theme === 'dark'}
              onChange={(e) => {
                setMode(e.target.checked ? 'dark' : 'light')
                updateSettings({ theme: e.target.checked ? 'dark' : 'light' })
              }}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
          </label>
        </div>
      </div>
      <div className="dark:bg-gray-800 bg-gray-100 flex items-center mb-6">
        <div className="text-base p-4 flex justify-center w-16">
          <HiMiniLanguage fontSize={28} />
        </div>
        <div className="text-base flex-1 py-4">
          <p>{FM('language')}</p>
          <p className="text-xs">{FM('change-language')}</p>
        </div>
        <div className="text-base p-4 flex items-center w-32">
          <Select
            className="w-full"
            sizing={'sm'}
            onChange={(e) => {
              updateSettings({ language: e.target.value })
            }}
            value={settings.language}
            id="language"
          >
            <option value={'en'}>English</option>
            <option value={'ar'}>{FM('arabic')}</option>
          </Select>
        </div>
      </div>
      <p className="text-sm font-bold mb-2">{FM('license-information')}</p>
      <div className="dark:bg-gray-800 bg-gray-100 flex items-center mb-6">
        <div className="text-base p-4 flex justify-center w-16">
          <VscVmActive fontSize={28} />
        </div>
        <div className="text-base flex-1 py-4">
          <p>{FM('active')}</p>
          <p className="text-xs">{FM('license-is-active', { date: 'Aug 28, 2028' })}</p>
        </div>
        <div className="text-base p-4 flex items-center w-36">
          <Button className="cursor-default" size={'sm'} color="failure">
            {FM('deactivate')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
