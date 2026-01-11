const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { createPreview } = require('./audioUtils');
require('dotenv').config();

let mainWindow;

//Init S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    // IPC Handler: Process and Upload
    ipcMain.handle('process-audio', async (event, filePath) => {
        const tempdir = app.getPath('temp');
        try {
            // 1. Process audio (Find intensity & cut)
            const previewPath = await createPreview(filePath, tempdir);
            const fileName = path.basename(previewPath);

            // 2. Read generated file
            const fileStream = fs.createReadStream(previewPath);

            // 3. Upload to S3
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: fileName,
                    Body: fileStream,
                    ContentType: 'audio/mpeg' // IMPORTANT. CLOUDFRONT WILL SERVE OCTET STREAM OTHERWISE
                }
            });
            await upload.done();

            // 4. Cleanup temp file
            fs.unlinkSync(previewPath);

            // 5. Return CloudFront URL
            const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${fileName}`;
            return { success: true, url: cloudFrontUrl };
        } catch (error) {
            console.error('Error processing audio:', error);
            return { success: false, error: error.message };
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});