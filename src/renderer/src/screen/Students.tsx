import { useStudents } from '@renderer/context/Students'
import { buttonGroupTheme } from '@renderer/themes/ButtonGroupTheme'
import { ModalTheme } from '@renderer/themes/ModalTheme'
import { PaginationTheme } from '@renderer/themes/PaginationTheme'
import { themeForTabs } from '@renderer/themes/tabs'
import { FM } from '@renderer/utils/i18helper'
import {
  Button,
  Label,
  Modal,
  Pagination,
  Select,
  Tabs,
  TabsRef,
  TextInput,
  Tooltip
} from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { BiSearchAlt } from 'react-icons/bi'
import { MdEdit, MdOutlineDeleteForever } from 'react-icons/md'
import { PiSortAscendingBold, PiSortDescendingBold, PiStudentBold } from 'react-icons/pi'
import { GrNotes } from 'react-icons/gr'
import PromptDialog from '@renderer/components/PromptDialog'


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
  const [open, setOpen] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const {
    students,
    studentGroups,
    setPage,
    setClassName,
    page,
    perPage,
    order,
    setOrderBy,
    reloadData,
    setSearchBy,
    className
  } = useStudents()
  const tabsRef = useRef<TabsRef>(null)
  const [_activeTab, setActiveTab] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [openSearchModal, setOpenSearchModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined)
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

  useEffect(() => {
    ipc.on('import-students', (_event, { event }) => {
      console.log('event', event)

      if (event === 'closed') {
        setOpen(false)
        setWaiting(false)
      }
      if (event === 'mounted') {
        setWaiting(false)
      }
    })
  }, [])

  // render tabs
  const renderTabs = (isSearched: boolean) => {
    const re: any[] = []

    if (Object.keys(studentGroups?.grades || {}).length > 0 && studentGroups) {
      for (const key in studentGroups.grades) {
        const total =
          key === className && isSearched
            ? students?.total
            : studentGroups.grades[key].totalStudents
        re.push(<Tabs.Item key={key} title={`${key} (${total})`} icon={PiStudentBold} />)
      }
    } else {
      re.push(<Tabs.Item key={1} title={`السنة المشترك	(0)`} icon={PiStudentBold} />)
    }

    return re
  }

  // render students
  const renderStudents = () => {
    const re: any[] = []
    if (students && students?.students?.length > 0) {
      const currentStudents = students.students
      const startIndex = (page - 1) * perPage + 1
      // loop through students
      for (let i = 0; i < currentStudents.length; i++) {
        const student = currentStudents[i]
        const index = startIndex + i

        re.push(
          <div
            key={index}
            className="flex justify-between items-center border-b mb-0 border-gray-200 dark:border-gray-700 pr-3 rtl:pl-3"
          >
            <div className="py-3.5 px-4 pl-10 w-28 break-all">{index}</div>
            <div className="py-3.5 px-4 flex-1 break-all">{student.studentID}</div>
            <div className="py-3.5 px-4 flex-1 min-w-80 break-all">{student.studentName}</div>
            <div className="py-3.5 px-4 flex-1 break-all">{student.studentSection}</div>
            <div className="py-3.5 px-4 flex-1 break-all">{student.studentSchoolName}</div>
            <div className="py-3.5 px-4 flex-1 flex break-all">
              <span
                className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                onClick={() => {
                  openEditModal(student)
                }}
              >
                <Tooltip content={FM('edit')} placement="top" className="">
                  <MdEdit fontSize={20} />
                </Tooltip>
              </span>
              <span
                className="font-medium text-red-600 hover:underline dark:text-red-500 ml-2"
                onClick={() => {
                  handleDeleteModal(student.id)
                }}
              >
                <Tooltip content={FM('delete')} placement="top" className="">
                  <MdOutlineDeleteForever fontSize={21} />
                </Tooltip>
              </span>
            </div>
          </div>
        )
      }
    } else {
      return (
        <>
          <div className="mt-32 flex items-center justify-center">
            <GrNotes fontSize={'150'} />
          </div>
          <div className="flex items-center justify-center mt-4">{FM('no-records-found')}</div>
        </>
      )
    }

    return re
  }

  // get total pages
  const getTotalPages = () => {
    if (students) {
      const total = students.total
      return Math.ceil(total / perPage)
    }
    return 0
  }

  // render sort icon
  const SortButton = ({ name, title }: { name: string; title: string }) => {
    const type = order?.[name] || 'ASC'

    let re = (
      <>
        <span className="ml-2 hidden group-hover:block">
          <PiSortAscendingBold
            onClick={() => {
              setOrderBy?.(name, 'ASC')
            }}
          />
        </span>
      </>
    )

    if (order?.[name] !== undefined) {
      if (type === 'ASC') {
        re = (
          <span className="ml-2">
            <PiSortDescendingBold
              onClick={() => {
                setOrderBy?.(name, 'DESC')
              }}
            />
          </span>
        )
      } else if (type === 'DESC') {
        re = (
          <span className="ml-2">
            <PiSortAscendingBold
              onClick={() => {
                setOrderBy?.(name, 'ASC')
              }}
            />
          </span>
        )
      }
    }

    return (
      <div
        className="flex flex-row items-center"
        onClick={() => {
          setOrderBy?.(name, type === 'ASC' ? 'DESC' : 'ASC')
        }}
      >
        {title}
        {re}
      </div>
    )
  }

  // render header
  const renderHeader = () => {
    if (students?.students.length === 0) return <></>

    return (
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 border-b border-t mb-0 border-gray-200 dark:border-gray-700 pr-3 rtl:pl-3">
        <div className="px-4 py-2 pl-10 w-28">#</div>
        <div className="px-4 py-2 flex-1 group">
          <SortButton title={FM('student-id')} name="studentID" />
        </div>
        <div className="px-4 py-2 flex-1 min-w-80 group">
          <SortButton title={FM('student-name')} name="studentName" />
        </div>
        <div className="px-4 py-2 flex-1 group">
          <SortButton title={FM('section')} name="studentSection" />
        </div>
        <div className="px-4 py-2 flex-1 group">
          <SortButton title={FM('school')} name="studentSchoolName" />
        </div>
        <div className="px-4 py-2 flex-1"></div>
      </div>
    )
  }

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
      .invoke('addStudent', studentData)
      .then((data) => {
        console.log('data', data)
        reloadData()

        // send data to main process
        setOpenModal(false)

        setStudentData({
          studentName: '',
          studentID: 0,
          studentClass: '',
          studentSection: '',
          studentSchoolName: ''
        })
      })
      .catch((err) => {
        console.log('err', err)
      })
  }

  // edit student
  const editStudent = () => {
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
      .invoke('updateStudent', studentData)
      .then((data) => {
        console.log('data', data)
        reloadData()

        // send data to main process
        setOpenModal(false)

        setStudentData({
          studentName: '',
          studentID: 0,
          studentSchoolName: '',
          studentClass: '',
          studentSection: ''
        })
      })
      .catch((err) => {
        console.log('err', err)
      })
  }

  // open delete modal
  const handleDeleteModal = (id: number) => {
    setOpenDeleteModal(true)
    setDeleteId(id)
  }

  // delete student
  const deleteStudent = () => {
    if (deleteId) {
      ipc
        .invoke('deleteStudent', deleteId)
        .then((data) => {
          console.log('data', data)
          reloadData()
          setOpenDeleteModal(false)
          setDeleteId(undefined)
        })
        .catch((err) => {
          console.log('err', err)
        })
    }
  }

  // delete all students
  const deleteAllStudents = () => {
    ipc
      .invoke('removeAllStudents')
      .then((data) => {
        console.log('data', data)
        reloadData()
      })
      .catch((err) => {
        console.log('err', err)
      })
  }

  // open edit modal
  const openEditModal = (data: CreateStudentProps) => {
    console.log('data sdsd', data)

    setOpenModal(true)
    setStudentData({
      studentName: data.studentName,
      studentID: data.studentID,
      studentSchoolName: data.studentSchoolName,
      studentClass: data.studentClass,
      studentSection: data.studentSection,
      id: data.id
    })
  }

  // render create modal
  const renderCreateModal = () => {
    const fields = Object.keys(studentData).filter((field) => {
      return field !== 'id'
    })

    return (
      <Modal
        theme={ModalTheme}
        show={openModal}
        onClose={() => {
          setOpenModal(false)
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
        <Modal.Header className="py-3">{FM('create-more-students')}</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-6 gap-5 ">
            {fields?.map((field) => {
              return (
                <div
                  key={field}
                  className={
                    field === 'studentName' || field === 'studentID' ? 'col-span-3' : 'col-span-2'
                  }
                >
                  <div className="mb-1 block">
                    <Label htmlFor={field} value={getFieldLabel(field)} />
                  </div>
                  {['studentSchoolName', 'studentClass', 'studentSection'].includes(field) ? (
                    <Select
                      value={studentData[field]}
                      id={field}
                      className={`${errors[field] && 'ring-1 ring-red-500 rounded-lg'}`}
                      onChange={(e) => {
                        // get value of select school
                        const value = e.target.value
                        // if select create new school open enter new school dialog
                        if (value === 'create-new-school') {
                          setCreateField('studentSchool')
                          return
                        }
                        setStudentData({ ...studentData, [field]: value })
                        setErrors({ ...errors, [field]: false })
                      }}
                    >
                      <option value="">{FM('select')}</option>
                      <option value="create-new-school">{FM('create-new-school')}</option>
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
                      type={field === 'studentID' ? 'number' : 'text'}
                      min={field === 'studentID' ? 0 : undefined}
                      placeholder=""
                    />
                  )}
                </div>
              )
            })}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-end py-3 px-4">
          {studentData.id ? (
            <Button className="rtl:ml-2" onClick={editStudent}>
              {FM('edit')}
            </Button>
          ) : (
            <Button className="rtl:ml-2" onClick={saveStudent}>
              {FM('save')}
            </Button>
          )}
          <Button
            color="gray"
            className=""
            onClick={() => {
              setOpenModal(false)
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

  // render delete modal
  const renderDeleteModal = () => {
    const student = students?.students.find((student) => student.id === deleteId)
    return (
      <Modal
        popup
        theme={ModalTheme}
        size={'sm'}
        show={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false)
        }}
      >
        <Modal.Header className="py-3"></Modal.Header>
        <Modal.Body className="pt-5 text-center">
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
          <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
            {FM('cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const isSearched =
    Object.keys(searchedBy).filter((field) => {
      return searchedBy[field]
    }).length > 0

  return (
    <div>
      {renderCreateModal()}
      {renderSearchModal()}
      {renderDeleteModal()}
      <p className="text-sm font-bold mb-0 p-4 flex justify-between items-center border-b dark:border-gray-800">
        <div className="text-base flex">
          {!isSearched && (
            <>
              {FM('students')} ({studentGroups?.totalStudents || 0})
            </>
          )}{' '}
          {renderSearchedBy()}
        </div>

        <Button.Group theme={buttonGroupTheme} className="ml-2">
          <Button
            color="gray"
            className="p-0 rtl:rounded-r-lg rtl:rounded-l-none rtl:border-l-0"
            size={'sm'}
            onClick={() => {
              deleteAllStudents()
            }}
          >
            {FM('delete-all-students')}
          </Button>
          <Button
            disabled={open}
            color="gray"
            className={
              'p-0 rtl:rounded-r-lg rtl:rounded-l-none rtl:border-l-0' +
              (open && waiting ? ' cursor-wait' : '')
            }
            size={'sm'}
            onClick={() => {
              window.open('##importStudents##', '_blank')
              setOpen(true)
              setWaiting(true)
            }}
          >
            {FM('import-students')}
          </Button>
          <Button
            color="gray"
            className="p-0 rtl:rounded-l-lg rtl:rounded-r-none rtl:border-l"
            size={'sm'}
            onClick={() => setOpenModal(true)}
          >
            {FM('add-more-students')}
          </Button>
        </Button.Group>
      </p>
      <div className="flex justify-between items-center border-b mb-0 border-gray-200 dark:border-gray-700 pr-3 rtl:pl-3">
        <Tabs
          theme={themeForTabs}
          aria-label="Default tabs"
          className="mb-0 flex-1"
          style="underline"
          ref={tabsRef}
          onActiveTabChange={(tab) => {
            setClassName?.(Object.keys(studentGroups?.grades || {})[tab])
            setActiveTab(tab)
            setPage(1)
            setOrderBy?.()
          }}
        >
          {renderTabs(isSearched)}
        </Tabs>

        <div className="flex items-center">
          <span
            className="flex items-center"
            onClick={() => {
              setOpenSearchModal(true)
            }}
          >
            <Tooltip content={FM('search')}>
              <BiSearchAlt fontSize={18} />
            </Tooltip>
          </span>
          <span className="mx-4 dark:text-gray-700">|</span>
          <span>{FM('sort-by')}:</span>
          <Select
            className="ml-4 rtl:mr-4"
            sizing={'sm'}
            onChange={(e) => {
              setOrderBy?.('id', e.target.value === 'latest' ? 'DESC' : 'ASC')
            }}
          >
            <option disabled>{FM('order-by')}</option>
            <option value={'latest'}>{FM('latest-first')}</option>
            <option value={'oldest'}>{FM('oldest-first')}</option>
          </Select>
        </div>
      </div>
      <div className="">
        {renderHeader()}
        <div className="overflow-y-auto custom-scrollbar h-screen-student-table">
          {renderStudents()}
        </div>
        {renderHeader()}
      </div>
      {getTotalPages() > 0 && (
        <div className="flex justify-center bg-white dark:bg-gray-900 pb-2 pr-3 rtl:pl-3">
          <Pagination
            theme={PaginationTheme}
            nextLabel={FM('next')}
            previousLabel={FM('previous')}
            key={getTotalPages()}
            currentPage={page}
            totalPages={getTotalPages()}
            onPageChange={setPage}
            showIcons
          />
        </div>
      )}
      <PromptDialog show={createField ? true : false} onClose={() => setCreateField('')} onSave={() => { }} />
    </div>
  )
}

export default Students
