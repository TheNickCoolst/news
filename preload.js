const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('news', {
  fetchFeed: (url) => ipcRenderer.invoke('fetch-feed', url),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getGeo: () => ipcRenderer.invoke('get-geo'),
  aiStatus: () => ipcRenderer.invoke('ai-status'),
  summarizeAi: (article) => ipcRenderer.invoke('ai-summarize', article),
});
