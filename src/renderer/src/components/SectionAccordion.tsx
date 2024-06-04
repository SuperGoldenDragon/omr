import EditSmallIcon from '@renderer/assets/icons/edit-green-small.svg'
import CancelSmallIcon from '@renderer/assets/icons/cancel-red-small.svg'
import CollapseOffDark from '@renderer/assets/icons/collapse-off-dark.svg'
import CollapseOffLight from '@renderer/assets/icons/collapse-off-light.svg'
import UserHomeIcon from '@renderer/assets/icons/user-home.svg'
import ExchangeIcon from '@renderer/assets/icons/exchange.svg'
import RedCrossIcon from '@renderer/assets/icons/red-cross.svg'
import { useState, useRef } from 'react'
import { FM } from '@renderer/utils/i18helper'
import { Modal, Button } from 'flowbite-react'
import { ModalTheme } from '@renderer/themes/ModalTheme'
import { GoQuestion, GoCheck } from 'react-icons/go'
import { Toast } from 'primereact/toast'
import { IoIosCloseCircleOutline } from "react-icons/io"

const SectionAccordion = ({
  sectionName,
  students,
  reload,
  setEditStudent
}: {
  sectionName: string
  students: any
  reload: any
  setEditStudent: any
}) => {
  const ipc = window.electron.ipcRenderer
  const deleteResultToast = useRef(null)
  const [needDeleteStudent, setNeedDeleteStudent] = useState<any>(null)
  const [collapse, setCollapse] = useState<boolean>(false)
  const darkMode: boolean = document.documentElement.classList.contains('dark')
  const rtl: boolean = document.body.getAttribute('dir') == 'rtl'

  const deleteStudent = () => {
    // if no user selected to delete
    if (!needDeleteStudent) return
    ipc
      .invoke('deleteStudent', needDeleteStudent?.id)
      .then((data) => {
        console.log('deleted data', data)
        setNeedDeleteStudent(null)
        deleteResultToast.current?.show({
          icon: <GoCheck className="mr-2 rtl:ml-3" size={30} />,
          severity: 'success',
          summary: FM('success'),
          detail: FM('deleted-student-successfully'),
          life: 2000
        })
        reload()
      })
      .catch((err) => {
        console.log('err', err)
        deleteResultToast.current?.show({
          icon: <IoIosCloseCircleOutline className="mr-2 rtl:ml-3" size={30} />,
          severity: 'error',
          summary: FM('failed'),
          detail: FM('delete-student-failed'),
          life: 2000
        })
      })
  }

  const renderDeleteModal = () => {
    return (
      <Modal
        popup
        theme={ModalTheme}
        size={'sm'}
        show={needDeleteStudent != null}
        onClose={() => {
          setNeedDeleteStudent(null)
        }}
      >
        <Modal.Header className="py-3"></Modal.Header>
        <Modal.Body className="pt-5 text-center">
          <div className="flex justify-center my-2">
            <GoQuestion size={80} className="text-red-700" />
          </div>
          <div className="">{FM('delete-student-message')}</div>
          <p className="mt-4">{needDeleteStudent?.studentName}</p>
          <p> {needDeleteStudent?.studentID}</p>
        </Modal.Body>
        <Modal.Footer className="justify-center py-3 px-4">
          <Button
            color={'failure'}
            className="rtl:ml-2"
            onClick={() => {
              deleteStudent()
            }}
          >
            {FM('delete')}
          </Button>
          <Button color="gray" onClick={() => setNeedDeleteStudent(null)}>
            {FM('cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <>
      {renderDeleteModal()}
      <Toast ref={deleteResultToast} position={rtl ? 'top-left' : 'top-right'} />
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
            {students?.map((student: any, index: number) => (
              <div className="flex mb-1" key={index}>
                <div className="w-10"></div>
                <div className="flex grow rounded-md shadow-md bg-[#F7F3F3] dark:bg-gray-600">
                  <div
                    className="grow cursor-pointer"
                    onClick={() => setEditStudent && setEditStudent(student)}
                  >
                    <div className="w-80 px-2">{student?.studentName}</div>
                    <div className="grow dark:text-gray-100">{student?.mobile}</div>
                  </div>
                  <div className="py-1 px-2 flex items-center">
                    <a
                      href="javascript:"
                      className="cursor-pointer"
                      onClick={() => setNeedDeleteStudent(student)}
                    >
                      <img src={RedCrossIcon} className="object-none" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

SectionAccordion.defaultProps = {
  sectionName: '',
  students: [],
  reload: () => {},
  setEditStudent: () => {}
}

export default SectionAccordion
