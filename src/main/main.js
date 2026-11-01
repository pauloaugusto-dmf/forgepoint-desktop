// src/main/main.js
const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { setupIpcHandlers } = require('./ipcHandlers');
const { initDatabase } = require('./sqlite');

// Registra esquema privilegiado para mídias locais seguras
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'forgepoint-media',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true,
    },
  },
]);

let mainWindow;

app.disableHardwareAcceleration();

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b0f17',
    icon: path.join(app.getAppPath(), 'src', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const sendWindowState = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:stateChange', {
        isMaximized: mainWindow.isMaximized(),
      });
    }
  };

  mainWindow.on('maximize', sendWindowState);
  mainWindow.on('unmaximize', sendWindowState);
  mainWindow.on('resize', sendWindowState);

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    // Registra protocolo customizado para mídias locais (evita bloqueios de segurança do Chromium)
    protocol.handle('forgepoint-media', (request) => {
      let filePath = request.url.replace(/^forgepoint-media:\/\//, '');
      // No Windows pode vir com barra inicial, no Linux já é path absoluto
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.slice(1);
      }
      let decodedPath = decodeURIComponent(filePath);
      if (!path.isAbsolute(decodedPath)) {
        decodedPath = path.join(app.getAppPath(), decodedPath);
      }
      return net.fetch(pathToFileURL(decodedPath).toString());
    });

    console.log('[Forgepoint] Starting database...');
    await initDatabase();

    console.log('[Forgepoint] Registering IPC handlers...');
    setupIpcHandlers();

    console.log('[Forgepoint] Creating window...');
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('[Forgepoint] Startup error:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
