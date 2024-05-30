import { Student } from '../entities/Student'

export type importFileInfoProps = {
  headerLine: number
  selectedFile: string
  selectedSheet: string
  schoolColumn: string
  gradeColumn: string
  sectionColumn: string
  startingRow: number
  endingRow: number
  studentData: string[]
  usingTemplate: boolean
  studentColumn: { cellValue: string; cellKey: string[] }
  idColumn: { cellValue: string; cellKey: string[] }
}

export type groupedStudents = {
  totalStudents: number
  schools: {
    [key: string]: {
      totalStudents: number
    }
  }
  sections: {
    [key: string]: {
      totalStudents: number
    }
  }
  grades: {
    [key: string]: {
      totalStudents: number
    }
  }
}

export type StudentList = {
  page: number
  perPage: number
  students: Student[]
  total: number
}

export type CreateCommitteeInput = {
  committeeNamePrefix: string
  noOfCommittee: number
  deletePrevious: boolean
  distributeStudents: boolean
}
