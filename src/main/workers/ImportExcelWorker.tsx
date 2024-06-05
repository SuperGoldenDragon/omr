const { workerData, parentPort } = require('worker_threads')
// const { Repository } = require('typeorm')
const { AppDataSource } = require('../index.ts')
const { Student } = require('../entities/Student')

const StudentRepistory = AppDataSource.manager.getRepository(Student)
const students = workerData

StudentRepistory.manager.transaction(async (transaction) => {
  if (!students) return
  const nStudents = students.length
  if (!nStudents) return
  let current = 0
  for await (const row of students) {
    const student = new Student()
    student.studentSchoolName = row.studentSchoolName
    student.studentClass = row.studentClass
    student.studentSection = row.studentSection
    student.studentName = row.studentName
    student.studentID = Number(row.studentID)
    if (isNaN(student.studentID)) return
    current++
    parentPort?.postMessage(current)
    await transaction.save(student)
  }
})
