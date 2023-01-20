import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
const sizeOf =  require('image-size');

interface IBaseImg {
    name: string;
    path: string;
}

type IResize = Pick<sharp.ResizeOptions, "width" | "height">

type IJpeg = Pick<sharp.JpegOptions, "quality">

interface ProcessImgData
{
    sourceDir: string;
    targetDir: string;
    jpeg: IJpeg;
    resize?: IResize;
}


/**
 * 检索指定路径下的图片
 * @param sourcePath 指定路径
 * @returns 图片路径
 */
export function searchImage(sourcePath: string): Promise<IBaseImg[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(sourcePath, (err, files) => {
            if (err) {
                reject(err)
            }

            const targetFilePaths = files
            .filter(fileName => fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.JPEG'))
            .map(fileName => ({
                name: fileName,
                path: path.resolve(sourcePath, fileName)
            }))
            resolve(targetFilePaths)
        })
    })
}

/**
 * 剪裁图片
 * @param imgPath 图片路径
 * @param imgName 图片名称
 * @param targetPath 输出路径
 * @param resize 指定尺寸
 * @returns 
 */
export function corpImage(imgPath: string, imgName: string, targetPath: string, jpeg: IJpeg, resize?: IResize) {
    return new Promise((resolve, reject) => {
        let { width, height } = sizeOf(imgPath);
        if(!fs.existsSync(targetPath)) fs.mkdirSync(targetPath);
        const img = sharp(imgPath);
        if (height > width) {
            img.rotate(90);
            // swip
            let temp = width;
            width = height;
            height = temp;
        }
        img
        .resize(resize?.width || 640, resize?.height || 360, { fit: 'cover' })
        .jpeg({ quality: Number(jpeg.quality) })
        .toFile(path.resolve(targetPath, imgName), (err, info) => {
            err ? reject(err) : resolve(info)
        })
    })
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

    ipcMain.on("PROCESS_IMGS", async (event, data: ProcessImgData) =>
    {
        const { sourceDir, targetDir, jpeg, resize } = data
        let totalCount = 0;
        let successCount = 0;
        let failCount = 0;
        try {
            const targetImgs = await searchImage(sourceDir);

            if (!targetImgs.length)
            {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", new Error('没有符合标准的图片'))
                return
            }

            totalCount = targetImgs.length;

            browserWindow.webContents.send("PROCESS_IMGS_PROGRESS", {
                totalCount,
                successCount,
                failCount,
            })

            for (const targetImg of targetImgs) {
                await corpImage(targetImg.path, targetImg.name, targetDir, jpeg, resize)
                .then(() => {
                    successCount++;
                    browserWindow.webContents.send("PROCESS_IMGS_PROGRESS", {
                        totalCount,
                        successCount,
                        failCount,
                    })
                })
                .catch(err => {
                    failCount++;
                    browserWindow.webContents.send("PROCESS_IMGS_PROGRESS", {
                        totalCount,
                        successCount,
                        failCount,
                    })
                })
            }

            browserWindow.webContents.send("PROCESS_IMGS_SUCCESS", targetImgs)
        }
        catch (err) {
            browserWindow.webContents.send("PROCESS_IMGS_FAIL", err)
        }
    })
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', function () {
    app.quit()
})