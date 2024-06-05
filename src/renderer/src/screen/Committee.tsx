import { useEffect, useRef, useState } from 'react'
import { FM } from '@renderer/utils/i18helper'
import CreateIcon from '@renderer/assets/icons/create.svg'
import EditIcon from '@renderer/assets/icons/edit.svg'
import StudentGroupIcon from '@renderer/assets/icons/student-group.svg'
import ExportIcon from '@renderer/assets/icons/export.svg'
import { ModalTheme } from '@renderer/themes/ModalTheme'
import { Button, Modal, Checkbox, Label } from 'flowbite-react'
import { IoCloseOutline } from 'react-icons/io5'
import { IoIosArrowDown } from 'react-icons/io'
import { Toast } from 'primereact/toast'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import { GoCheck } from 'react-icons/go'

const Committee = () => {
  const ipc = window.electron.ipcRenderer
  const toastRef: React.RefObject<Toast> = useRef(null)
  const darkMode = document.documentElement.classList.contains('dark')
  const rtl = document.body.getAttribute('dir') == 'rtl'
  const [openCreate, setOpenCreate] = useState<boolean>(false)
  const [noOfCommitte, setNoOfCommitte] = useState<number>(0)
  const [deletePrevious, setDeletePrevious] = useState<boolean>(false)
  const [distributeStudents, setDistributeStudents] = useState<boolean>(false)
  const [classroomCommittee, setClassroomCommittee] = useState<boolean>(false)
  const [committess, setCommittess] = useState<any>([])

  useEffect(() => {
    loadCommittees()
    return () => {
      setCommittess([])
    }
  }, [])

  const loadCommittees = () => {
    ipc
      .invoke('getCommittees')
      .then((committess) => {
        setCommittess(committess || [])
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // add new committe
  const addCommitte = () => {
    if (noOfCommitte <= 0) return
    ipc
      .invoke('createCommittee', {
        committeeNamePrefix: 'Committee',
        noOfCommittee: noOfCommitte,
        deletePrevious: deletePrevious,
        distributeStudents: distributeStudents,
        classroomCommittee: classroomCommittee
      })
      .then(() => {
        toastRef.current?.show({
          icon: <GoCheck className="mr-2 rtl:ml-3" size={30} />,
          severity: 'success',
          summary: FM('success'),
          detail: FM('create-committees-success'),
          life: 2000
        })
        loadCommittees()
        setOpenCreate(false)
      })
      .catch((err) => {
        console.log(err)
        toastRef.current?.show({
          icon: <IoIosCloseCircleOutline className="mr-2 rtl:ml-3" size={30} />,
          severity: 'error',
          summary: FM('failed'),
          detail: FM('create-committees-failed'),
          life: 2000
        })
      })
  }

  const renderCreateCommitteeModal = () => {
    return (
      <Modal theme={ModalTheme} show={openCreate} onClose={() => setOpenCreate(false)}>
        <Modal.Body className="px-4">
          <div className="py-3 border-b-2 border-gray-600 dark:border-gray-200 text-center text-xl font-bold">
            {FM('examination-committees')}
          </div>
          <div className="flex justify-center gap-2 items-center mb-2 py-2">
            <span>{FM('number-committees')}</span>
            <input
              type="number"
              className="outline-none focus:outline-none border-0 ring-0 focus:ring-0 focus:border-0 bg-gray-300 dark:bg-gray-600 rounded-lg w-20 py-1 text-sm text-center"
              min={0}
              value={noOfCommitte}
              onChange={(e) => setNoOfCommitte(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2 justify-between mb-2">
            <Label htmlFor="deleting-previous">{FM('start-by-deleting-previous')}</Label>
            <Checkbox
              id="deleting-previous"
              checked={deletePrevious}
              onChange={(e) => setDeletePrevious(e.target.checked)}
            />
          </div>
          <div className="flex items-center gap-2 justify-between mb-2">
            <Label htmlFor="distribute-student">{FM('distribute-student-committee')}</Label>
            <Checkbox
              id="distribute-student"
              checked={distributeStudents}
              onChange={(e) => setDistributeStudents(e.target.checked)}
            />
          </div>
          <div className="flex items-center gap-2 justify-between mb-2">
            <Label htmlFor="classroom-committee">{FM('classrooms-committees')}</Label>
            <Checkbox
              id="classroom-committee"
              checked={classroomCommittee}
              onChange={(e) => setClassroomCommittee(e.target.checked)}
            />
          </div>
          <div className="flex justify-end  py-2 border-b-2 border-gray-600 dark:border-gray-200">
            <Button size="sm" className="rtl:ml-2 mr-2" onClick={addCommitte}>
              {FM('add-committees')}
            </Button>
            <Button color="failure" size="sm" onClick={() => setOpenCreate(false)}>
              {FM('cancel')}
            </Button>
          </div>
          <div className="p-3">{FM('add-committees-description')}</div>
        </Modal.Body>
      </Modal>
    )
  }

  return (
    <>
      {renderCreateCommitteeModal()}
      <Toast ref={toastRef} position={rtl ? 'top-left' : 'top-right'} />
      <div className="flex flex-col h-screen p-2">
        <div>
          <div className="flex py-4">
            <div className="items-center py-4">
              <span className="text-gray-700 dark:text-white font-semibold">
                {FM('examination-committees')}
              </span>
            </div>
            <div className="flex justify-center grow">
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                onClick={() => setOpenCreate(true)}
              >
                <div className="mb-2 flex justify-center">
                  <img src={CreateIcon} />
                </div>
                <div className="text-center font-semibold">{FM('add-committee')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={StudentGroupIcon} />
                </div>
                <div className="text-center font-semibold">{FM('assign-students')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={ExportIcon} />
                </div>
                <div className="text-center font-semibold">{FM('export')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                // onClick={() => setIsCreateStudent(false)}
              >
                <div className="mb-2 flex justify-center">
                  <img src={EditIcon} />
                </div>
                <div className="text-center font-semibold">{FM('edit')}</div>
              </a>
            </div>
          </div>
        </div>
        <div className="mb-2 rounded-lg bg-white dark:bg-gray-700 p-3 h-0 flex-1 flex flex-col">
          <div className="flex">
            <div className="basis-1/5 px-1">
              <div className="text-md font-bold text-gray-900 dark:text-gray-100 mb-1">Total</div>
              <div className="text-md font-bold text-gray-900 dark:text-gray-100">422</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-bold mb-1">القول المتوسط</div>
              <div className="text-center font-bold">Complete ({140})</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-bold mb-1">الثاني المتوسط</div>
              <div className="text-center font-bold">Complete ({140})</div>
            </div>
            <div className="basis-1/5">
              <div className="text-center font-bold mb-1">الأحد المتوسط</div>
              <div className="text-center font-bold">Complete ({140})</div>
            </div>
          </div>
          <div
            className={`h-0 flex-1 overflow-auto pr-2 ${darkMode ? 'overflow-y-auto-dark' : 'overflow-y-auto-light'}`}
          >
            {committess.map((committee: any, index: number) => (
              <div className={`rounded-lg bg-gray-200 dark:bg-gray-600 flex p-1 my-1`} key={index}>
                <div className="basis-1/5 flex items-center">
                  <img src={EditIcon} className="object-none mx-3" />
                  <div className="border-l px-2 font-bold border-gray-700 dark:border-gray-200 flex h-full items-center">
                    {committee?.committeeName}
                  </div>
                </div>
                <div className="basis-1/5">
                  <div className="text-center font-semibold">assecf fklsefef</div>
                  <div className="text-center font-semibold">14 from</div>
                </div>
                <div className="basis-1/5">
                  <div className="text-center font-semibold">assecf fklsefef</div>
                  <div className="text-center font-semibold">14 from</div>
                </div>
                <div className="basis-1/5">
                  <div className="text-center font-semibold">assecf fklsefef</div>
                  <div className="text-center font-semibold">14 from</div>
                </div>
                <div className="basis-1/5 flex items-center">
                  <Button gradientDuoTone="greenToBlue" size="sm" className="mr-auto">
                    Complete {43}
                  </Button>
                  <a href="javascript:" className="cursor-pointer mx-2">
                    <IoCloseOutline size={24} className="text-red-400" />
                  </a>
                  <a href="javascript:" className="cursor-pointer mx-2">
                    <IoIosArrowDown size={24} className="text-gray-700 dark:text-gray-200" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Committee
