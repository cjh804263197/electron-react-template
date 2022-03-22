"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1024,
        height: 798,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // 当为 true 时（默认为 true），只能在 `preload.js` 中引用 electron 中的模块，webview 中是无法引用到 electron 模块的
            // preload: path.join(__dirname, 'preload.js'),
        }
    });
    bindIPCEvents(win);
    win.webContents.once('dom-ready', () => {
        if (process.env.NODE_ENV === 'development') {
            win.webContents.openDevTools();
        }
    });
    // const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : path.join('file://', process.resourcesPath, '/app/dist/renderer/index.html')
    win.loadURL("https://cms.meshkit.cn/");
}
/**
 * 绑定IPC事件
 * @param browserWindow
 */
function bindIPCEvents(browserWindow) {
    electron_1.ipcMain.on("PICK_DIR", (event) => {
        electron_1.dialog.showOpenDialog(browserWindow, { properties: ['openDirectory'] })
            .then(({ filePaths }) => {
            event.returnValue = filePaths.length ? filePaths[0] : null;
        })
            .catch(err => {
            console.error('openDirectory err =>', err);
            event.returnValue = null;
        });
    });
    electron_1.ipcMain.on("PROCESS_IMGS", (event, data) => {
        const { sourceDir, targetDir, jpeg, corp, resize } = data;
        fs.readdir(sourceDir, null, (err, files) => {
            if (err) {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", err);
                return;
            }
            const resFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.PNG'));
            if (!resFiles.length) {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", new Error('没有符合标准的图片'));
                return;
            }
            const promises = resFiles.map(file => {
                let sp = sharp(path.join(sourceDir, file));
                if (corp) {
                    sp = sp.extract(corp);
                }
                if (resize) {
                    sp = sp.resize({
                        width: resize.width || undefined,
                        height: resize.height || undefined,
                    });
                }
                return sp.jpeg({ quality: Number(jpeg.quality) }).toFile(path.join(targetDir, file.replace('.png', '.jpg')));
            });
            Promise.all(promises)
                .then(res => {
                browserWindow.webContents.send("PROCESS_IMGS_SUCCESS", resFiles);
            })
                .catch(err => {
                browserWindow.webContents.send("PROCESS_IMGS_FAIL", err);
            });
        });
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
});
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
