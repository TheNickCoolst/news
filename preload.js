const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('opaNews', {
  fetchFeed: (url) => ipcRenderer.invoke('fetch-feed', url),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
