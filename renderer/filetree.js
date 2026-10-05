function renderFileTree(tree) {
    const container = document.getElementById("filetree");
    container.innerHTML = "";

    function build(node, parent) {
        const item = document.createElement("div");
        item.className = node.type;
        item.textContent = node.name;

        if (node.type === "file") {
            item.onclick = () => loadFile(node.path);
        }

        parent.appendChild(item);

        if (node.type === "folder") {
            const childrenContainer = document.createElement("div");
            childrenContainer.className = "children";

            node.children.forEach(child => build(child, childrenContainer));
            parent.appendChild(childrenContainer);
        }
    }

    tree.forEach(node => build(node, container));
}
