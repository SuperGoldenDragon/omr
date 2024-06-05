import { IpcMainInvokeEvent } from 'electron'
import ExcelJS from 'exceljs'
import { Like, Repository } from 'typeorm'
import { AppDataSource } from '..'
import { Student } from '../entities/Student'
import { StudentList, groupedStudents, importFileInfoProps } from '../types/common'
import { Worker } from 'worker_threads'
import fs from 'fs'
import xlsx from 'xlsx'

class StudentController {
  private readonly student: Repository<Student>

  // constructor
  constructor() {
    // get repository
    this.student = AppDataSource.manager.getRepository(Student)
  }

  // get import header data
  importFileHeaderInfo = async (
    _event: IpcMainInvokeEvent,
    arg: importFileInfoProps
  ): Promise<any> => {
    console.log('importFileInfo', arg)

    if (arg.selectedFile && arg.selectedSheet && arg.headerLine) {
      // read the excel file
      const filePath = arg.selectedFile
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // get the selected sheet
      const sheets = workbook.getWorksheet(arg.selectedSheet)

      if (sheets) {
        // get the header line
        const headerLine = arg.headerLine

        // get the header row
        const headerRow = sheets.getRow(headerLine)

        // the headers
        const headers: any[] = []

        // remove empty cells, duplicates
        headerRow.eachCell((cell) => {
          if (cell.value) {
            // check if the header is already in the array
            const found = headers.find((header) => header.cellValue === cell.value!.toString())

            // if not found, add it
            if (!found) {
              if (typeof cell.value === 'string') {
                headers.push({
                  cellKey: [cell.address],
                  cellValue: cell.value.toString()
                })
              }
            } else {
              // update the cell address array
              found.cellKey.push(cell.address)
            }
          }
        })

        // return an array of headers
        return headers
      }

      //   console.log('sheets', sheets)
    }
  }

  // get import header data
  importFileSchoolInfo = async (
    _event: IpcMainInvokeEvent,
    arg: importFileInfoProps
  ): Promise<any> => {
    console.log('importFileSchoolInfo', arg)

    if (arg.selectedFile && arg.selectedSheet) {
      // read the excel file
      const filePath = arg.selectedFile
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // get the selected sheet
      const sheets = workbook.getWorksheet(arg.selectedSheet)

      if (sheets) {
        // get school column
        let schoolName: string | undefined
        let gradeName: string | undefined
        let sectionName: string | undefined

        if (arg.schoolColumn) {
          //   // get value from key AA12
          //   schoolName = sheets.getCell(arg.schoolColumn).value?.toString()
          // find 'اسم الطالب' in the header and save all student in the database
          const headerLine = arg.headerLine
          const headerRow = sheets.getRow(headerLine)
          let studentColumnKey: string | undefined
          let idColumnKey: string | undefined
          //   let studentData: string[] = []
          headerRow.eachCell((cell) => {
            // if (cell.value) {
            //   if (cell.value.toString().includes('اسم الطالب')) {
            //     studentColumnKey = cell.address
            //   } else if (cell.value.toString().includes('الرقم الوطني')) {
            //     idColumnKey = cell.address
            //   } else {
            //     studentData.push(cell.value.toString())
            //   }
            // }
            // find ' اسم الطال' from the header and save all student in the database
            if (cell.value) {
              if (cell.value.toString().includes('اسم الطالب')) {
                studentColumnKey = cell.address
              } else if (cell.value.toString().includes('الرقم الوطني')) {
                idColumnKey = cell.address
              }
            }
          })

          //   find 'رقم رخصة الاقامة' from the header and save all student in the database

          if (studentColumnKey) {
            schoolName = sheets.getCell(studentColumnKey).value?.toString()
          }

          if (idColumnKey) {
            gradeName = sheets.getCell(idColumnKey).value?.toString()
          }
        }

        if (arg.gradeColumn) {
          gradeName = sheets.getCell(arg.gradeColumn).value?.toString()
        }

        if (arg.sectionColumn) {
          sectionName = sheets.getCell(arg.sectionColumn).value?.toString()
        }

        return {
          schoolName,
          gradeName,
          sectionName
        }
      }
    }
  }

  // find student's name column from the header and save all student in the database
  saveStudentData = async (_event: IpcMainInvokeEvent, arg: importFileInfoProps): Promise<any> => {
    console.log('saveStudentData', arg)

    if (arg.selectedFile && arg.selectedSheet && arg.headerLine) {
      // read the excel file
      const filePath = arg.selectedFile
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // get the selected sheet
      const sheets = workbook.getWorksheet(arg.selectedSheet)

      if (sheets) {
        // get the header line
        const headerLine = arg.headerLine

        // get the header row
        const headerRow = sheets.getRow(headerLine)

        // the headers
        const headers: any[] = []

        // remove empty cells, duplicates
        headerRow.eachCell((cell) => {
          if (cell.value) {
            // check if the header is already in the array
            const found = headers.find((header) => header.cellValue === cell.value!.toString())

            // if not found, add it
            if (!found) {
              if (typeof cell.value === 'string') {
                headers.push({
                  cellKey: [cell.address],
                  cellValue: cell.value.toString()
                })
              }
            } else {
              // update the cell address array
              found.cellKey.push(cell.address)
            }
          }
        })

        // get school column
        let schoolName: string | undefined
        let gradeName: string | undefined
        let sectionName: string | undefined

        if (arg.schoolColumn) {
          // get value from key AA12
          schoolName = sheets.getCell(arg.schoolColumn).value?.toString()
        }

        if (arg.gradeColumn) {
          gradeName = sheets.getCell(arg.gradeColumn).value?.toString()
        }

        if (arg.sectionColumn) {
          sectionName = sheets.getCell(arg.sectionColumn).value?.toString()
        }

        // get student name column
        const studentColumnKeys = arg.studentColumn.cellKey

        // get all student data
        // const studentData = arg.studentData

        // get student id column
        const studentIdColumnKeys = arg.idColumn.cellKey

        // get values from the student name column
        const students: any[] = []

        // Calculate total rows to process
        const totalRows = arg.endingRow - arg.startingRow + 1
        let processedRows = 0

        try {
          await this.student.manager.transaction(async (transaction) => {
            // loop start row to end row
            for (let i = arg.startingRow; i <= arg.endingRow; i++) {
              // get student name
              let studentName = ''

              // loop through student name column
              studentColumnKeys.forEach((key) => {
                // get the cell key and number
                const [cellKey] = key.split(/(\d+)/)

                // replace cell number with starting row
                const newCellKey = cellKey + i

                // get cell value
                const cellValue = sheets.getCell(newCellKey).value?.toString()

                // add to student name if previous cell value is not same
                if (cellValue && cellValue.trim() !== studentName.trim()) {
                  studentName += cellValue + ' '
                }
              })

              // get student id
              let studentId = ''

              // loop through student id column
              studentIdColumnKeys.forEach((key) => {
                // get the cell key and number
                const [cellKey] = key.split(/(\d+)/)

                // replace cell number with starting row
                const newCellKey = cellKey + i

                // get cell value
                const cellValue = sheets.getCell(newCellKey).value?.toString()

                // add to student id if previous cell value is not same
                if (cellValue && cellValue.trim() !== studentId.trim()) {
                  studentId += cellValue + ' '
                }
              })

              // check if student name and id is not empty
              if (studentName.trim() === '' || studentId.trim() === '') {
                // Increment processed rows and send progress update
                processedRows++
                const progress = (processedRows / totalRows) * 100
                _event.sender.send('import-progress', progress)

                continue
              }

              // check if student name and id already exists
              const existingStudent = await transaction.findOne(Student, {
                where: { studentName: studentName.trim(), studentID: studentId.trim() as any }
              })

              // if student already exists, skip
              if (existingStudent) {
                // Increment processed rows and send progress update
                processedRows++
                const progress = (processedRows / totalRows) * 100
                _event.sender.send('import-progress', progress)

                continue
              }

              // save to database
              const student = new Student()
              student.studentSchoolName = schoolName!.trim()
              student.studentClass = gradeName!.trim()
              student.studentSection = sectionName!.trim()
              student.studentName = studentName!.trim()
              student.studentID = studentId!.trim() as any

              await transaction.save(student)

              // add to students
              students.push({ studentName: studentName.trim(), studentId: studentId.trim() })

              // Increment processed rows and send progress update
              processedRows++
              const progress = (processedRows / totalRows) * 100
              _event.sender.send('import-progress', progress)
            }
          })
        } catch (error) {
          console.log('Error importing students:', error)
        }

        // return success
        return {
          schoolName,
          gradeName,
          sectionName,
          students
        }
      }

      //   console.log('sheets', sheets)
    }
  }

  // import students
  importStudents = async (_event: IpcMainInvokeEvent, arg: importFileInfoProps): Promise<any> => {
    console.log('importStudents', arg)
    let cancelImport = false
    if (
      arg.selectedFile &&
      arg.selectedSheet &&
      arg.headerLine &&
      arg.schoolColumn &&
      arg.gradeColumn &&
      arg.sectionColumn &&
      arg.studentColumn &&
      arg.idColumn &&
      arg.startingRow &&
      arg.endingRow
    ) {
      // read the excel file
      const filePath = arg.selectedFile
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // get the selected sheet
      const sheets = workbook.getWorksheet(arg.selectedSheet)

      if (sheets) {
        // school column
        let schoolName: string | undefined
        let gradeName: string | undefined
        let sectionName: string | undefined

        // get school column
        if (arg.schoolColumn) {
          schoolName = sheets.getCell(arg.schoolColumn).value?.toString()
        }

        // get grade column
        if (arg.gradeColumn) {
          gradeName = sheets.getCell(arg.gradeColumn).value?.toString()
        }

        // get section column
        if (arg.sectionColumn) {
          sectionName = sheets.getCell(arg.sectionColumn).value?.toString()
        }

        // get student name column
        const studentColumnKeys = arg.studentColumn.cellKey

        // get all student data
        // const studentData = arg.studentData

        // get student id column
        const studentIdColumnKeys = arg.idColumn.cellKey

        // get values from the student name column
        const students: any[] = []

        // Calculate total rows to process
        const totalRows = arg.endingRow - arg.startingRow + 1
        let processedRows = 0

        _event.sender.ipc.on('cancel-import', () => {
          cancelImport = true
        })
        try {
          await this.student.manager.transaction(async (transaction) => {
            // loop start row to end row
            for (let i = arg.startingRow; i <= arg.endingRow; i++) {
              // Check if import is canceled
              if (cancelImport) {
                // throw an error to cancel the import
                throw new Error('Import canceled')
              }

              // // Introduce a delay to slow down the progress
              //   await new Promise((resolve) => setTimeout(resolve, 100)) // Adjust the delay time as needed (100ms in this example)

              // get student name
              let studentName = ''

              // loop through student name column
              studentColumnKeys.forEach((key) => {
                // get the cell key and number
                const [cellKey] = key.split(/(\d+)/)

                // replace cell number with starting row
                const newCellKey = cellKey + i

                // get cell value
                const cellValue = sheets.getCell(newCellKey).value?.toString()

                // add to student name if previous cell value is not same
                if (cellValue && cellValue.trim() !== studentName.trim()) {
                  studentName += cellValue + ' '
                }
              })

              // get student id
              let studentId = ''

              // loop through student id column
              studentIdColumnKeys.forEach((key) => {
                // get the cell key and number
                const [cellKey] = key.split(/(\d+)/)

                // replace cell number with starting row
                const newCellKey = cellKey + i

                // get cell value
                const cellValue = sheets.getCell(newCellKey).value?.toString()

                // add to student id if previous cell value is not same
                if (cellValue && cellValue.trim() !== studentId.trim()) {
                  studentId += cellValue + ' '
                }
              })

              // check if student name and id is not empty
              if (studentName.trim() === '' || studentId.trim() === '') {
                // Increment processed rows and send progress update
                processedRows++
                const progress = (processedRows / totalRows) * 100
                _event.sender.send('import-progress', progress)

                continue
              }

              // check if student name and id already exists
              const existingStudent = await transaction.findOne(Student, {
                where: { studentName: studentName.trim(), studentID: studentId.trim() as any }
              })

              // if student already exists, skip
              if (existingStudent) {
                // Increment processed rows and send progress update
                processedRows++
                const progress = (processedRows / totalRows) * 100
                _event.sender.send('import-progress', progress)

                continue
              }

              // save to database
              const student = new Student()
              student.studentSchoolName = schoolName!.trim()
              student.studentClass = gradeName!.trim()
              student.studentSection = sectionName!.trim()
              student.studentName = studentName!.trim()
              student.studentID = studentId!.trim() as any

              await transaction.save(student)

              // add to students
              students.push({ studentName: studentName.trim(), studentId: studentId.trim() })

              // Increment processed rows and send progress update
              processedRows++
              const progress = (processedRows / totalRows) * 100
              _event.sender.send('import-progress', progress)
            }
          })
        } catch (error) {
          console.log('Error importing students:', error)
        }

        // return success
        return {
          status: cancelImport ? 'canceled' : 'success',
          schoolName,
          gradeName,
          sectionName,
          students
        }
      }
    } else if (arg.selectedFile && arg.usingTemplate) {
      // read the excel file
      const filePath = arg.selectedFile
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // get values from the student name column
      const students: any[] = []

      const sheets = workbook.worksheets

      _event.sender.ipc.on('cancel-import', () => {
        cancelImport = true
      })

      for (const sheet of sheets) {
        if (sheet) {
          // get school column
          const schoolName = sheet.getCell('AA12').value?.toString()

          // get grade column
          const gradeName = sheet.getCell('E6').value?.toString()

          // get section column
          const sectionName = sheet.getCell('E14').value?.toString()

          // get student name column
          const studentColumnKeys = ['AC21']

          // get student id column
          const studentIdColumnKeys = ['U21', 'V21', 'W21']

          // Calculate total rows to process
          //   const totalRows = 500 - 22
          //   let processedRows = 0

          try {
            // await this.student.manager.transaction(async (transaction) => {
            // loop start row to end row
            for (let i = 22; i <= 500; i++) {
              // Check if import is canceled
              if (cancelImport) {
                // throw an error to cancel the import
                throw new Error('Import canceled')
              }

              // // Introduce a delay to slow down the progress
              //   await new Promise((resolve) => setTimeout(resolve, 100)) // Adjust the delay time as needed (100ms in this example)

              // get student name
              let studentName = ''

              // loop through student name column
              studentColumnKeys.forEach((key) => {
                // get the cell key and number
                const [cellKey] = key.split(/(\d+)/)

                // replace cell number with starting row
                const newCellKey = cellKey + i

                // get cell value
                const cellValue = sheet.getCell(newCellKey).value?.toString()

                // add to student name if previous cell value is not same
                if (cellValue && cellValue.trim() !== studentName.trim()) {
                  studentName += cellValue + ' '
                }
              })

              // get student id
              let studentId = ''

              // loop through student id column
              studentIdColumnKeys.forEach((key) => {
                // get the cell key and number
                const [cellKey] = key.split(/(\d+)/)

                // replace cell number with starting row
                const newCellKey = cellKey + i

                // get cell value
                const cellValue = sheet.getCell(newCellKey).value?.toString()

                // add to student id if previous cell value is not same
                if (cellValue && cellValue.trim() !== studentId.trim()) {
                  studentId += cellValue + ' '
                }
              })

              // check if student name and id is not empty
              if (studentName.trim() === '' || studentId.trim() === '') {
                // Increment processed rows and send progress update
                //   processedRows++
                //   const progress = (processedRows / totalRows) * 100
                //   _event.sender.send('import-progress', progress)

                continue
              }

              // // check if student name and id already exists
              // const existingStudent = await transaction.findOne(Student, {
              //   where: { studentName: studentName.trim(), studentID: studentId.trim() as any }
              // })

              // if student already exists, skip
              // if (existingStudent) {
              //   // Increment processed rows and send progress update
              //   processedRows++
              //   const progress = (processedRows / totalRows) * 100
              //   _event.sender.send('import-progress', progress)

              //   continue
              // }

              // save to database
              // const student = new Student()
              // student.studentSchoolName = schoolName!.trim()
              // student.studentClass = gradeName!.trim()
              // student.studentSection = sectionName!.trim()
              // student.studentName = studentName!.trim()
              // student.studentID = studentId!.trim() as any

              // await transaction.save(student)

              // add to students
              students.push({
                studentName: studentName.trim(),
                studentID: studentId.trim(),
                studentSchoolName: schoolName!.trim(),
                studentClass: gradeName!.trim(),
                studentSection: sectionName!.trim()
              })

              // Increment processed rows and send progress update
              // processedRows++
              // const progress = (processedRows / totalRows) * 100
              // _event.sender.send('import-progress', progress)
            }
            // })
          } catch (error) {
            console.log('Error importing students:', error)
          }
        }
      }

      // save to database
      const save = this.student.create(students)

      await this.student.save(save)

      //   // return success
      return {
        status: cancelImport ? 'canceled' : 'success',
        // schoolName,
        // gradeName,
        // sectionName,
        students
      }
    }
  }

  // get students
  getStudents = async (
    _event: IpcMainInvokeEvent,
    _arg: {
      page: number
      perPage: number
      class: string
      searchBy:
        | {
            [key: string]: string
          }
        | undefined
      orderBy:
        | {
            [key: string]: string
          }
        | undefined
    }
  ): Promise<StudentList> => {
    console.log('getStudents')
    const page = _arg.page
    const perPage = _arg.perPage
    const skip = (page - 1) * perPage

    // check if class is provided
    if (!_arg.class) {
      // return empty students
      return {
        page,
        perPage,
        students: [],
        total: 0
      }
    }

    console.log('getStudents', _arg.class, _arg.searchBy)

    // prepare search query
    let searchQuery = {}

    // check if searchBy is provided
    if (_arg.searchBy) {
      searchQuery = Object.keys(_arg.searchBy).reduce((acc, key) => {
        acc[key] = Like(`%${_arg.searchBy?.[key]}%`)
        return acc
      }, {})
    }

    // get students
    const base = this.student.findAndCount({
      where: { studentClass: _arg.class, ...searchQuery },
      skip,
      take: perPage,
      order: _arg.orderBy ?? { id: 'DESC' }
    })

    const students = await base

    // return students
    return {
      page,
      perPage,
      students: students[0],
      total: students[1]
    }
  }

  // get student groups and counts
  getStudentGroups = async (_event: IpcMainInvokeEvent): Promise<any> => {
    console.log('getStudentGroups')

    // get total student's count
    const totalStudents = await this.student.count()

    // group students by class and get count
    const allGrades = await this.student
      .createQueryBuilder('student')
      .select('student.studentClass')
      .addSelect('COUNT(student.studentClass)', 'totalStudents')
      .groupBy('student.studentClass')
      .getRawMany()

    // get schools
    const allSchools = await this.student
      .createQueryBuilder('student')
      .select('student.studentSchoolName')
      .addSelect('COUNT(student.studentSchoolName)', 'totalStudents')
      .groupBy('student.studentSchoolName')
      .getRawMany()

    // get sections
    const allSections = await this.student
      .createQueryBuilder('student')
      .select('student.studentSection')
      .addSelect('COUNT(student.studentSection)', 'totalStudents')
      .groupBy('student.studentSection')
      .getRawMany()

    // group students by allGrades
    const grades = {}

    // loop through allGrades
    for (const grade of allGrades) {
      grades[grade.student_studentClass] = {
        totalStudents: grade.totalStudents
      }
    }

    // group by class
    const schools = {}

    // loop through allSections
    for (const cls of allSchools) {
      schools[cls.student_studentSchoolName] = {
        totalStudents: cls.totalStudents
        /* classes: await this.getStudentsBySchool(_event, cls.student_studentSchoolName) */
      }
    }

    // sections
    const sections = {}

    // loop through allSections
    for (const section of allSections) {
      sections[section.student_studentSection] = {
        totalStudents: section.totalStudents
      }
    }

    // group by class
    const groupedStudents: groupedStudents = {
      totalStudents,
      grades,
      schools,
      sections
    }

    return groupedStudents
  }

  // get student by school name and list with sections
  getStudentsBySchool = async (_event: IpcMainInvokeEvent, arg: string): Promise<any> => {
    console.log('getStudentsBySchool', arg)

    // get students
    const students = await this.student.find({
      where: { studentSchoolName: arg },
      order: { studentClass: 'ASC', studentSection: 'ASC' }
    })

    let groupedStudents = {}

    groupedStudents = students.reduce((acc, student) => {
      if (!acc[student.studentClass]) {
        acc[student.studentClass] = {}
      }

      if (!acc[student.studentClass][student.studentSection]) {
        acc[student.studentClass][student.studentSection] = []
      }

      acc[student.studentClass][student.studentSection].push(student)

      return acc
    }, groupedStudents)

    return groupedStudents
  }

  // add student
  addStudent = async (_event: IpcMainInvokeEvent, arg: Student): Promise<Student> => {
    console.log('addStudent', arg)

    // save student
    const student = new Student()
    student.studentSchoolName = arg.studentSchoolName
    student.studentClass = arg.studentClass
    student.studentSection = arg.studentSection
    student.studentName = arg.studentName
    student.studentID = arg.studentID

    // save student
    await this.student.save(student)

    // return student
    return student
  }

  // update student
  updateStudent = async (_event: IpcMainInvokeEvent, arg: Student): Promise<Student> => {
    console.log('updateStudent', arg)

    // find student
    const student = await this.student.findOneByOrFail({ id: arg.id })

    // update student properties
    student.studentSchoolName = arg.studentSchoolName
    student.studentClass = arg.studentClass
    student.studentSection = arg.studentSection
    student.studentName = arg.studentName
    student.studentID = arg.studentID

    // save student and return
    return this.student.save(student)
  }

  // delete student
  deleteStudent = async (_event: IpcMainInvokeEvent, arg: number): Promise<Student> => {
    console.log('deleteStudent', arg)

    // find student
    const student = await this.student.findOneByOrFail({ id: arg })

    // delete student
    await this.student.remove(student)

    // return student
    return student
  }

  // remove all students
  removeAllStudents = async (_event: IpcMainInvokeEvent): Promise<boolean> => {
    console.log('removeAllStudents')

    // delete all students from the database
    await this.student.delete({})

    // return true
    return true
  }

  // load students from xlsx and store
  loadStudentsFromXlsx = (_event: IpcMainInvokeEvent, filename: string): any => {
    if (!filename) return 0
    let xlsxData: any = []
    const students: any = []

    if (fs?.existsSync(filename)) {
      try {
        // Read Excel file
        const workbook = xlsx.readFile(filename)
        // Assume we only have one sheet
        xlsxData = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          // Parse data from the sheet
          return { sheetName, rows: xlsx.utils.sheet_to_json(worksheet) }
        })

        // Send data to renderer process
      } catch (error) {
        // Send error message to renderer process
        // event.sender.send('excel-error', error.message);
        console.log('read-sheet-error', error)
      }
    } else {
      // Send error message to renderer process
      console.log('excel-error', 'File not found.')
    }

    xlsxData.forEach((sheet: any) => {
      const { rows } = sheet
      const nRows = rows.length

      try {
        let i = 0
        let schoolName: any = ''
        let section: any = ''
        let grade: any = ''

        for (i = 0; i < nRows; i++) {
          const values = Object.values(rows[i])
          // this is the grade
          if (values.indexOf('الصف') >= 0) {
            grade =
              values.filter((val: any) => !(val.includes('الصف') || val.includes(':')))[0] || ''
          }
          // section row and next row is schoolname
          if (values.indexOf('القسم') >= 0) {
            section =
              Object.values(rows[i + 2]).filter(
                (val: any) => !(val.includes('الفصل') || val.includes(':'))
              )[0] || ''
            // get school name
            if (i + 1 < nRows) {
              schoolName = Object.values(rows[i + 1])[0] || ''
            }
          }
          if (schoolName && section && grade) break
          if (values.indexOf('الطلاب') >= 0) break
        }
        schoolName = schoolName.trimStart().trimEnd()
        grade = grade.trimStart().trimEnd()
        section = section.trimStart().trimEnd()

        if (!schoolName || !section || !grade) return

        // if (!obj[schoolName]) obj[schoolName] = {}
        // if (!obj[schoolName][grade]) obj[schoolName][grade] = {}
        // if (!obj[schoolName][grade][section]) obj[schoolName][grade][section] = []

        let mobileNoKey = ''
        let idKey = ''
        let nameKey = ''
        do {
          i++
        } while (
          Object.values(rows[i])
            .map((val: any) => val.trim())
            .indexOf('اسم الطالب'.trim()) < 0
        )

        const keys = Object.keys(rows[i])

        idKey =
          keys[
            Object.values(rows[i])
              .map((val: any) => val.trim())
              .indexOf('رقم رخصة الاقامة'.trim())
          ]
        nameKey =
          keys[
            Object.values(rows[i])
              .map((val: any) => val.trim())
              .indexOf('اسم الطالب'.trim())
          ]
        mobileNoKey =
          keys[
            Object.values(rows[i])
              .map((val: any) => val.trim())
              .indexOf('رقم جوال الطالب'.trim())
          ]
        i++

        if (!idKey || !nameKey || !mobileNoKey) return

        for (; i < nRows; i++) {
          try {
            students.push({
              studentSchoolName: schoolName,
              studentClass: grade,
              studentSection: section,
              studentName: rows[i][nameKey].toString().trimStart().trimEnd(),
              studentID: rows[i][idKey].toString().trimStart().trimEnd()
            })
          } catch (e) {
            console.log(e)
          }
        }
      } catch (e) {
        console.log(e)
      }
    })

    return Promise.all(
      students.map((arg: any) => {
        try {
          const student = new Student()
          student.studentSchoolName = arg.studentSchoolName
          student.studentClass = arg.studentClass
          student.studentSection = arg.studentSection
          student.studentName = arg.studentName
          student.studentID = Number(arg.studentID)
          if (isNaN(student.studentID)) return
          return this.student.save(student)
        } catch (e) {
          console.log(e)
        }
        return
      })
    )
    // return students
  }

  insertStudents = (_event: IpcMainInvokeEvent, students: any): any => {
    const worker = new Worker('./src/main/workers/ImportExcelWorker.tsx', {
      workerData: students // Send data to the worker thread
    })
    // Receive messages from the worker thread
    worker.on('message', (message: any) => {
      _event.sender.send('import-progress', message)
    })
    // const nStudents = students?.length
    // let current = 0
    // return Promise.all(
    //   students.map((arg: any) => {
    //     try {
    //       const student = new Student()
    //       student.studentSchoolName = arg.studentSchoolName
    //       student.studentClass = arg.studentClass
    //       student.studentSection = arg.studentSection
    //       student.studentName = arg.studentName
    //       student.studentID = Number(arg.studentID)
    //       if (isNaN(student.studentID)) return
    //       current++
    //       _event.sender.send('import-progress', current)
    //       return this.student.save(student)
    //     } catch (e) {
    //       console.log(e)
    //     }
    //     return
    //   })
    // )
  }

  getClassesBySchool = async (_event: IpcMainInvokeEvent, schoolName: string): Promise<any> => {
    console.log('getClassesBySchool', schoolName)
    const allGrades = await this.student
      .createQueryBuilder('student')
      .select('student.studentClass')
      .where({ studentSchoolName: schoolName })
      .addSelect('COUNT(student.studentSection)', 'totalSections')
      .groupBy('student.studentClass')
      .getRawMany()

    return allGrades
  }

  getSectionssBySchoolAndClass = async (_event: IpcMainInvokeEvent, _arg: any): Promise<any> => {
    console.log('getSectionssBySchoolAndClass', _arg)
    const allSections = await this.student
      .createQueryBuilder('student')
      .select('student.studentSection')
      .where(_arg)
      .addSelect('COUNT(student.studentName)', 'totalStudents')
      .groupBy('student.studentSection')
      .getRawMany()

    return allSections
  }

  getStudentsBySection = async (_event: IpcMainInvokeEvent, _arg: any): Promise<any> => {
    console.log('getStudentsBySection', _arg)
    const students = await this.student.find({ where: _arg })
    return students
  }
}

export default new StudentController()
