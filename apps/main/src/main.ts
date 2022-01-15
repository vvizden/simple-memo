import 'module-alias/register'
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { registerService } from './service'

//添加热更新功能
if (process.env.NODE_ENV === 'development') {
  require('electron-reloader')(module)
}

async function createMainWindow() {
  // 创建新的 electron 窗口
  const mainWindow = new BrowserWindow({
    minWidth: 820,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: true,
    autoHideMenuBar: true,
  })
  // 载入生产环境的 url
  await mainWindow.loadURL(process.env.ELECTRON_START_URL || path.join(__dirname, './dist/index.html'))
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
  return mainWindow
}

/**
 * main 函数
 */
async function main() {
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

  await app.whenReady()

  if (process.env.NODE_ENV === 'development') {
    // 安装 devtool 扩展
    const { default: installExtension, VUEJS3_DEVTOOLS } = require('electron-devtools-installer')
    await installExtension(VUEJS3_DEVTOOLS)
  }

  // 注册服务
  registerService()

  await createMainWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
}

main()
