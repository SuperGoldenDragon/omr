import { useStudents } from '@renderer/context/Students'
import { ModalTheme } from '@renderer/themes/ModalTheme'
import { FM } from '@renderer/utils/i18helper'
import { Button, Label, Modal, Progress, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState, useRef } from 'react'
import PromptDialog from '@renderer/components/PromptDialog'
import AddStudentIcon from '@renderer/assets/icons/add-student.svg'
import ImportStudentIcon from '@renderer/assets/icons/import-student.svg'
import EditIcon from '@renderer/assets/icons/edit.svg'
import SaveIcon from '@renderer/assets/icons/create-round.svg'
import CancelIcon from '@renderer/assets/icons/cancel.svg'
import AddLightIcon from '@renderer/assets/icons/add-light.svg'
import EditLightIcon from '@renderer/assets/icons/edit-light.svg'
import CancelLightIcon from '@renderer/assets/icons/cancel-light.svg'
import CollapseOffIcon from '@renderer/assets/icons/collapse-off-light.svg'
import { FaArrowLeft } from 'react-icons/fa'
import SchoolAccordion from '@renderer/components/SchoolAccordion'
import { Toast } from 'primereact/toast'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import { GoCheck } from 'react-icons/go'
import StudentRow from '@renderer/components/StudentRow'

type CreateStudentProps = {
  id?: number
  studentID: number | string
  studentName: string
  studentClass: string
  studentSection: string
  studentSchoolName: string
}
const Students = () => {
  const ipc = window.electron.ipcRenderer
  const darkMode = document.documentElement.classList.contains('dark')
  const rtl: boolean = document.body.getAttribute('dir') == 'rtl'
  const toastRef: React.RefObject<Toast> = useRef(null)
  const {
    studentGroups,
    /* setPage,
    setClassName,
    page,
    perPage,
    order,
    setOrderBy, */
    /* className, */
    reloadData,
    setSearchBy
  } = useStudents()

  // const [openModal, setOpenModal] = useState(false)
  const [openSearchModal, setOpenSearchModal] = useState(false)
  const [studentData, setStudentData] = useState<CreateStudentProps>({
    studentName: '',
    studentID: '',
    studentSchoolName: '',
    studentClass: '',
    studentSection: ''
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [searchedBy, setSearchedBy] = useState<Record<string, string | number>>({})

  // field of new student
  const [createField, setCreateField] = useState<string>('')
  const [createTitle, setCreateTitle] = useState<string>('')
  const [createLabel, setCreateLabel] = useState<string>('')
  const [newFieldValues, setNewFieldValues] = useState<any>({})

  const [isCreateStudent, setIsCreateStudent] = useState<boolean>(false)
  const [editStudent, setEditStudent] = useState<any>(null)

  const [totalLoadStudents, setTotalLoadStudents] = useState<number>(0)
  const [currentLoadedStudents, setCurrentLoadedStudents] = useState<number>(0)

  useEffect(() => {
    ipc.on('import-students', (_event, { event }) => {
      console.log('event', event)

      if (event === 'closed') {
        // setOpen(false)
        // setWaiting(false)
      }
      if (event === 'mounted') {
        // setWaiting(false)
      }
    })

    ipc.on('xlsx-filename', (_event, filename: string) => {
      if (!filename) return
      ipc.invoke('loadStudentsFromXlsx', filename)
    })

    ipc.on('import-progress', (_event, val) => {
      if (val == totalLoadStudents) {
        setCurrentLoadedStudents(val)
        setTimeout(() => {
          setCurrentLoadedStudents(0)
          setTotalLoadStudents(0)
        }, 1000)
      }
    })

    reloadData()
  }, [])

  useEffect(() => {
    if (!createField) return
    if (createField === 'studentSchoolName') {
      setCreateTitle(FM('create-new-school'))
      setCreateLabel(getFieldLabel('studentSchoolName'))
    } else if (createField === 'studentClass') {
      setCreateTitle(FM('create-new-grade'))
      setCreateLabel(getFieldLabel('studentClass'))
    } else if (createField === 'studentSection') {
      setCreateTitle(FM('create-new-section'))
      setCreateLabel(getFieldLabel('studentSection'))
    }
  }, [createField])

  useEffect(() => {
    if (editStudent) {
      const { studentName, studentID, studentClass, studentSection, studentSchoolName } =
        editStudent
      // set values from student to edit
      setStudentData({ studentName, studentID, studentClass, studentSection, studentSchoolName })
    } else {
      // set inital valuse
      setStudentData({
        studentName: '',
        studentID: 0,
        studentClass: '',
        studentSection: '',
        studentSchoolName: ''
      })
    }
  }, [editStudent])

  // render select options
  const renderSelectOptions = (field: string) => {
    const schoolOptions = Object.keys(studentGroups?.schools || {})
    const gradeOptions = Object.keys(studentGroups?.grades || {})
    const sectionOptions = Object.keys(studentGroups?.sections || {})

    switch (field) {
      case 'studentSchoolName':
        return schoolOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))
      case 'studentClass':
        return gradeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))
      case 'studentSection':
        return sectionOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))

      default:
        return <option value=""></option>
    }
  }

  // get field label
  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'studentSchoolName':
        return FM('school')
      case 'studentClass':
        return FM('grade')
      case 'studentSection':
        return FM('section')
      case 'studentID':
        return FM('student-id')
      case 'studentName':
        return FM('student-name')
      default:
        return ''
    }
  }

  // save student
  const saveStudent = () => {
    console.log('studentData', studentData)

    // verify data and set errors
    const errors: Record<string, boolean> = {}
    const fields = Object.keys(studentData)

    // check if all fields are filled
    fields.forEach((field) => {
      // check if field is empty
      if (!studentData[field]) {
        errors[field] = true
      }

      // check if studentID is number
      if (field === 'studentID' && isNaN(Number(studentData[field]))) {
        errors[field] = true
      }
    })

    // check if there are any errors
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }

    ipc
      .invoke(editStudent ? 'updateStudent' : 'addStudent', {
        ...studentData,
        id: editStudent?.id
      })
      .then((data) => {
        console.log('saved student', data)
        toastRef.current?.show({
          icon: <GoCheck className="mr-2 rtl:ml-3" size={30} />,
          severity: 'success',
          summary: FM('success'),
          detail: FM('saved-student-successfully'),
          life: 2000
        })
        reloadData()
        // remove new values after create a new student
        setNewFieldValues({
          studentSchoolName: newFieldValues.studentSchoolName?.filter(
            (value: any) => value != studentData.studentSchoolName
          ),
          studentClass: newFieldValues.studentClass?.filter(
            (value: any) => value != studentData.studentClass
          ),
          studentSection: newFieldValues.studentSection?.filter(
            (value: any) => value != studentData.studentSection
          )
        })
        // if is create mode
        if (!editStudent) {
          setStudentData({
            studentName: '',
            studentID: 0,
            studentClass: '',
            studentSection: '',
            studentSchoolName: ''
          })
        }
      })
      .catch((err) => {
        console.log('err', err)
        toastRef.current?.show({
          icon: <IoIosCloseCircleOutline className="mr-2 rtl:ml-3" size={30} />,
          severity: 'error',
          summary: FM('failed'),
          detail: FM('save-student-failed'),
          life: 2000
        })
      })
  }

  // handle search
  const handleSearch = () => {
    console.log('studentData', studentData)

    // check if all fields are empty
    const fields = Object.keys(studentData)

    let empty = true

    fields.forEach((field) => {
      if (studentData[field]) {
        empty = false
      }
    })

    if (empty) {
      setOpenSearchModal(false)
      setSearchBy?.({})
      return
    }

    // set search by
    setSearchBy?.(studentData)

    // update searched by
    setSearchedBy(studentData)

    // close modal
    setOpenSearchModal(false)

    // reset student data
    setStudentData({
      studentName: '',
      studentID: '',
      studentSchoolName: '',
      studentClass: '',
      studentSection: ''
    })
  }

  // render search modal
  const renderSearchModal = () => {
    const fields = Object.keys(studentData).filter((field) => {
      return field !== 'id' && field !== 'studentClass'
    })

    return (
      <Modal
        theme={ModalTheme}
        show={openSearchModal}
        onClose={() => {
          setOpenSearchModal(false)
          setStudentData({
            studentName: '',
            studentID: 0,
            studentSchoolName: '',
            studentClass: '',
            studentSection: ''
          })
          setErrors({})
        }}
      >
        <Modal.Header className="py-3">{FM('search')}</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-2 gap-5 ">
            {fields?.map((field) => {
              return (
                <div key={field}>
                  <div className="mb-1 block">
                    <Label htmlFor={field} value={getFieldLabel(field)} />
                  </div>
                  {['studentSchoolName', 'studentClass', 'studentSection'].includes(field) ? (
                    <Select
                      value={studentData[field]}
                      id={field}
                      className={`${errors[field] && 'ring-1 ring-red-500 rounded-lg'}`}
                      onChange={(e) => {
                        setStudentData({ ...studentData, [field]: e.target.value })
                        setErrors({ ...errors, [field]: false })
                      }}
                    >
                      <option value="">{FM('select')}</option>
                      {renderSelectOptions(field)}
                    </Select>
                  ) : (
                    <TextInput
                      value={studentData[field]}
                      onChange={(e) => {
                        setStudentData({ ...studentData, [field]: e.target.value })
                        setErrors({ ...errors, [field]: false })
                      }}
                      className={`${errors[field] && 'ring-1 ring-red-500 rounded-lg'}`}
                      id={field}
                      type={'text'}
                      placeholder=""
                    />
                  )}
                </div>
              )
            })}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-end py-3 px-4">
          <Button className="rtl:ml-2" onClick={handleSearch}>
            {FM('search')}
          </Button>
          <Button
            color="gray"
            onClick={() => {
              setOpenSearchModal(false)
              setStudentData({
                studentName: '',
                studentID: 0,
                studentSchoolName: '',
                studentClass: '',
                studentSection: ''
              })
              setErrors({})
            }}
          >
            {FM('cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  // render searched by
  const renderSearchedBy = () => {
    const re: any[] = []
    // filter empty fields
    const fields = Object.keys(searchedBy).filter((field) => {
      return searchedBy[field]
    })

    fields.map((field) => {
      re.push(
        <span
          key={field}
          className="flex  text-sm items-center bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 ml-2 mb-0"
        >
          {getFieldLabel(field)}: {searchedBy[field]}
          <span
            className="ml-2 cursor-pointer text-sm "
            onClick={() => {
              setSearchedBy((prev) => {
                const newSearchedBy = { ...prev }
                delete newSearchedBy[field]
                return newSearchedBy
              })
              setSearchBy?.({ ...searchedBy, [field]: '' })
            }}
          >
            x
          </span>
        </span>
      )
    })

    if (fields.length === 0) return <></>

    // return searched by
    return <span className="ml-0 flex flex-1">Searched By: {re}</span>
  }

  const isSearched =
    Object.keys(searchedBy).filter((field) => {
      return searchedBy[field]
    }).length > 0

  // event handler to create new values for school, class, section
  const onCreateNewFieldValue = (value: string) => {
    if (!value) return
    if (!newFieldValues[createField]) {
      setNewFieldValues({ ...newFieldValues, [createField]: [value] })
    } else {
      setNewFieldValues({
        ...newFieldValues,
        [createField]: newFieldValues[createField].concat(value)
      })
    }
    setStudentData({ ...studentData, [createField]: value })
  }

  const onOpenImportDialog = () => {
    ipc.invoke('import-students')
  }

  return (
    <div className="p-2 flex flex-col h-screen">
      <Toast ref={toastRef} position={rtl ? 'top-left' : 'top-right'} />
      {renderSearchModal()}
      <div>
        <div hidden={!isCreateStudent}>
          <div className="flex py-4">
            <div className="grow-0 items-center py-4">
              <a
                href="javascript:"
                className="flex items-center text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer"
                onClick={() => setIsCreateStudent(false)}
              >
                <FaArrowLeft className="mr-2" />
                <span className="font-semibold">{FM('add-student')}</span>
              </a>
            </div>
            <div className="flex justify-center grow">
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={SaveIcon} />
                </div>
                <div className="text-center font-semibold">{FM('save')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                onClick={() => setIsCreateStudent(false)}
              >
                <div className="mb-2 flex justify-center">
                  <img src={CancelIcon} />
                </div>
                <div className="text-center font-semibold">{FM('cancel')}</div>
              </a>
            </div>
          </div>
        </div>
        <div hidden={!editStudent}>
          <div className="flex py-4">
            <div className="grow-0 items-center py-4">
              <a
                href="javascript:"
                className="flex items-center text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer"
                onClick={() => setEditStudent(null)}
              >
                <FaArrowLeft className="mr-2" />
                <span className="font-semibold">{FM('edit-student')}</span>
              </a>
            </div>
            <div className="flex justify-center grow">
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                onClick={saveStudent}
              >
                <div className="mb-2 flex justify-center">
                  <img src={EditIcon} />
                </div>
                <div className="text-center font-semibold">{FM('save')}</div>
              </a>
              <a
                href="javascript:"
                className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
                onClick={() => setEditStudent(null)}
              >
                <div className="mb-2 flex justify-center">
                  <img src={CancelIcon} />
                </div>
                <div className="text-center font-semibold">{FM('cancel')}</div>
              </a>
            </div>
          </div>
        </div>
        <div hidden={isCreateStudent || editStudent != null}>
          <div className="flex justify-center py-4">
            <a
              href="javascript:"
              className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
              onClick={() => setIsCreateStudent(true)}
            >
              <div className="mb-2 flex justify-center">
                <img src={AddStudentIcon} />
              </div>
              <div className="text-center font-semibold">{FM('add-student')}</div>
            </a>
            <a
              href="javascript:"
              className="hover:bg-gray-200 rounded mr-4 px-3 py-2 dark:hover:bg-gray-700"
              onClick={() => onOpenImportDialog()}
            >
              <div className="mb-2 flex justify-center">
                <img src={ImportStudentIcon} />
              </div>
              <div className="text-center font-semibold">{FM('import-students')}</div>
            </a>
          </div>
        </div>
      </div>
      <div
        className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3"
        hidden={!isCreateStudent && !editStudent}
      >
        <div className="flex flex-row gap-10 justify-center ">
          <div className="basis-1/3">
            <div className="mb-1 block">
              <Label htmlFor={'studentName'} value={getFieldLabel('studentName')} />
              <TextInput
                value={studentData['studentName']}
                onChange={(e) => {
                  setStudentData({ ...studentData, ['studentName']: e.target.value })
                  setErrors({ ...errors, ['studentName']: false })
                }}
                className={`${errors['studentName'] && 'ring-1 ring-red-500 rounded-lg'}`}
                id={'studentName'}
                type="text"
                placeholder={FM('student-name')}
              />
            </div>
          </div>
          <div className="basis-1/3">
            <div className="mb-1 block">
              <Label htmlFor={'studentID'} value={getFieldLabel('studentID')} />
              <TextInput
                value={studentData['studentID']}
                onChange={(e) => {
                  setStudentData({ ...studentData, ['studentID']: e.target.value })
                  setErrors({ ...errors, ['studentID']: false })
                }}
                className={`${errors['studentID'] && 'ring-1 ring-red-500 rounded-lg'}`}
                id={'studentID'}
                type="number"
                placeholder={FM('student-id')}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-10 justify-center ">
          <div className="col-span-2">
            <div className="mb-1 block">
              <Label htmlFor={'studentSchoolName'} value={getFieldLabel('studentSchoolName')} />
              <Select
                value={studentData['studentSchoolName']}
                id={'studentSchoolName'}
                className={`${errors['studentSchoolName'] && 'ring-1 ring-red-500 rounded-lg'}`}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'create-new') {
                    setCreateField('studentSchoolName')
                    return
                  }
                  setStudentData({ ...studentData, ['studentSchoolName']: value })
                  setErrors({ ...errors, ['studentSchoolName']: false })
                }}
              >
                <option value="" disabled hidden>
                  {FM('select')}
                </option>
                <option value="create-new">{FM('create-new-school')}</option>
                {renderSelectOptions('studentSchoolName')}
                {newFieldValues['studentSchoolName']?.map((value: string) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-span-2">
            <div className="mb-1 block">
              <Label htmlFor={'studentClass'} value={getFieldLabel('studentClass')} />
              <Select
                value={studentData['studentClass']}
                id={'studentClass'}
                className={`${errors['studentClass'] && 'ring-1 ring-red-500 rounded-lg'}`}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'create-new') {
                    setCreateField('studentClass')
                    return
                  }
                  setStudentData({ ...studentData, ['studentClass']: value })
                  setErrors({ ...errors, ['studentClass']: false })
                }}
              >
                <option value="" disabled hidden>
                  {FM('select')}
                </option>
                <option value="create-new">{FM('create-new-grade')}</option>
                {renderSelectOptions('studentClass')}
                {newFieldValues['studentClass']?.map((value: string) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="col-span-2">
            <div className="mb-1 block">
              <Label htmlFor={'studentSection'} value={getFieldLabel('studentSection')} />
              <Select
                value={studentData['studentSection']}
                id={'studentSection'}
                className={`${errors['studentSection'] && 'ring-1 ring-red-500 rounded-lg'}`}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'create-new') {
                    setCreateField('studentSection')
                    return
                  }
                  setStudentData({ ...studentData, ['studentSection']: value })
                  setErrors({ ...errors, ['studentSection']: false })
                }}
              >
                <option value="" disabled hidden>
                  {FM('select')}
                </option>
                <option value="create-new">{FM('create-new-section')}</option>
                {renderSelectOptions('studentSection')}
                {newFieldValues['studentSection']?.map((value: string) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`bg-white dark:bg-gray-700 rounded-lg flex-1 flex flex-col h-0 p-1 ${(isCreateStudent || editStudent) && 'hidden'}`}
      >
        <p className="text-sm font-bold mb-2 p-4 flex justify-between items-center border-b dark:border-gray-800">
          <div className="text-base flex">
            {!isSearched && (
              <>
                {FM('students')} ({studentGroups?.totalStudents || 0})
              </>
            )}{' '}
            {renderSearchedBy()}
          </div>
          <div className="ml-2 bg-[#1F8295] flex rounded-t-[16px] p-[5px]">
            <a
              href="javascript:"
              className="h-9 w-9 flex justify-center border-r border-gray-700 cursor-pointer"
            >
              <img src={AddLightIcon} className="object-none mx-3" />
            </a>
            <a
              href="javascript:"
              className="h-9 w-9 flex justify-center border-r border-gray-700 cursor-pointer"
            >
              <img src={EditLightIcon} className="object-none mx-3" />
            </a>
            <a
              href="javascript:"
              className="h-9 w-9 flex justify-center border-r border-gray-700 cursor-pointer"
            >
              <img src={CancelLightIcon} className="object-none mx-3" />
            </a>
            <a href="javascript:" className="h-9 w-9 flex justify-center cursor-pointer">
              <img src={CollapseOffIcon} className="object-none mx-3" />
            </a>
          </div>
        </p>
        <div
          className={`p-4 flex-1 h-0 overflow-auto ${darkMode ? 'overflow-y-auto-dark' : 'overflow-y-auto-light'}`}
        >
          {Object.keys(studentGroups?.schools || {}).map((schoolName: string, index: number) => (
            <SchoolAccordion
              key={index}
              schoolName={schoolName}
              classes={studentGroups?.schools[schoolName]?.classes}
              setEditStudent={setEditStudent}
              reload={reloadData}
            />
          ))}
        </div>
      </div>
      {editStudent && (
        <div
          className={`bg-white dark:bg-gray-700 rounded-lg flex-1 p-2 h-0 overflow-auto ${darkMode ? 'overflow-y-auto-dark' : 'overflow-y-auto-light'}`}
        >
          {studentGroups?.schools[editStudent.studentSchoolName].classes[editStudent.studentClass][
            editStudent.studentSection
          ].map((student: any, index: number) => (
            <StudentRow
              key={index}
              student={student}
              reload={reloadData}
              setEditStudent={setEditStudent}
            />
          ))}
        </div>
      )}
      <PromptDialog
        show={createField ? true : false}
        onClose={() => setCreateField('')}
        onSave={onCreateNewFieldValue}
        title={createTitle}
        label={createLabel}
      />
      {totalLoadStudents > 0 && (
        <div className="fixed bg-transparent flex justify-center items-center left-0 z-[100] h-screen w-full">
          <div className="bg-slate-800/80 rounded-lg w-[300px] px-4 py-3">
            <Progress progress={45} />
            <div className="text-center pt-2">
              Loading...({`${currentLoadedStudents}/${totalLoadStudents}`})
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students
