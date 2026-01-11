const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  processAndUpload: (filePath, opts) => ipcRenderer.invoke('process-and-upload', filePath, opts)
});
