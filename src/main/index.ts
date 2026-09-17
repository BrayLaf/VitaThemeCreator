import { app, shell, BrowserWindow, protocol, net } from 'electron'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { initAssetsRoot } from './resourcePaths'

// In dev the renderer is served from ELECTRON_RENDERER_URL (http://localhost),
// and Chromium refuses to load plain file:// resources into a non-file-origin
// page ("Not allowed to load local resource") — that's why source images
// picked via the file dialog rendered as broken-image icons. A privileged
// custom scheme served via protocol.handle sidesteps that restriction and
// works identically in dev and in the packaged (file://) build.
protocol.registerSchemesAsPrivileged([
  { scheme: 'themefile', privileges: { standard: true, secure: true, supportFetchAPI: true } }
])

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

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
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  protocol.handle('themefile', (request) => {
    // Chromium's URL parser treats the first path segment of a privileged
    // "standard" custom scheme as an authority/host (and lowercases it),
    // so "themefile:///Users/x.png" doesn't round-trip as a plain path —
    // the real path travels in a query param instead.
    const filePath = new URL(request.url).searchParams.get('p')
    if (!filePath) return new Response('Missing path', { status: 400 })
    return net.fetch(pathToFileURL(filePath).toString())
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // DECISION (2026-09-17): the renderer's build-output roots ('Created Themes',
  // 'Exported', 'Icon Sets') are cwd-relative, which is the repo root under
  // `npm run dev`. A packaged app's cwd is whatever launched it — `/` for a
  // Finder launch (read-only), `$HOME` or the AppImage's folder on Linux — so
  // packaged builds pin cwd to a dedicated Documents subfolder instead.
  if (app.isPackaged) {
    const outputRoot = join(app.getPath('documents'), 'Vita Theme Creator')
    mkdirSync(outputRoot, { recursive: true })
    process.chdir(outputRoot)
  }

  initAssetsRoot(app)
  registerIpcHandlers()

  createWindow()

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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
