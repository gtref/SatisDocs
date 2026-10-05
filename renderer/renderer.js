const { ipcRenderer } = require("electron");
const { marked } = require("marked");
const hljs = require("highlight.js");

window.addEventListener("DOMContentLoaded", async () => {
    const tree = await ipcRenderer.invoke("read-filetree");
    renderFileTree(tree);
});

async function loadFile(path) {
    const raw = await ipcRenderer.invoke("read-file", path);

    marked.setOptions({
        highlight: (code) => hljs.highlightAuto(code).value
    });

    const html = marked.parse(raw);
    document.getElementById("content").innerHTML = html;

    renderTOC(raw);
}
