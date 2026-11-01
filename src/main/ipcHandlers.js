// src/main/ipcHandlers.js
const { ipcMain, dialog, BrowserWindow, app } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('./sqlite');

function setupIpcHandlers() {
  // Overview
  ipcMain.handle('forgepoint:getOverview', async () => await db.getOverview());

  // Game Ideas
  ipcMain.handle('ideas:get', async () => await db.getGameIdeas());
  ipcMain.handle('ideas:getById', async (event, id) => await db.getGameIdeaById(id));
  ipcMain.handle('ideas:add', async (event, idea, mechanics) => await db.addGameIdea(idea, mechanics));
  ipcMain.handle('ideas:update', async (event, id, idea, mechanics) =>
    await db.updateGameIdea(id, idea, mechanics)
  );
  ipcMain.handle('ideas:delete', async (event, id) => await db.deleteGameIdea(id));
  ipcMain.handle('ideas:patchIntegration', async (event, ideaId, mechanicId, isIntegrated, notes) =>
    await db.patchIntegration(ideaId, mechanicId, isIntegrated, notes)
  );

  // Mechanics
  ipcMain.handle('mechanics:get', async () => await db.getMechanics());
  ipcMain.handle('mechanics:add', async (event, mechanic) => await db.addMechanic(mechanic));
  ipcMain.handle('mechanics:update', async (event, id, mechanic) => await db.updateMechanic(id, mechanic));
  ipcMain.handle('mechanics:delete', async (event, id) => await db.deleteMechanic(id));
  ipcMain.handle('mechanics:toggleImplemented', async (event, id, isImplemented) =>
    await db.toggleMechanicImplemented(id, isImplemented)
  );

  // Media (GIFs / Images)
  ipcMain.handle('media:select', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Selecionar Imagem ou GIF',
      properties: ['openFile'],
      filters: [
        { name: 'Mídias Suportadas', extensions: ['gif', 'png', 'jpg', 'jpeg', 'webp'] },
      ],
    });

    if (!filePaths || filePaths.length === 0) return null;

    const sourcePath = filePaths[0];
    const mediaDir = path.join(app.getPath('userData'), 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    const ext = path.extname(sourcePath).toLowerCase();
    const destName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const destPath = path.join(mediaDir, destName);

    fs.copyFileSync(sourcePath, destPath);

    // Retorna caminho absoluto ou file:// compatível
    return destPath;
  });

  // Backup & Restore
  ipcMain.handle('data:export', async () => {
    const data = await db.getAllData();
    const dateStr = new Date().toISOString().split('T')[0];
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exportar Backup do Forgepoint',
      defaultPath: `forgepoint_backup_${dateStr}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    }
    return false;
  });

  ipcMain.handle('data:import', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Importar Backup do Forgepoint',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (filePaths && filePaths.length > 0) {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      const data = JSON.parse(content);
      await db.importData(data);
      return true;
    }
    return false;
  });

  // Window Controls (frameless titlebar)
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;
    if (win.isMaximized()) {
      win.unmaximize();
      return false;
    } else {
      win.maximize();
      return true;
    }
  });

  ipcMain.handle('window:isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMaximized() : false;
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });
}

module.exports = { setupIpcHandlers };
