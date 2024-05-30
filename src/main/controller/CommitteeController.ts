import { Repository } from 'typeorm'
import { Committee } from '../entities/Commitee'
import { AppDataSource } from '..'
import { IpcMainInvokeEvent } from 'electron'
import { CreateCommitteeInput } from '../types/common'
import { Student } from '../entities/Student'

class CommitteeController {
  private readonly committee: Repository<Committee>
  private readonly student: Repository<Student>

  // constructor
  constructor() {
    // get repository
    this.committee = AppDataSource.manager.getRepository(Committee)
    this.student = AppDataSource.manager.getRepository(Student)
  }

  // create committee
  async createCommittee(_event: IpcMainInvokeEvent, arg: CreateCommitteeInput) {
    if (arg.noOfCommittee > 0) {
      // group students by class and get count
      const allGrades = await this.student
        .createQueryBuilder('student')
        .select('student.studentClass')
        .addSelect('COUNT(student.studentClass)', 'totalStudents')
        .groupBy('student.studentClass')
        .getRawMany()

      // group students by allGrades
      const grades = {}

      // loop through allGrades

      for (const grade of allGrades) {
        // get students by grade
        const students = await this.student.find({
          where: { studentClass: grade.student_studentClass }
        })

        // group students by class and get count
        grades[grade.student_studentClass] = {
          totalStudents: grade.totalStudents,
          students
        }
      }

      for (let i = 0; i < arg.noOfCommittee; i++) {
        // create committee
        const committee = new Committee()
        committee.committeeName = `${arg.committeeNamePrefix} ${i + 1}`
        await this.committee.save(committee)
      }
    }

    return await this.committee.find()
  }

  // add committee
  async addCommittee(_event: IpcMainInvokeEvent, arg: string) {
    // create committee
    const committee = new Committee()
    committee.committeeName = arg
    committee.distributeEqualStudent = arg === 'true'

    // if distributeEqualStudent is true then distribute students equally to all committees
    if (committee.distributeEqualStudent) {
      // group students by class and get count
      const allGrades = await this.student
        .createQueryBuilder('student')
        .select('student.studentClass')
        .addSelect('COUNT(student.studentClass)', 'totalStudents')
        .groupBy('student.studentClass')
        .getRawMany()

      // group students by allGrades
      const grades = {}

      // loop through allGrades
      for (const grade of allGrades) {
        // get students by grade
        const students = await this.student.find({
          where: { studentClass: grade.student_studentClass }
        })

        // group students by class and get count
        grades[grade.student_studentClass] = {
          totalStudents: grade.totalStudents,
          students
        }
      }

      // get all committees
      const committees = await this.committee.find()

      // get all students
      const students = await this.student.find()

      // loop through all committees
      for (const committee of committees) {
        // get students by committee
        const studentsByCommittee = await this.student.find({
          where: { committee: committee }
        })

        // get students not in committee
        const studentsNotInCommittee = students.filter(
          (student) => !studentsByCommittee.includes(student)
        )

        // loop through students not in committee
        for (const student of studentsNotInCommittee) {
          // assign student to committee
          student.committee = committee
          await this.student.save(student)
        }
      }
    }

    committee.deleteAllCommittee = arg === 'true'

    // if deleteAllCommittee is true then delete all committees
    if (committee.deleteAllCommittee) {
      // delete all committees
      await this.committee.delete({})
    }

    // save committee
    await this.committee.save(committee)

    // return all committees
    return await this.committee.find()
  }

  // get all committees
  async getCommittees() {
    return await this.committee.find()
  }

  // assign students to committee
  //   async assignStudentsToCommittee() {
  //     // group students by class and get count
  //     const allGrades = await this.student
  //       .createQueryBuilder('student')
  //       .select('student.studentClass')
  //       .addSelect('COUNT(student.studentClass)', 'totalStudents')
  //       .groupBy('student.studentClass')
  //       .getRawMany()

  //     // group students by allGrades
  //     const grades = {}

  //     // loop through allGrades
  //     for (const grade of allGrades) {
  //       // get students by grade
  //       const students = await this.student.find({
  //         where: { studentClass: grade.student_studentClass }
  //       })

  //       // group students by class and get count
  //       grades[grade.student_studentClass] = {
  //         totalStudents: grade.totalStudents,
  //         students
  //       }
  //     }

  //     // get all committees
  //     const committees = await this.committee.find()

  //     // get all students
  //     const students = await this.student.find()

  //     // loop through all committees
  //     for (const committee of committees) {
  //       // get students by committee
  //       const studentsByCommittee = await this.student.find({
  //         where: { committee: committee }
  //       })

  //       // get students not in committee
  //       const studentsNotInCommittee = students.filter(
  //         (student) => !studentsByCommittee.includes(student)
  //       )

  //       // loop through students not in committee
  //       for (const student of studentsNotInCommittee) {
  //         // assign student to committee
  //         student.committee = committee
  //         await this.student.save(student)
  //       }
  //     }

  //     return await this.committee.find()
  //   }

  deleteCommittee = async (_event: IpcMainInvokeEvent, arg: number): Promise<Committee> => {
    console.log('deleteStudent', arg)

    // find committee
    const committee = await this.committee.findOneByOrFail({ id: arg })

    // delete committee
    await this.committee.remove(committee)

    // return committee
    return committee
  }

  // remove all committees
  removeAllCommittees = async (_event: IpcMainInvokeEvent): Promise<boolean> => {
    console.log('removeAllCommittees')

    // delete all committees from the database
    await this.committee.delete({})

    // return true
    return true
  }

  // assign Students to Committee
}

export default new CommitteeController()
