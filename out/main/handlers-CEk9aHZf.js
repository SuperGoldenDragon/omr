"use strict";
const electron = require("electron");
const index = require("./index.js");
const ExcelJS = require("exceljs");
const typeorm = require("typeorm");
const worker_threads = require("worker_threads");
const fs = require("fs");
const xlsx = require("xlsx");
class SettingController {
  setting;
  // constructor
  constructor() {
    this.setting = index.AppDataSource.manager.getRepository(index.Setting);
  }
  // get setting
  getSetting = async (_event, _arg) => {
    return this.setting.findOne({ where: { id: 1 } });
  };
  // update setting
  updateSetting = async (_event, arg) => {
    const setting = await this.setting.findOneOrFail({ where: { id: 1 } });
    setting.mode = arg.mode;
    setting.appLanguage = arg.appLanguage;
    return this.setting.save(setting);
  };
}
const SettingController$1 = new SettingController();
class StudentController {
  student;
  // constructor
  constructor() {
    this.student = index.AppDataSource.manager.getRepository(index.Student);
  }
  // get import header data
  importFileHeaderInfo = async (_event, arg) => {
    console.log("importFileInfo", arg);
    if (arg.selectedFile && arg.selectedSheet && arg.headerLine) {
      const filePath = arg.selectedFile;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const sheets = workbook.getWorksheet(arg.selectedSheet);
      if (sheets) {
        const headerLine = arg.headerLine;
        const headerRow = sheets.getRow(headerLine);
        const headers = [];
        headerRow.eachCell((cell) => {
          if (cell.value) {
            const found = headers.find((header) => header.cellValue === cell.value.toString());
            if (!found) {
              if (typeof cell.value === "string") {
                headers.push({
                  cellKey: [cell.address],
                  cellValue: cell.value.toString()
                });
              }
            } else {
              found.cellKey.push(cell.address);
            }
          }
        });
        return headers;
      }
    }
  };
  // get import header data
  importFileSchoolInfo = async (_event, arg) => {
    console.log("importFileSchoolInfo", arg);
    if (arg.selectedFile && arg.selectedSheet) {
      const filePath = arg.selectedFile;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const sheets = workbook.getWorksheet(arg.selectedSheet);
      if (sheets) {
        let schoolName;
        let gradeName;
        let sectionName;
        if (arg.schoolColumn) {
          const headerLine = arg.headerLine;
          const headerRow = sheets.getRow(headerLine);
          let studentColumnKey;
          let idColumnKey;
          headerRow.eachCell((cell) => {
            if (cell.value) {
              if (cell.value.toString().includes("اسم الطالب")) {
                studentColumnKey = cell.address;
              } else if (cell.value.toString().includes("الرقم الوطني")) {
                idColumnKey = cell.address;
              }
            }
          });
          if (studentColumnKey) {
            schoolName = sheets.getCell(studentColumnKey).value?.toString();
          }
          if (idColumnKey) {
            gradeName = sheets.getCell(idColumnKey).value?.toString();
          }
        }
        if (arg.gradeColumn) {
          gradeName = sheets.getCell(arg.gradeColumn).value?.toString();
        }
        if (arg.sectionColumn) {
          sectionName = sheets.getCell(arg.sectionColumn).value?.toString();
        }
        return {
          schoolName,
          gradeName,
          sectionName
        };
      }
    }
  };
  // find student's name column from the header and save all student in the database
  saveStudentData = async (_event, arg) => {
    console.log("saveStudentData", arg);
    if (arg.selectedFile && arg.selectedSheet && arg.headerLine) {
      const filePath = arg.selectedFile;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const sheets = workbook.getWorksheet(arg.selectedSheet);
      if (sheets) {
        const headerLine = arg.headerLine;
        const headerRow = sheets.getRow(headerLine);
        const headers = [];
        headerRow.eachCell((cell) => {
          if (cell.value) {
            const found = headers.find((header) => header.cellValue === cell.value.toString());
            if (!found) {
              if (typeof cell.value === "string") {
                headers.push({
                  cellKey: [cell.address],
                  cellValue: cell.value.toString()
                });
              }
            } else {
              found.cellKey.push(cell.address);
            }
          }
        });
        let schoolName;
        let gradeName;
        let sectionName;
        if (arg.schoolColumn) {
          schoolName = sheets.getCell(arg.schoolColumn).value?.toString();
        }
        if (arg.gradeColumn) {
          gradeName = sheets.getCell(arg.gradeColumn).value?.toString();
        }
        if (arg.sectionColumn) {
          sectionName = sheets.getCell(arg.sectionColumn).value?.toString();
        }
        const studentColumnKeys = arg.studentColumn.cellKey;
        const studentIdColumnKeys = arg.idColumn.cellKey;
        const students = [];
        const totalRows = arg.endingRow - arg.startingRow + 1;
        let processedRows = 0;
        try {
          await this.student.manager.transaction(async (transaction) => {
            for (let i = arg.startingRow; i <= arg.endingRow; i++) {
              let studentName = "";
              studentColumnKeys.forEach((key) => {
                const [cellKey] = key.split(/(\d+)/);
                const newCellKey = cellKey + i;
                const cellValue = sheets.getCell(newCellKey).value?.toString();
                if (cellValue && cellValue.trim() !== studentName.trim()) {
                  studentName += cellValue + " ";
                }
              });
              let studentId = "";
              studentIdColumnKeys.forEach((key) => {
                const [cellKey] = key.split(/(\d+)/);
                const newCellKey = cellKey + i;
                const cellValue = sheets.getCell(newCellKey).value?.toString();
                if (cellValue && cellValue.trim() !== studentId.trim()) {
                  studentId += cellValue + " ";
                }
              });
              if (studentName.trim() === "" || studentId.trim() === "") {
                processedRows++;
                const progress2 = processedRows / totalRows * 100;
                _event.sender.send("import-progress", progress2);
                continue;
              }
              const existingStudent = await transaction.findOne(index.Student, {
                where: { studentName: studentName.trim(), studentID: studentId.trim() }
              });
              if (existingStudent) {
                processedRows++;
                const progress2 = processedRows / totalRows * 100;
                _event.sender.send("import-progress", progress2);
                continue;
              }
              const student = new index.Student();
              student.studentSchoolName = schoolName.trim();
              student.studentClass = gradeName.trim();
              student.studentSection = sectionName.trim();
              student.studentName = studentName.trim();
              student.studentID = studentId.trim();
              await transaction.save(student);
              students.push({ studentName: studentName.trim(), studentId: studentId.trim() });
              processedRows++;
              const progress = processedRows / totalRows * 100;
              _event.sender.send("import-progress", progress);
            }
          });
        } catch (error) {
          console.log("Error importing students:", error);
        }
        return {
          schoolName,
          gradeName,
          sectionName,
          students
        };
      }
    }
  };
  // import students
  importStudents = async (_event, arg) => {
    console.log("importStudents", arg);
    let cancelImport = false;
    if (arg.selectedFile && arg.selectedSheet && arg.headerLine && arg.schoolColumn && arg.gradeColumn && arg.sectionColumn && arg.studentColumn && arg.idColumn && arg.startingRow && arg.endingRow) {
      const filePath = arg.selectedFile;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const sheets = workbook.getWorksheet(arg.selectedSheet);
      if (sheets) {
        let schoolName;
        let gradeName;
        let sectionName;
        if (arg.schoolColumn) {
          schoolName = sheets.getCell(arg.schoolColumn).value?.toString();
        }
        if (arg.gradeColumn) {
          gradeName = sheets.getCell(arg.gradeColumn).value?.toString();
        }
        if (arg.sectionColumn) {
          sectionName = sheets.getCell(arg.sectionColumn).value?.toString();
        }
        const studentColumnKeys = arg.studentColumn.cellKey;
        const studentIdColumnKeys = arg.idColumn.cellKey;
        const students = [];
        const totalRows = arg.endingRow - arg.startingRow + 1;
        let processedRows = 0;
        _event.sender.ipc.on("cancel-import", () => {
          cancelImport = true;
        });
        try {
          await this.student.manager.transaction(async (transaction) => {
            for (let i = arg.startingRow; i <= arg.endingRow; i++) {
              if (cancelImport) {
                throw new Error("Import canceled");
              }
              let studentName = "";
              studentColumnKeys.forEach((key) => {
                const [cellKey] = key.split(/(\d+)/);
                const newCellKey = cellKey + i;
                const cellValue = sheets.getCell(newCellKey).value?.toString();
                if (cellValue && cellValue.trim() !== studentName.trim()) {
                  studentName += cellValue + " ";
                }
              });
              let studentId = "";
              studentIdColumnKeys.forEach((key) => {
                const [cellKey] = key.split(/(\d+)/);
                const newCellKey = cellKey + i;
                const cellValue = sheets.getCell(newCellKey).value?.toString();
                if (cellValue && cellValue.trim() !== studentId.trim()) {
                  studentId += cellValue + " ";
                }
              });
              if (studentName.trim() === "" || studentId.trim() === "") {
                processedRows++;
                const progress2 = processedRows / totalRows * 100;
                _event.sender.send("import-progress", progress2);
                continue;
              }
              const existingStudent = await transaction.findOne(index.Student, {
                where: { studentName: studentName.trim(), studentID: studentId.trim() }
              });
              if (existingStudent) {
                processedRows++;
                const progress2 = processedRows / totalRows * 100;
                _event.sender.send("import-progress", progress2);
                continue;
              }
              const student = new index.Student();
              student.studentSchoolName = schoolName.trim();
              student.studentClass = gradeName.trim();
              student.studentSection = sectionName.trim();
              student.studentName = studentName.trim();
              student.studentID = studentId.trim();
              await transaction.save(student);
              students.push({ studentName: studentName.trim(), studentId: studentId.trim() });
              processedRows++;
              const progress = processedRows / totalRows * 100;
              _event.sender.send("import-progress", progress);
            }
          });
        } catch (error) {
          console.log("Error importing students:", error);
        }
        return {
          status: cancelImport ? "canceled" : "success",
          schoolName,
          gradeName,
          sectionName,
          students
        };
      }
    } else if (arg.selectedFile && arg.usingTemplate) {
      const filePath = arg.selectedFile;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const students = [];
      const sheets = workbook.worksheets;
      _event.sender.ipc.on("cancel-import", () => {
        cancelImport = true;
      });
      for (const sheet of sheets) {
        if (sheet) {
          const schoolName = sheet.getCell("AA12").value?.toString();
          const gradeName = sheet.getCell("E6").value?.toString();
          const sectionName = sheet.getCell("E14").value?.toString();
          const studentColumnKeys = ["AC21"];
          const studentIdColumnKeys = ["U21", "V21", "W21"];
          try {
            for (let i = 22; i <= 500; i++) {
              if (cancelImport) {
                throw new Error("Import canceled");
              }
              let studentName = "";
              studentColumnKeys.forEach((key) => {
                const [cellKey] = key.split(/(\d+)/);
                const newCellKey = cellKey + i;
                const cellValue = sheet.getCell(newCellKey).value?.toString();
                if (cellValue && cellValue.trim() !== studentName.trim()) {
                  studentName += cellValue + " ";
                }
              });
              let studentId = "";
              studentIdColumnKeys.forEach((key) => {
                const [cellKey] = key.split(/(\d+)/);
                const newCellKey = cellKey + i;
                const cellValue = sheet.getCell(newCellKey).value?.toString();
                if (cellValue && cellValue.trim() !== studentId.trim()) {
                  studentId += cellValue + " ";
                }
              });
              if (studentName.trim() === "" || studentId.trim() === "") {
                continue;
              }
              students.push({
                studentName: studentName.trim(),
                studentID: studentId.trim(),
                studentSchoolName: schoolName.trim(),
                studentClass: gradeName.trim(),
                studentSection: sectionName.trim()
              });
            }
          } catch (error) {
            console.log("Error importing students:", error);
          }
        }
      }
      const save = this.student.create(students);
      await this.student.save(save);
      return {
        status: cancelImport ? "canceled" : "success",
        // schoolName,
        // gradeName,
        // sectionName,
        students
      };
    }
  };
  // get students
  getStudents = async (_event, _arg) => {
    console.log("getStudents");
    const page = _arg.page;
    const perPage = _arg.perPage;
    const skip = (page - 1) * perPage;
    if (!_arg.class) {
      return {
        page,
        perPage,
        students: [],
        total: 0
      };
    }
    console.log("getStudents", _arg.class, _arg.searchBy);
    let searchQuery = {};
    if (_arg.searchBy) {
      searchQuery = Object.keys(_arg.searchBy).reduce((acc, key) => {
        acc[key] = typeorm.Like(`%${_arg.searchBy?.[key]}%`);
        return acc;
      }, {});
    }
    const base = this.student.findAndCount({
      where: { studentClass: _arg.class, ...searchQuery },
      skip,
      take: perPage,
      order: _arg.orderBy ?? { id: "DESC" }
    });
    const students = await base;
    return {
      page,
      perPage,
      students: students[0],
      total: students[1]
    };
  };
  // get student groups and counts
  getStudentGroups = async (_event) => {
    console.log("getStudentGroups");
    const totalStudents = await this.student.count();
    const allGrades = await this.student.createQueryBuilder("student").select("student.studentClass").addSelect("COUNT(student.studentClass)", "totalStudents").groupBy("student.studentClass").getRawMany();
    const allSchools = await this.student.createQueryBuilder("student").select("student.studentSchoolName").addSelect("COUNT(student.studentSchoolName)", "totalStudents").groupBy("student.studentSchoolName").getRawMany();
    const allSections = await this.student.createQueryBuilder("student").select("student.studentSection").addSelect("COUNT(student.studentSection)", "totalStudents").groupBy("student.studentSection").getRawMany();
    const grades = {};
    for (const grade of allGrades) {
      grades[grade.student_studentClass] = {
        totalStudents: grade.totalStudents
      };
    }
    const schools = {};
    for (const cls of allSchools) {
      schools[cls.student_studentSchoolName] = {
        totalStudents: cls.totalStudents
        /* classes: await this.getStudentsBySchool(_event, cls.student_studentSchoolName) */
      };
    }
    const sections = {};
    for (const section of allSections) {
      sections[section.student_studentSection] = {
        totalStudents: section.totalStudents
      };
    }
    const groupedStudents2 = {
      totalStudents,
      grades,
      schools,
      sections
    };
    return groupedStudents2;
  };
  // get student by school name and list with sections
  getStudentsBySchool = async (_event, arg) => {
    console.log("getStudentsBySchool", arg);
    const students = await this.student.find({
      where: { studentSchoolName: arg },
      order: { studentClass: "ASC", studentSection: "ASC" }
    });
    let groupedStudents2 = {};
    groupedStudents2 = students.reduce((acc, student) => {
      if (!acc[student.studentClass]) {
        acc[student.studentClass] = {};
      }
      if (!acc[student.studentClass][student.studentSection]) {
        acc[student.studentClass][student.studentSection] = [];
      }
      acc[student.studentClass][student.studentSection].push(student);
      return acc;
    }, groupedStudents2);
    return groupedStudents2;
  };
  // add student
  addStudent = async (_event, arg) => {
    console.log("addStudent", arg);
    const student = new index.Student();
    student.studentSchoolName = arg.studentSchoolName;
    student.studentClass = arg.studentClass;
    student.studentSection = arg.studentSection;
    student.studentName = arg.studentName;
    student.studentID = arg.studentID;
    await this.student.save(student);
    _event.sender.send("saved_student", { mode: "insert", student });
    return student;
  };
  // update student
  updateStudent = async (_event, arg) => {
    console.log("updateStudent", arg);
    const student = await this.student.findOneByOrFail({ id: arg.id });
    student.studentSchoolName = arg.studentSchoolName;
    student.studentClass = arg.studentClass;
    student.studentSection = arg.studentSection;
    student.studentName = arg.studentName;
    student.studentID = arg.studentID;
    _event.sender.send("saved_student", { mode: "update", student });
    return this.student.save(student);
  };
  // delete student
  deleteStudent = async (_event, arg) => {
    console.log("deleteStudent", arg);
    const student = await this.student.findOneByOrFail({ id: arg });
    await this.student.remove(student);
    return student;
  };
  // remove all students
  removeAllStudents = async (_event) => {
    console.log("removeAllStudents");
    await this.student.delete({});
    return true;
  };
  // load students from xlsx and store
  loadStudentsFromXlsx = (_event, filename) => {
    if (!filename)
      return 0;
    let xlsxData = [];
    const students = [];
    if (fs?.existsSync(filename)) {
      try {
        const workbook = xlsx.readFile(filename);
        xlsxData = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          return { sheetName, rows: xlsx.utils.sheet_to_json(worksheet) };
        });
      } catch (error) {
        console.log("read-sheet-error", error);
      }
    } else {
      console.log("excel-error", "File not found.");
    }
    xlsxData.forEach((sheet) => {
      const { rows } = sheet;
      const nRows = rows.length;
      try {
        let i = 0;
        let schoolName = "";
        let section = "";
        let grade = "";
        for (i = 0; i < nRows; i++) {
          const values = Object.values(rows[i]);
          if (values.indexOf("الصف") >= 0) {
            grade = values.filter((val) => !(val.includes("الصف") || val.includes(":")))[0] || "";
          }
          if (values.indexOf("القسم") >= 0) {
            section = Object.values(rows[i + 2]).filter(
              (val) => !(val.includes("الفصل") || val.includes(":"))
            )[0] || "";
            if (i + 1 < nRows) {
              schoolName = Object.values(rows[i + 1])[0] || "";
            }
          }
          if (schoolName && section && grade)
            break;
          if (values.indexOf("الطلاب") >= 0)
            break;
        }
        schoolName = schoolName.trimStart().trimEnd();
        grade = grade.trimStart().trimEnd();
        section = section.trimStart().trimEnd();
        if (!schoolName || !section || !grade)
          return;
        let mobileNoKey = "";
        let idKey = "";
        let nameKey = "";
        do {
          i++;
        } while (Object.values(rows[i]).map((val) => val.trim()).indexOf("اسم الطالب".trim()) < 0);
        const keys = Object.keys(rows[i]);
        idKey = keys[Object.values(rows[i]).map((val) => val.trim()).indexOf("رقم رخصة الاقامة".trim())];
        nameKey = keys[Object.values(rows[i]).map((val) => val.trim()).indexOf("اسم الطالب".trim())];
        mobileNoKey = keys[Object.values(rows[i]).map((val) => val.trim()).indexOf("رقم جوال الطالب".trim())];
        i++;
        if (!idKey || !nameKey || !mobileNoKey)
          return;
        for (; i < nRows; i++) {
          try {
            students.push({
              studentSchoolName: schoolName,
              studentClass: grade,
              studentSection: section,
              studentName: rows[i][nameKey].toString().trimStart().trimEnd(),
              studentID: rows[i][idKey].toString().trimStart().trimEnd()
            });
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
    return Promise.all(
      students.map((arg) => {
        try {
          const student = new index.Student();
          student.studentSchoolName = arg.studentSchoolName;
          student.studentClass = arg.studentClass;
          student.studentSection = arg.studentSection;
          student.studentName = arg.studentName;
          student.studentID = Number(arg.studentID);
          if (isNaN(student.studentID))
            return;
          return this.student.save(student);
        } catch (e) {
          console.log(e);
        }
        return;
      })
    );
  };
  insertStudents = (_event, students) => {
    const worker = new worker_threads.Worker("./src/main/workers/ImportExcelWorker.tsx", {
      workerData: students
      // Send data to the worker thread
    });
    worker.on("message", (message) => {
      _event.sender.send("import-progress", message);
    });
  };
  getClassesBySchool = async (_event, schoolName) => {
    console.log("getClassesBySchool", schoolName);
    const allGrades = await this.student.createQueryBuilder("student").select("student.studentClass").where({ studentSchoolName: schoolName }).addSelect("COUNT(student.studentSection)", "totalSections").groupBy("student.studentClass").getRawMany();
    return allGrades;
  };
  getSectionssBySchoolAndClass = async (_event, _arg) => {
    console.log("getSectionssBySchoolAndClass", _arg);
    const allSections = await this.student.createQueryBuilder("student").select("student.studentSection").where(_arg).addSelect("COUNT(student.studentName)", "totalStudents").groupBy("student.studentSection").getRawMany();
    return allSections;
  };
  getStudentsBySection = async (_event, _arg) => {
    console.log("getStudentsBySection", _arg);
    const students = await this.student.find({ where: _arg });
    return students;
  };
}
const StudentController$1 = new StudentController();
class CommitteeController {
  committee;
  student;
  // constructor
  constructor() {
    this.committee = index.AppDataSource.manager.getRepository(index.Committee);
    this.student = index.AppDataSource.manager.getRepository(index.Student);
  }
  // create committee
  createCommittee = async (_event, arg) => {
    const created = [];
    if (arg.noOfCommittee > 0) {
      for (let i = 0; i < arg.noOfCommittee; i++) {
        const committee = new index.Committee();
        committee.committeeName = `${arg.committeeNamePrefix} ${i + 1}`;
        committee.deleteAllCommittee = arg.deletePrevious;
        committee.distributeEqualStudent = arg.distributeStudents;
        committee.classroomCommittee = arg.classroomCommittee;
        created.push(await this.committee.save(committee));
      }
    }
    return created;
  };
  // add committee
  async addCommittee(_event, arg) {
    const committee = new index.Committee();
    committee.committeeName = arg;
    committee.distributeEqualStudent = arg === "true";
    if (committee.distributeEqualStudent) {
      const allGrades = await this.student.createQueryBuilder("student").select("student.studentClass").addSelect("COUNT(student.studentClass)", "totalStudents").groupBy("student.studentClass").getRawMany();
      const grades = {};
      for (const grade of allGrades) {
        const students2 = await this.student.find({
          where: { studentClass: grade.student_studentClass }
        });
        grades[grade.student_studentClass] = {
          totalStudents: grade.totalStudents,
          students: students2
        };
      }
      const committees = await this.committee.find();
      const students = await this.student.find();
      for (const committee2 of committees) {
        const studentsByCommittee = await this.student.find({
          where: { committee: committee2 }
        });
        const studentsNotInCommittee = students.filter(
          (student) => !studentsByCommittee.includes(student)
        );
        for (const student of studentsNotInCommittee) {
          student.committee = committee2;
          await this.student.save(student);
        }
      }
    }
    committee.deleteAllCommittee = arg === "true";
    if (committee.deleteAllCommittee) {
      await this.committee.delete({});
    }
    await this.committee.save(committee);
    return await this.committee.find();
  }
  // get all committees
  getCommittees = async () => {
    return await this.committee.find();
  };
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
  deleteCommittee = async (_event, arg) => {
    console.log("deleteStudent", arg);
    const committee = await this.committee.findOneByOrFail({ id: arg });
    await this.committee.remove(committee);
    return committee;
  };
  // remove all committees
  removeAllCommittees = async (_event) => {
    console.log("removeAllCommittees");
    await this.committee.delete({});
    return true;
  };
  // assign Students to Committee
}
const CommitteeController$1 = new CommitteeController();
[
  // setting handlers
  electron.ipcMain.handle("getSetting", SettingController$1.getSetting),
  electron.ipcMain.handle("updateSetting", SettingController$1.updateSetting),
  // student
  electron.ipcMain.handle("importFileHeaderInfo", StudentController$1.importFileHeaderInfo),
  electron.ipcMain.handle("importFileSchoolInfo", StudentController$1.importFileSchoolInfo),
  electron.ipcMain.handle("importStudents", StudentController$1.importStudents),
  electron.ipcMain.handle("getStudents", StudentController$1.getStudents),
  electron.ipcMain.handle("getStudentGroups", StudentController$1.getStudentGroups),
  electron.ipcMain.handle("getStudentsBySchool", StudentController$1.getStudentsBySchool),
  electron.ipcMain.handle("getClassesBySchool", StudentController$1.getClassesBySchool),
  electron.ipcMain.handle("getSectionssBySchoolAndClass", StudentController$1.getSectionssBySchoolAndClass),
  electron.ipcMain.handle("getStudentsBySection", StudentController$1.getStudentsBySection),
  electron.ipcMain.handle("addStudent", StudentController$1.addStudent),
  electron.ipcMain.handle("updateStudent", StudentController$1.updateStudent),
  electron.ipcMain.handle("deleteStudent", StudentController$1.deleteStudent),
  electron.ipcMain.handle("removeAllStudents", StudentController$1.removeAllStudents),
  electron.ipcMain.handle("loadStudentsFromXlsx", StudentController$1.loadStudentsFromXlsx),
  electron.ipcMain.handle("insertStudents", StudentController$1.insertStudents),
  // committee
  electron.ipcMain.handle("getCommittees", CommitteeController$1.getCommittees),
  electron.ipcMain.handle("createCommittee", CommitteeController$1.createCommittee),
  electron.ipcMain.handle("deleteCommittee", CommitteeController$1.deleteCommittee),
  electron.ipcMain.handle("removeAllCommittees", CommitteeController$1.removeAllCommittees)
];
