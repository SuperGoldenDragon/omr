import { ipcMain } from 'electron'
import SettingController from './controller/SettingController'
import StudentController from './controller/StudentController'
import CommitteeController from './controller/CommitteeController'

export const handler = [
  // setting handlers
  ipcMain.handle('getSetting', SettingController.getSetting),
  ipcMain.handle('updateSetting', SettingController.updateSetting),

  // student
  ipcMain.handle('importFileHeaderInfo', StudentController.importFileHeaderInfo),
  ipcMain.handle('importFileSchoolInfo', StudentController.importFileSchoolInfo),
  ipcMain.handle('importStudents', StudentController.importStudents),
  ipcMain.handle('getStudents', StudentController.getStudents),
  ipcMain.handle('getStudentGroups', StudentController.getStudentGroups),
  ipcMain.handle('getStudentsBySchool', StudentController.getStudentsBySchool),
  ipcMain.handle('addStudent', StudentController.addStudent),
  ipcMain.handle('updateStudent', StudentController.updateStudent),
  ipcMain.handle('deleteStudent', StudentController.deleteStudent),
  ipcMain.handle('removeAllStudents', StudentController.removeAllStudents),
  ipcMain.handle('loadStudentsFromXlsx', StudentController.loadStudentsFromXlsx),

  // committee
  ipcMain.handle('getCommittees', CommitteeController.getCommittees),
  ipcMain.handle('addCommittee', CommitteeController.createCommittee),
  ipcMain.handle('deleteCommittee', CommitteeController.deleteCommittee),
  ipcMain.handle('removeAllCommittees', CommitteeController.removeAllCommittees)
]
