import { FM } from '@renderer/utils/i18helper'
import { useDebounce } from '@uidotdev/usehooks'
import {
  Button,
  Checkbox,
  Label,
  Modal,
  Progress,
  Select,
  Spinner,
  TextInput
} from 'flowbite-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheckDouble } from 'react-icons/fa'
import { HiOutlineExclamationCircle } from 'react-icons/hi2'

const theme = {
  base: 'flex',
  addon:
    'inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400',
  field: {
    base: 'relative w-full',
    icon: {
      base: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
      svg: 'h-5 w-5 text-gray-500 dark:text-gray-400'
    },
    rightIcon: {
      base: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
      svg: 'h-5 w-5 text-gray-500 dark:text-gray-400'
    },
    input: {
      base: 'block w-full border disabled:cursor-not-allowed disabled:opacity-50',
      sizes: {
        sm: 'p-2 sm:text-xs',
        md: 'p-2.5 text-sm',
        lg: 'p-4 sm:text-base'
      },
      colors: {
        gray: 'border-gray-300 bg-gray-50 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500',
        info: 'border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500',
        failure:
          'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:focus:border-red-500 dark:focus:ring-red-500',
        warning:
          'border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:focus:border-yellow-500 dark:focus:ring-yellow-500',
        success:
          'border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:focus:border-green-500 dark:focus:ring-green-500'
      },
      withRightIcon: {
        on: 'pr-10',
        off: ''
      },
      withIcon: {
        on: 'pl-10',
        off: ''
      },
      withAddon: {
        on: 'rounded-r-lg',
        off: 'ltr:rounded-l rtl:rounded-r'
      },
      withShadow: {
        on: 'shadow-sm dark:shadow-sm-light',
        off: ''
      }
    }
  }
}

const ImportStudents = () => {
  const ipc = window.electron.ipcRenderer
  const { t } = useTranslation()
  const [usingTemplate, _setUsingTemplate] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  const [selectedSheet, setSelectedSheet] = useState('')
  const [sheets, setSheets] = useState<string[]>([])
  const [headers, setHeaders] = useState<
    {
      cellKey: string[]
      cellValue: string
    }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [headerLine, setHeaderLine] = useState('')
  const debouncedHeaderLine = useDebounce(headerLine, 500)
  const [schoolColumn, setSchoolColumn] = useState('AA12')
  const [gradeColumn, setGradeColumn] = useState('E6')
  const [sectionColumn, setSectionColumn] = useState('E14')
  const [schoolName, setSchoolName] = useState('')
  const [gradeName, setGradeName] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [startingRow, setStartingRow] = useState<number>(+headerLine + 1)
  const [endingRow, setEndingRow] = useState<number>()
  const [studentColumn, setStudentColumn] = useState<{ cellValue: string; cellKey: string[] }>()
  const [idColumn, setIdColumn] = useState<{ cellValue: string; cellKey: string[] }>()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>()
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    // do not remove this console.log
    console.log('ImportStudents mounted', t)

    // get import file info
    ipc.send('import-students', { event: 'mounted' })

    // listen for selected file
    ipc.on('selected-file', function (_event, path) {
      console.log('Full path: ', path)
      setSelectedFile(path)
      setIsDialogOpen(false)
      setLoading(true)
    })

    ipc.on('sheets', function (_event, sheets) {
      console.log('Sheets: ', sheets)
      setSheets(sheets)
      setSelectedSheet(sheets[0])
      setLoading(false)
    })

    // listen for selection canceled
    ipc.on('selection-canceled', function () {
      setIsDialogOpen(false)
    })

    ipc.on('import-progress', function (_event, progress) {
      console.log('import progress', progress)
      setProgress(progress === 100 ? 0 : progress)
    })

    return () => {
      console.log('ImportStudents unmounted')
    }
  }, [])

  const openFileDialog = () => {
    setIsDialogOpen(true)
    ipc.send('open-file-dialog-for-file')
  }

  const getImportFileHeaderInfo = () => {
    setLoading(true)
    console.log('searching for', debouncedHeaderLine)
    ipc
      .invoke('importFileHeaderInfo', {
        headerLine: debouncedHeaderLine,
        selectedFile,
        selectedSheet,
        schoolColumn,
        gradeColumn,
        sectionColumn
      })
      .then((res) => {
        console.log('search result', res)
        setHeaders(res ?? [])
        setLoading(false)
      })
      .catch((err) => {
        console.log('search error', err)
        setLoading(false)
      })
  }

  const getImportFileSchoolInfo = () => {
    setLoading(true)
    ipc
      .invoke('importFileSchoolInfo', {
        selectedFile,
        selectedSheet,
        schoolColumn,
        gradeColumn,
        sectionColumn
      })
      .then((res) => {
        console.log('importFileSchoolInfo', res)
        setSchoolName(res.schoolName)
        setGradeName(res.gradeName)
        setSectionName(res.sectionName)

        setLoading(false)
      })
      .catch((err) => {
        console.log('importFileSchoolInfo', err)
        setLoading(false)
      })
  }
  const importStudent = () => {
    setLoading(true)
    ipc
      .invoke('importStudents', {
        selectedFile,
        selectedSheet,
        headerLine: debouncedHeaderLine,
        schoolColumn,
        gradeColumn,
        sectionColumn,
        studentColumn,
        idColumn,
        startingRow,
        endingRow,
        usingTemplate
      })
      .then((res) => {
        console.log('importStudent', res)
        if (res.status === 'success') {
          ipc.send('import-students', { event: 'imported' })
        }
        setStatus(res.status)
        setStudents(res.students)
        setLoading(false)
        setProgress(0)
      })
      .catch((err) => {
        console.log('importFileSchoolInfo', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    const searchHN = async () => {
      if (debouncedHeaderLine) {
        getImportFileHeaderInfo()
      }
    }

    searchHN()
  }, [debouncedHeaderLine])

  useEffect(() => {
    getImportFileHeaderInfo()
  }, [selectedSheet])

  useEffect(() => {
    getImportFileSchoolInfo()
  }, [schoolColumn, gradeColumn, sectionColumn, selectedFile, selectedSheet])

  const handleChange = (e) => {
    setHeaderLine(e.target.value)
  }

  const renderHeader = () => {
    return headers.map((header, index) => (
      <option key={index} value={header.cellValue}>
        {header.cellValue}
      </option>
    ))
  }

  const isImportDisabled = () => {
    let re = true
    if (usingTemplate) {
      if (selectedFile !== '') {
        re = false
      }
    } else {
      if (
        selectedFile !== '' &&
        selectedSheet !== '' &&
        headerLine !== '' &&
        startingRow &&
        startingRow >= +headerLine + 1 &&
        endingRow &&
        studentColumn &&
        idColumn &&
        schoolColumn &&
        gradeColumn &&
        sectionColumn
      ) {
        re = false
      }
    }
    return re
  }

  return (
    <div className="p-4">
      <Modal
        show={status !== undefined}
        size="sm"
        onClose={() => {
          setStatus(undefined)
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            {status === 'success' ? (
              <>
                <FaCheckDouble className="mx-auto mb-4 h-14 w-14 text-green-500 dark:text-green-400" />
                <p>
                  {students.length} {FM('records-found')}
                </p>
                <h3 className="mb-5 text-lg font-normal text-green-500 dark:text-green-400">
                  {FM('imported-students-successfully')}
                </h3>
              </>
            ) : (
              <>
                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  {FM('import-canceled')}
                </h3>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
      <p className="text-xl font-bold mb-1">{FM('import-students')}</p>
      <p className="text-sm text-gray-400 mb-4">{FM('import-from-excel-file')}</p>
      <div
        className={`flex flex-row ${(isDialogOpen || loading) && 'pointer-events-none opacity-50'}`}
        onClick={openFileDialog}
      >
        <div className="flex-1">
          <TextInput
            value={selectedFile}
            theme={theme}
            id="username3"
            className="pointer-events-none"
            placeholder={FM('select-a-excel-file-to-import-students')}
            required
          />
        </div>
        <Button className="ltr:rounded-l-none rtl:rounded-r-none">{FM('browse')}</Button>
      </div>
      <div
        className={`flex items-center gap-2 mt-4 mb-4 ${loading && 'pointer-events-none opacity-50'}`}
      >
        <Checkbox
          id="accept"
          checked={usingTemplate}
          onChange={(e) => {
            _setUsingTemplate(e.target.checked)
          }}
        />
        <Label htmlFor="accept" className="flex">
          {FM('im-using-template')}
        </Label>
      </div>
      <div
        className={`h-screen-import-info relative ring-1 mt-4 overflow-auto ${(usingTemplate || loading) && ' opacity-50 pointer-events-none overflow-hidden'} dark:ring-gray-500 ring-gray-300  rounded-md custom-scrollbar  p-3`}
      >
        {loading && (
          <div className="absolute bg-opacity-40 bg-black left-0 h-full z-50 right-0 bottom-0 top-0 flex items-center justify-center">
            <Spinner className="" size="xl" />
          </div>
        )}
        <p className="text-sm dark:text-gray-400 mb-4 ">
          {FM('importing-students-from-excel-file-is-easy-just-follow-the-steps-below')}
        </p>
        <p className="text-base dark:text-gray-300 mb-1  flex items-center">
          {FM('1-select-the-sheet-name')}:
          <Select
            id="countries"
            sizing={'sm'}
            className="ml-4 rtl:mr-4"
            onChange={(e) => {
              setSelectedSheet(e.target.value)
            }}
          >
            <option disabled>{FM('select-a-sheet-name')}</option>
            {sheets.map((sheet, index) => (
              <option key={index}>{sheet}</option>
            ))}
          </Select>
        </p>
        <p className="text-base dark:text-gray-300 mb-1 flex items-center">
          {FM('2-enter-header-line-number')}:
          <TextInput
            type="number"
            className="ml-4 w-16 rtl:mr-4"
            sizing={'sm'}
            onChange={handleChange}
          />
        </p>
        <p className="text-base dark:text-gray-300 mb-1  flex items-center">
          {FM('3-enter-school-column')}:
          <TextInput
            type="text"
            className="ml-4 w-16 rtl:mr-4 uppercase"
            sizing={'sm'}
            value={schoolColumn}
            onChange={(e) => {
              setSchoolColumn(e.target.value.toUpperCase())
            }}
          />{' '}
          <span className="text-sm ml-4 dark:text-gray-300">{schoolName}</span>
        </p>
        <p className="text-base dark:text-gray-300 mb-1  flex items-center">
          {FM('4-enter-grade-column')}:
          <TextInput
            type="text"
            className="ml-4 w-16 rtl:mr-4 uppercase"
            sizing={'sm'}
            value={gradeColumn}
            onChange={(e) => {
              setGradeColumn(e.target.value.toUpperCase())
            }}
          />
          <span className="text-sm ml-4 rtl:mr-4 dark:text-gray-300">{gradeName}</span>
        </p>
        <p className="text-base dark:text-gray-300 mb-1  flex items-center">
          {FM('5-enter-section-column')}:
          <TextInput
            type="text"
            className="ml-4 w-16 rtl:mr-4 uppercase"
            sizing={'sm'}
            value={sectionColumn}
            onChange={(e) => {
              setSectionColumn(e.target.value.toUpperCase())
            }}
          />
          <span className="text-sm ml-4 rtl:mr-4 dark:text-gray-300">{sectionName}</span>
        </p>
        <p className="text-base dark:text-gray-300 mb-1  flex items-center">
          {FM('6-select-the-student-name-column')}:
          <Select
            id="countries"
            sizing={'sm'}
            className="ml-4 min-w-48 rtl:mr-4"
            value={studentColumn?.cellValue}
            onChange={(e) => {
              const studentColumn = headers.find((header) => header.cellValue === e.target.value)
              setStudentColumn(studentColumn)
            }}
          >
            {renderHeader()}
          </Select>
        </p>
        <p className="text-base dark:text-gray-300 mb-1  flex items-center">
          {FM('7-select-the-student-id-column')}:
          <Select
            id="countries"
            sizing={'sm'}
            className="ml-4 min-w-48 rtl:mr-4"
            value={idColumn?.cellValue}
            onChange={(e) => {
              const studentColumn = headers.find((header) => header.cellValue === e.target.value)
              setIdColumn(studentColumn)
            }}
          >
            {renderHeader()}
          </Select>
        </p>

        <p className="text-base dark:text-gray-300 mb-1 flex items-center">
          {FM('8-enter-the-starting-row-number-and-ending-row-number')}:
          <TextInput
            type="number"
            min={+headerLine + 1}
            sizing={'sm'}
            value={startingRow}
            onChange={(e) => {
              setStartingRow(+e.target.value)
            }}
            className="ml-4 w-16 mr-4 rtl:mr-4"
          />
          {' - '}
          <TextInput
            type="number"
            sizing={'sm'}
            value={endingRow}
            onChange={(e) => {
              setEndingRow(+e.target.value)
            }}
            className="ml-4 w-16 rtl:mr-4"
          />
        </p>
      </div>
      <div className="flex flex-row gap-2 mt-2 justify-end items-center">
        <div className="flex-1">
          <Progress
            className={`${progress === 0 ? 'hidden' : ''}`}
            size={'lg'}
            labelProgress
            progress={Math.round(progress)}
          />
        </div>
        <div>
          <Button
            disabled={isImportDisabled()}
            onClick={() => {
              if (progress > 0) {
                ipc.send('cancel-import')
              } else {
                importStudent()
              }
            }}
            className="rounded-md"
          >
            {progress > 0 ? FM('cancel') : FM('import')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImportStudents
