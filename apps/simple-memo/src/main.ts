import moduleAlias from 'module-alias'
moduleAlias.addAliases({
  '@/store': __dirname + '/store',
  '@/util': __dirname + '/util',
  '@/service': __dirname + '/service',
})

import { app, BrowserWindow } from 'electron'
import path from 'path'
import { registerService } from './service'
import type { PrismaClientImpl } from './service/db-client-service'

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
      devTools: !app.isPackaged,
    },
    frame: true,
    autoHideMenuBar: true,
  })
  // 去掉菜单
  mainWindow.setMenu(null)
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
  let prismaService: PrismaClientImpl | undefined
  app.on('window-all-closed', async function () {
    if (prismaService) {
      try {
        const client = await prismaService.getClient()
        client?.$disconnect()
      } catch (error) {}
    }

    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  await app.whenReady()

  if (process.env.NODE_ENV === 'development') {
    // 安装 devtool 扩展
    const { default: installExtension, VUEJS3_DEVTOOLS } = require('electron-devtools-installer')
    await installExtension(VUEJS3_DEVTOOLS)
  }

  // 注册服务
  ;({ prismaService } = (await registerService()) ?? {})

  await createMainWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
}

main()
