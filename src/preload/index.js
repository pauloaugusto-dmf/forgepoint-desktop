// src/preload/index.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Overview
  getOverview: () => ipcRenderer.invoke('forgepoint:getOverview'),

  // Game Ideas
  getGameIdeas: () => ipcRenderer.invoke('ideas:get'),
  getGameIdeaById: (id) => ipcRenderer.invoke('ideas:getById', id),
  addGameIdea: (idea, mechanics) => ipcRenderer.invoke('ideas:add', idea, mechanics),
  updateGameIdea: (id, idea, mechanics) => ipcRenderer.invoke('ideas:update', id, idea, mechanics),
  deleteGameIdea: (id) => ipcRenderer.invoke('ideas:delete', id),
  patchIntegration: (ideaId, mechanicId, isIntegrated, notes) =>
    ipcRenderer.invoke('ideas:patchIntegration', ideaId, mechanicId, isIntegrated, notes),

  // Mechanics
  getMechanics: () => ipcRenderer.invoke('mechanics:get'),
  addMechanic: (mechanic) => ipcRenderer.invoke('mechanics:add', mechanic),
  updateMechanic: (id, mechanic) => ipcRenderer.invoke('mechanics:update', id, mechanic),
  deleteMechanic: (id) => ipcRenderer.invoke('mechanics:delete', id),
  toggleMechanicImplemented: (id, isImplemented) =>
    ipcRenderer.invoke('mechanics:toggleImplemented', id, isImplemented),

  // Media (GIFs / Images)
  selectMedia: () => ipcRenderer.invoke('media:select'),
  selectMultipleMedia: () => ipcRenderer.invoke('media:selectMultiple'),

  // Backup & Restore
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: () => ipcRenderer.invoke('data:import'),
});

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onStateChange: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('window:stateChange', handler);
    return () => ipcRenderer.removeListener('window:stateChange', handler);
  },
});
