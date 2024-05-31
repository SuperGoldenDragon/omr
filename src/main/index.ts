import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { attachTitlebarToWindow, setupTitlebar } from 'custom-electron-titlebar/main'
import { BrowserWindow, Menu, OpenDialogOptions, app, dialog, ipcMain, nativeTheme } from 'electron'
import { machineIdSync } from 'node-machine-id'
import { join } from 'node:path'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import icon from '../../resources/icon.png?asset'
import { Setting } from './entities/Setting'
import { Student } from './entities/Student'
import os from 'os'
import ExcelJS from 'exceljs'
import { Committee } from './entities/Commitee'

// setup the titlebar main process
setupTitlebar()
Menu.setApplicationMenu(null)

let mainWindow: BrowserWindow | null
let subWindow: BrowserWindow | null

// create a new DataSource instance for better-sqlite3
export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: join(app.getPath('userData'), 'db.sqlite'),
  synchronize: true,
  entities: [Setting, Student, Committee],
  logging: true
})

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.setMinimumSize(800, 600)

  // attach fullscreen(f11 and not 'maximized') && focus listeners
  attachTitlebarToWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  //   mainWindow.webContents.setWindowOpenHandler((details) => {
  //     shell.openExternal(details.url)
  //     return { action: 'deny' }
  //   })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('url', url)

    // find the ##var## in the url using regex
    const regex = /##(.*?)##/g
    const matches = url.match(regex)
    const hash = matches ? matches[0].replace(/##/g, '') : null
    console.log('hash', hash)

    subWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      //   parent: mainWindow,
      modal: true,
      show: true,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      subWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + hash)
    } else {
      subWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: hash! })
    }

    subWindow.on('ready-to-show', () => {
      subWindow!.show()
    })

    subWindow.on('close', () => {
      console.log('subWindow closed', mainWindow?.isDestroyed())

      // check if the main window is not closed
      if (mainWindow?.isDestroyed() === false) {
        mainWindow!.webContents.send('import-students', { event: 'closed' })
      }
    })

    return { action: 'deny' }
  })

  mainWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // initialize the DataSource instance
  AppDataSource.initialize()
    .then(async () => {
      console.log('Data Source has been initialized!')

      // Dynamically import handler module
      await import('./handlers')

      // initial setting
      const setting = AppDataSource.manager.getRepository(Setting)

      // check if setting already exists
      const existingSetting = await setting.findOne({ where: { id: 1 } })
      if (!existingSetting) {
        // create initial setting
        const initialSetting = new Setting()
        initialSetting.mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
        initialSetting.appLanguage = 'en'
        initialSetting.appName = 'OMR STUDIO'
        initialSetting.deviceId = machineIdSync(true)
        await setting.save(initialSetting)
      }
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err)
    })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create the main window
  createWindow()

  ipcMain.on('import-students', (_event, arg) => {
    console.log('import-students', arg)

    mainWindow!.webContents.send('import-students', arg)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  AppDataSource.destroy()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('open-file-dialog-for-file', function (event) {
  const options: OpenDialogOptions = {
    properties:
      os.platform() === 'linux' || os.platform() === 'win32'
        ? ['openFile']
        : ['openFile', 'openDirectory']
  }

  dialog
    .showOpenDialog(options)
    .then(async (result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        event.sender.send('selected-file', result.filePaths[0])

        const filePath = result.filePaths[0]

        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.readFile(filePath)

        const sheets = workbook.worksheets

        event.sender.send(
          'sheets',
          sheets.map((sheet) => sheet.name)
        )
      } else {
        event.sender.send('selection-canceled', '')
      }
    })
    .catch((err) => {
      console.error('Error while opening dialog:', err)
    })
})
