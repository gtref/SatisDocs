const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("satisdocs", {
    readFileTree: () => ipcRenderer.invoke("read-filetree"),
    openLibrary: () => ipcRenderer.invoke("open-library"),
    readFile: filePath => ipcRenderer.invoke("read-file", filePath),
    renderMarkdown: markdown => ipcRenderer.invoke("render-markdown", markdown)
});