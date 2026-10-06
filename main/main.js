const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const hljs = require("highlight.js");
const markedPromise = Promise.all([import("marked"), import("marked-footnote")])
    .then(([{ Marked }, footnote]) => {
        const parser = new Marked({ gfm: true });
        parser.use(footnote.default());
        return parser;
    });
let docsDirectory = path.resolve(__dirname, "../docs");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "../renderer/preload.js"),
            sandbox: true
        }
    });

    win.loadFile(path.join(__dirname, "../renderer/renderer.html"));
}

app.whenReady().then(createWindow);

ipcMain.handle("read-filetree", () => readTree(docsDirectory));

ipcMain.handle("open-library", async () => {
    const result = await dialog.showOpenDialog({
        title: "Open documentation library",
        properties: ["openDirectory"]
    });

    if (result.canceled || !result.filePaths.length) return null;

    const libraryDirectory = path.resolve(result.filePaths[0]);
    const selectedDocsDirectory = path.join(libraryDirectory, "docs");

    try {
        if (!fs.statSync(selectedDocsDirectory).isDirectory()) {
            throw new Error("The selected folder does not contain a docs folder.");
        }
    } catch {
        await dialog.showMessageBox({
            type: "warning",
            title: "Cannot open library",
            message: "Choose a folder that contains a docs subfolder."
        });
        return null;
    }

    docsDirectory = selectedDocsDirectory;
    return {
        name: path.basename(libraryDirectory),
        tree: readTree(docsDirectory)
    };
});

ipcMain.handle("read-file", (event, filePath) => {
    const resolvedPath = path.resolve(filePath);
    const relativePath = path.relative(docsDirectory, resolvedPath);

    if (relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
        throw new Error("Requested file is outside the documentation directory");
    }

    return fs.readFileSync(resolvedPath, "utf8");
});

ipcMain.handle("render-markdown", async (event, markdown) => {
    const parser = await markedPromise;
    const { Renderer } = await import("marked");
    const renderer = new Renderer();

    renderer.code = ({ text, lang }) => {
        const language = typeof lang === "string" ? lang.match(/^[\w+-]+/)?.[0] : "";
        const highlighted = language && hljs.getLanguage(language)
            ? hljs.highlight(text, { language }).value
            : hljs.highlightAuto(text).value;
        const languageClass = language ? ` class="language-${language}"` : "";
        return `<pre><code${languageClass}>${highlighted}</code></pre>\n`;
    };

    return parser.parse(markdown, { gfm: true, renderer });
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
