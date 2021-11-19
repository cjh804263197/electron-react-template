const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        pickDir() {
            const dir = ipcRenderer.sendSync("PICK_DIR")
            return dir
        }
    }
})