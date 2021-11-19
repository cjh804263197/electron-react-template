import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';

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
        win.webContents.openDevTools();
    });

    win.loadURL('http://localhost:3002');
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
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', function () {
    app.quit()
})