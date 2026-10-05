const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "../renderer/renderer.js")
        }
    });

    win.loadFile(path.join(__dirname, "../renderer/renderer.html"));
}

app.whenReady().then(createWindow);

ipcMain.handle("read-filetree", () => {
    return readTree(path.join(__dirname, "../docs"));
});

ipcMain.handle("read-file", (event, filePath) => {
    return fs.readFileSync(filePath, "utf8");
});

function readTree(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.map(entry => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            return {
                name: entry.name,
                type: "folder",
                children: readTree(fullPath)
            };
        }

        return {
            name: entry.name,
            type: "file",
            path: fullPath
        };
    });
}
