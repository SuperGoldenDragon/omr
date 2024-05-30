import { createContext, useContext, useEffect, useState } from 'react'
import { StudentList, groupedStudents } from 'src/main/types/common'

// create a context for students
export const StudentsContext = createContext<{
  students: StudentList | undefined
  studentGroups: groupedStudents | undefined
  page: number
  perPage: number
  className?: string
  getStudentList: () => void
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  getStudentGroups: () => void
  //   getStudentsBySchool?: (school: string) => void
  setClassName?: (className: string) => void
  order?: { [key: string]: 'ASC' | 'DESC' }
  setOrderBy?: (orderBy?: string, type?: 'ASC' | 'DESC') => void
  reloadData: () => void
  setSearchBy?: (searchBy: { [key: string]: string | number }) => void
}>({
  students: undefined,
  page: 1,
  perPage: 50,
  className: undefined,
  getStudentList: () => {},
  setPage: () => {},
  setPerPage: () => {},
  studentGroups: undefined,
  getStudentGroups: () => {},
  //   getStudentsBySchool: () => {},
  setClassName: () => {},
  order: undefined,
  setOrderBy: () => {},
  reloadData: () => {},
  setSearchBy: () => {}
})

// create a custom hook to consume the students context
export const useStudents = () => useContext(StudentsContext)

// students provider component
export const StudentsProvider = ({ children }: { children: JSX.Element }) => {
  const ipc = window.electron.ipcRenderer
  const [students, setStudents] = useState<StudentList>()
  const [studentGroups, setStudentGroups] = useState<groupedStudents>()
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(50)
  const [className, setClassName] = useState<string>()
  const [searchBy, setSearchBy] = useState<{
    [key: string]: string | number
  }>()
  const [order, orderBy] = useState<{
    [key: string]: 'ASC' | 'DESC'
  }>()

  // function to update students
  const getStudentList = () => {
    ipc
      .invoke('getStudents', { page, perPage, class: className, orderBy: order, searchBy })
      .then((data: StudentList) => {
        setStudents(data)
      })
  }

  // get student groups
  const getStudentGroups = () => {
    ipc.invoke('getStudentGroups').then((data: groupedStudents) => {
      setStudentGroups(data)
      setClassName(Object.keys(data.grades)[0])
    })
  }

  // fetch students data on mount
  useEffect(() => {
    getStudentList()
  }, [page, perPage, className, order, searchBy])

  useEffect(() => {
    ipc.on('import-students', (_event, { event }) => {
      if (event === 'imported') {
        getStudentGroups()
        setPage(1)
      }
    })

    getStudentGroups()
  }, [])

  const setOrderBy = (order?: string, type?: 'ASC' | 'DESC') => {
    if (order) {
      orderBy({ [order]: type || 'ASC' })
    } else {
      orderBy(undefined)
    }
  }

  const reloadData = () => {
    setPage(1)
    setOrderBy(undefined)
    getStudentGroups()
    getStudentList()
  }

  return (
    <StudentsContext.Provider
      value={{
        students,
        page,
        perPage,
        className,
        getStudentGroups,
        studentGroups,
        getStudentList,

        setClassName,
        setPage,
        setPerPage,
        order,
        setOrderBy,
        reloadData,
        setSearchBy
      }}
    >
      {children}
    </StudentsContext.Provider>
  )
}
