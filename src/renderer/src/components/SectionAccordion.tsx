import EditSmallIcon from '@renderer/assets/icons/edit-green-small.svg'
import CancelSmallIcon from '@renderer/assets/icons/cancel-red-small.svg'
import CollapseOffDark from '@renderer/assets/icons/collapse-off-dark.svg'
import CollapseOffLight from '@renderer/assets/icons/collapse-off-light.svg'
import UserHomeIcon from '@renderer/assets/icons/user-home.svg'
import ExchangeIcon from '@renderer/assets/icons/exchange.svg'
import { useEffect, useState } from 'react'
import { FM } from '@renderer/utils/i18helper'
import StudentRow from './StudentRow'
import Loading from './Loading'

const SectionAccordion = ({
  schoolName,
  classNameStr,
  sectionName,
  reload,
  setEditStudent
}: {
  schoolName: string
  classNameStr: string
  sectionName: string
  reload: any
  setEditStudent: any
}) => {
  const ipc = window.electron.ipcRenderer
  const [loading, setLoading] = useState<boolean>(false)
  const [students, setStudents] = useState<any>([])
  const [collapse, setCollapse] = useState<boolean>(false)
  const darkMode: boolean = document.documentElement.classList.contains('dark')

  useEffect(() => {
    ipc.on('save_student', (_event, args) => {
      const student = args?.student
      const mode = args?.mode
      if (!student || !collapse) return
      if (
        student.studentSchoolName == schoolName &&
        student.studentClass == classNameStr &&
        student.studentSection == sectionName
      ) {
        if (mode == 'update') {
          setStudents(students.map((row) => (row.id == student.id ? student : row)))
        } else if (mode == 'insert') {
          setStudents(students.concat(student))
        }
      }
    })
  }, [])

  useEffect(() => {
    if (collapse) {
      loadStudents()
    } else {
      setStudents([])
    }
  }, [collapse])

  const loadStudents = () => {
    setLoading(true)
    ipc
      .invoke('getStudentsBySection', {
        studentSchoolName: schoolName,
        studentClass: classNameStr,
        studentSection: sectionName
      })
      .then((students) => {
        console.log(students)
        setLoading(false)
        setStudents(students)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  return (
    <>
      {loading && <Loading />}
      <div className="py-1">
        <div className="rounded-none border border-e-0 border-s-0 border-t-0 border-neutral-200 dark:border-neutral-600 dark:bg-body-dark">
          <div className="mb-0 flex">
            <div
              className="flex items-center grow cursor-pointer"
              onClick={() => setCollapse(!collapse)}
            >
              <div className="w-10 flex justify-center">
                <span className="mr-2 text-[11px] px-[3.5px] font-bold py-[2px] border border-[#1F8194] section-shadow">
                  {sectionName || ''}
                </span>
              </div>
              <span className="w-80 px-2" hidden={!collapse}>
                {FM('name')}
              </span>
              <span hidden={!collapse}>{FM('mobile-num')}</span>
            </div>
            <div className="flex gap-0">
              <a
                href="javascript:"
                className="h-8 w-10 flex justify-center border-r border-gray-700 rtl:border-none dark:border-gray-500 cursor-pointer"
              >
                <img src={UserHomeIcon} className="object-none mx-2" />
              </a>
              <a
                href="javascript:"
                className="h-8 w-10 flex justify-center border-r border-gray-700 dark:border-gray-500 cursor-pointer"
              >
                <img src={ExchangeIcon} className="object-none mx-2" />
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
            className={`!visible border-0 ${collapse ? '' : 'hidden'} py-3`}
            data-twe-collapse-item
            data-twe-collapse-show={collapse}
            aria-labelledby="flush-headingOne"
            data-twe-parent="#accordionFlushExample"
          >
            <div className="flex">
              <div className="w-10"></div>
              <div className="grow">
                {students?.map((student: any, index: number) => (
                  <StudentRow
                    key={index}
                    student={student}
                    reload={reload}
                    setEditStudent={setEditStudent}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

SectionAccordion.defaultProps = {
  schoolName: '',
  classNameStr: '',
  sectionName: '',
  reload: () => {},
  setEditStudent: () => {}
}

export default SectionAccordion
