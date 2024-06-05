import { useRef, useState } from 'react'
import RedCrossIcon from '@renderer/assets/icons/red-cross.svg'
import { Modal, Button } from 'flowbite-react'
import { ModalTheme } from '@renderer/themes/ModalTheme'
import { GoQuestion, GoCheck } from 'react-icons/go'
import { Toast } from 'primereact/toast'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import { FM } from '@renderer/utils/i18helper'

const StudentRow = ({
  student,
  setEditStudent,
  reload
}: {
  student: any
  setEditStudent: any
  reload: any
}) => {
  const ipc = window.electron.ipcRenderer
  const toastRef: React.RefObject<Toast> = useRef(null)
  const [showDelete, setShowDelete] = useState<boolean>(false)
  const rtl: boolean = document.body.getAttribute('dir') == 'rtl'

  const deleteStudent = () => {
    // if no user selected to delete
    if (!showDelete) return
    ipc
      .invoke('deleteStudent', student?.id)
      .then((data) => {
        console.log('deleted data', data)
        setShowDelete(false)
        toastRef.current?.show({
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
        toastRef.current?.show({
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
        show={showDelete}
        onClose={() => {
          setShowDelete(false)
        }}
      >
        <Modal.Header className="py-3"></Modal.Header>
        <Modal.Body className="pt-5 text-center">
          <div className="flex justify-center my-2">
            <GoQuestion size={80} className="text-red-700" />
          </div>
          <div className="">{FM('delete-student-message')}</div>
          <p className="mt-4">{student?.studentName}</p>
          <p> {student?.studentID}</p>
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
          <Button color="gray" onClick={() => setShowDelete(false)}>
            {FM('cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  // if student is not defined
  if (!student) return <></>

  return (
    <>
      {renderDeleteModal()}
      <Toast ref={toastRef} position={rtl ? 'top-left' : 'top-right'} />
      <div className="flex mb-1">
        <div className="flex grow rounded-md shadow-md bg-[#F7F3F3] dark:bg-gray-600">
          <div
            className="grow cursor-pointer"
            onClick={() => setEditStudent && setEditStudent(student)}
          >
            <div className="w-80 px-2">{student?.studentName}</div>
            <div className="grow dark:text-gray-100">{student?.mobile}</div>
          </div>
          <div className="py-1 px-2 flex items-center">
            <a href="javascript:" className="cursor-pointer" onClick={() => setShowDelete(true)}>
              <img src={RedCrossIcon} className="object-none" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

StudentRow.defaultProps = {
  student: null,
  setEditStudent: () => {},
  reload: () => {}
}

export default StudentRow
