import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'

const isDev = process.env.IS_DEV === 'true' || process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Set the icon path based on platform
  let iconPath: string
  
  // In development, icons are in the source directory
  // In production, they'll be in the built app bundle
  const iconDir = isDev 
    ? path.join(process.cwd(), 'build/icons')
    : path.join(__dirname, '../build/icons')
  
  if (process.platform === 'win32') {
    iconPath = path.join(iconDir, 'icon.ico')
  } else if (process.platform === 'darwin') {
    iconPath = path.join(iconDir, 'icon.icns')
  } else {
    iconPath = path.join(iconDir, 'icon.png')
  }
  
  // Log the icon path for debugging
  console.log('Icon path:', iconPath)

  mainWindow = new BrowserWindow({
    width: 1600,  // Much larger to accommodate scaled-down content + right panel
    height: 1100, // Taller for scaled-down content
    minWidth: 1200,
    minHeight: 800,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      zoomFactor: 0.75, // Reduce scale by 25%
    },
    show: false,
    center: true,
    titleBarStyle: 'default',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, the files are in the app.asar bundle
    const indexPath = path.join(__dirname, '../dist/index.html')
    console.log('Loading file:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.webContents.send('removeLoading')
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle IPC messages
ipcMain.on('app-ready', () => {
  if (mainWindow) {
    mainWindow.webContents.send('removeLoading')
  }
}) 