import SchoolIcon from '@renderer/assets/icons/school-indicator.svg'
import CreateSmallIcon from '@renderer/assets/icons/create-green-small.svg'
import EditSmallIcon from '@renderer/assets/icons/edit-green-small.svg'
import CancelSmallIcon from '@renderer/assets/icons/cancel-red-small.svg'
import CollapseOffDark from '@renderer/assets/icons/collapse-off-dark.svg'
import CollapseOffLight from '@renderer/assets/icons/collapse-off-light.svg'
import { useEffect, useState } from 'react'
import ClassAccordion from './ClassAccordion'

const SchoolAccordion = ({ schoolName }: { schoolName: string }) => {
  const ipc = window.electron.ipcRenderer

  const [classesObj, setClassesObj] = useState<any>({})
  const [collapse, setCollapse] = useState<boolean>(false)
  // get dark mode for change
  const darkMode: boolean = document.documentElement.classList.contains('dark')

  useEffect(() => {
    if (schoolName) {
      ipc.invoke('getStudentsBySchool', schoolName).then((result) => {
        setClassesObj(result || {})
      })
    }
  }, [schoolName])

  return (
    <div id="accordionFlushExample">
      <div className="rounded-none border border-e-0 border-s-0 border-t-0 border-neutral-200 dark:border-neutral-600 dark:bg-body-dark">
        <div className="mb-0 flex">
          <div
            className="flex items-center grow cursor-pointer"
            onClick={() => setCollapse(!collapse)}
          >
            <div className="w-10 flex justify-center">
              <img src={SchoolIcon} className="mr-2 object-none" />
            </div>
            <span className="px-2">{schoolName}</span>
          </div>
          <div className="flex gap-0">
            <a
              href="javascript:"
              className="h-8 w-10 flex justify-center border-r border-gray-700 rtl:border-none dark:border-gray-500 cursor-pointer"
            >
              <img src={CreateSmallIcon} className="object-none mx-2" />
            </a>
            <a
              href="javascript:"
              className="h-8 w-10 flex justify-center border-r border-gray-700 dark:border-gray-500 cursor-pointer"
            >
              <img src={EditSmallIcon} className="object-none mx-2" />
            </a>
            <a
              href="javascript:"
              className="h-8 w-10 flex justify-center border-r border-gray-700 dark:border-gray-500 cursor-pointer"
            >
              <img src={CancelSmallIcon} className="object-none mx-2" />
            </a>
            <a
              href="javascript:"
              className="h-8 w-10 flex justify-center items-center text-[14px] rtl:border-r rtl:border-gray-700 dark:rtl:border-gray-100 cursor-pointer"
              onClick={() => setCollapse(!collapse)}
            >
              <img
                src={darkMode ? CollapseOffLight : CollapseOffDark}
                className={`${collapse ? 'rotate-0' : 'rotate-[-180deg]'} object-none mx-2 transition-transform duration-800 ease-in-out motion-reduce:transition-none`}
              />
            </a>
          </div>
        </div>
        <div
          className={`!visible border-0 ${collapse ? '' : 'hidden'}`}
          data-twe-collapse-item
          data-twe-collapse-show={collapse}
          aria-labelledby="flush-headingOne"
          data-twe-parent="#accordionFlushExample"
        >
          {Object.keys(classesObj).map((classNameStr, index) => (
            <ClassAccordion
              key={index}
              classNameStr={classNameStr}
              sections={classesObj[classNameStr] || {}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

SchoolAccordion.defaultProps = {
  schoolName: ''
}

export default SchoolAccordion
