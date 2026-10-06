import { renderFileTree } from "./filetree.js";
import { renderTOC } from "./toc.js";

const content = document.getElementById("content");
const searchInput = document.getElementById("doc-search");
const fileCount = document.getElementById("file-count");
const libraryName = document.getElementById("library-name");
const topbarTitle = document.getElementById("topbar-title");
const breadcrumbFile = document.getElementById("breadcrumb-file");
const readingTime = document.getElementById("reading-time");
const toc = document.getElementById("toc");
let fileTree = [];
let selectedPath = "";

window.addEventListener("DOMContentLoaded", async () => {
    try {
        fileTree = await window.satisdocs.readFileTree();
        libraryName.textContent = "SatisDocs";
        fileCount.textContent = `${countFiles(fileTree)} FILES`;
        updateFileTree();
        bindControls();

        const firstMarkdown = findFirstMarkdown(fileTree);
        if (firstMarkdown) {
            await loadFile(firstMarkdown.path);
        }
    } catch (error) {
        content.textContent = `Unable to open the documentation library: ${error.message}`;
    }
});

function bindControls() {
    searchInput.addEventListener("input", updateFileTree);
    document.getElementById("sidebar-toggle").addEventListener("click", () => togglePanel("sidebar"));
    document.getElementById("outline-toggle").addEventListener("click", () => togglePanel("outline"));
    document.getElementById("backdrop").addEventListener("click", closePanels);
    document.getElementById("open-library").addEventListener("click", openLibrary);
    document.querySelector(".brand").addEventListener("click", event => event.preventDefault());
}

async function openLibrary() {
    try {
        const library = await window.satisdocs.openLibrary();
        if (!library) return;

        fileTree = library.tree;
        selectedPath = "";
        searchInput.value = "";
        libraryName.textContent = library.name;
        fileCount.textContent = `${countFiles(fileTree)} FILES`;
        updateFileTree();

        const firstMarkdown = findFirstMarkdown(fileTree);
        if (firstMarkdown) {
            await loadFile(firstMarkdown.path);
        } else {
            topbarTitle.textContent = library.name;
            breadcrumbFile.textContent = "No Markdown files";
            readingTime.textContent = "";
            content.textContent = "This library's docs folder does not contain any Markdown files.";
            toc.replaceChildren();
            closePanels();
        }
    } catch (error) {
        content.textContent = `Unable to open this library: ${error.message}`;
    }
}

function togglePanel(panel) {
    const className = panel === "sidebar" ? "sidebar-open" : "outline-open";
    const toggle = document.getElementById(panel === "sidebar" ? "sidebar-toggle" : "outline-toggle");
    const willOpen = !document.body.classList.contains(className);
    document.body.classList.remove("sidebar-open", "outline-open");
    document.body.classList.toggle(className, willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
}

function closePanels() {
    document.body.classList.remove("sidebar-open", "outline-open");
    document.getElementById("sidebar-toggle").setAttribute("aria-expanded", "false");
    document.getElementById("outline-toggle").setAttribute("aria-expanded", "false");
}

function updateFileTree() {
    renderFileTree(fileTree, loadFile, searchInput.value, selectedPath);
}

async function loadFile(filePath) {
    try {
        const raw = await window.satisdocs.readFile(filePath);
        const html = await window.satisdocs.renderMarkdown(raw);
        selectedPath = filePath;
        updateFileTree();
        content.innerHTML = html;
        renderTOC(content, toc);

        const filename = filePath.split(/[\\/]/).pop();
        topbarTitle.textContent = filename;
        breadcrumbFile.textContent = filename;
        const words = raw.trim().split(/\s+/).filter(Boolean).length;
        readingTime.textContent = words ? `${Math.max(1, Math.ceil(words / 220))} MIN READ` : "";
        document.getElementById("reader").scrollTop = 0;
        closePanels();
    } catch (error) {
        content.textContent = `Unable to open this document: ${error.message}`;
    }
}

function countFiles(nodes) {
    return nodes.reduce((total, node) => total + (node.type === "folder" ? countFiles(node.children) : 1), 0);
}

function findFirstMarkdown(nodes) {
    for (const node of nodes) {
        if (node.type === "folder") {
            const match = findFirstMarkdown(node.children);
            if (match) return match;
        } else if (/\.md$/i.test(node.name)) {
            return node;
        }
    }
    return null;
}
