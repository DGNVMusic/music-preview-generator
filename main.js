require('dotenv').config();
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { findBestPreview } = require('./lib/analyze');
const { uploadFile } = require('./lib/upload');

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 520,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-file', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'm4a', 'aac'] }
    ]
  });
  if (res.canceled) return null;
  return res.filePaths[0];
});

ipcMain.handle('process-and-upload', async (event, filePath, opts = {}) => {
  try {
    const previewPath = await findBestPreview(filePath, opts.windowSec || 30, opts.stepSec || 10);
    const result = await uploadFile(previewPath);
    return { success: true, url: result };
  } catch (err) {
    return { success: false, error: (err && err.message) || String(err) };
  }
});
