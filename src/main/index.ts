import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

type IResize = Pick<sharp.ResizeOptions, "width" | "height">

type IJpeg = Pick<sharp.JpegOptions, "quality">

interface ProcessImgData
{
    sourceDir: string;
    targetDir: string;
    jpeg: IJpeg;
    corp?: sharp.Region;
    resize?: IResize;
}

function createWindow () {
    const win = new BrowserWindow({
        width: 1024,
        height: 798,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // 当为 true 时（默认为 true），只能在 `preload.js` 中引用 electron 中的模块，webview 中是无法引用到 electron 模块的
            // preload: path.join(__dirname, 'preload.js'),
        }
    })

    bindIPCEvents(win);

    win.webContents.once('dom-ready', () =>
    {
        if (process.env.NODE_ENV === 'development')
        {
            win.webContents.openDevTools();
        }
    });

    const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : path.join('file://', process.resourcesPath, '/app/dist/renderer/index.html')

    win.loadURL(url);
}

/**
 * 绑定IPC事件
 * @param browserWindow 
 */
function bindIPCEvents(browserWindow: Electron.BrowserWindow) {
    ipcMain.on("PICK_DIR", (event) =>
    {
        dialog.showOpenDialog(browserWindow, { properties: ['openDirectory'] })
        .then(({ filePaths }) =>
        {
            event.returnValue = filePaths.length ? filePaths[0] : null
        })
        .catch(err =>
        {
            console.error('openDirectory err =>', err)
            event.returnValue = null
        })
    })

    ipcMain.on("PROCESS_IMGS", (event, data: ProcessImgData) =>
    {
        const { sourceDir, targetDir, jpeg, corp, resize } = data
        fs.readdir(sourceDir, null, (err, files) =>
        {
            if (err)
            {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", err)
                return
            }
            const resFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.PNG'))
            if (!resFiles.length)
            {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", new Error('没有符合标准的图片'))
                return
            }
            const promises = resFiles.map(file =>
            {
                let sp = sharp(path.join(sourceDir, file))
                if (corp)
                {
                    sp = sp.extract(corp)
                }
                if (resize)
                {
                    sp = sp.resize({
                        width: resize.width || undefined,
                        height: resize.height || undefined,
                    })
                }
                return sp.jpeg({ quality: Number(jpeg.quality) }).toFile(path.join(targetDir, file.replace('.png', '.jpg')))
            })
            Promise.all(promises)
            .then(res =>
            {
                browserWindow.webContents.send("PROCESS_IMGS_SUCCESS", resFiles)
            })
            .catch(err =>
            {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", err)
            })
            
        })
    })
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', function () {
    app.quit()
})