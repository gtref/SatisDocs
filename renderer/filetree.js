export function renderFileTree(tree, onFileSelect, filter = "", selectedPath = "") {
    const container = document.getElementById("filetree");
    container.replaceChildren();
    const query = filter.trim().toLocaleLowerCase();

    function containsMatch(node) {
        return node.name.toLocaleLowerCase().includes(query)
            || (node.type === "folder" && node.children.some(containsMatch));
    }

    function build(node, parent, depth, inheritedMatch = false) {
        const nameMatches = inheritedMatch || !query || node.name.toLocaleLowerCase().includes(query);
        if (!nameMatches && !(node.type === "folder" && node.children.some(containsMatch))) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = node.type === "folder" ? "tree-node tree-folder" : "tree-node";
        const item = document.createElement("button");
        item.type = "button";
        item.className = "tree-item";
        item.style.setProperty("--depth", depth);
        item.textContent = node.name;

        if (node.type === "folder") {
            const children = document.createElement("div");
            children.className = "tree-children";
            const expanded = !query || nameMatches || node.children.some(containsMatch);
            item.setAttribute("aria-expanded", String(expanded));
            children.hidden = !expanded;
            item.addEventListener("click", () => {
                const isExpanded = item.getAttribute("aria-expanded") === "true";
                item.setAttribute("aria-expanded", String(!isExpanded));
                children.hidden = isExpanded;
            });

            node.children.forEach(child => build(child, children, depth + 1, nameMatches));
            wrapper.append(item, children);
        } else {
            if (node.path === selectedPath) item.setAttribute("aria-current", "page");
            item.addEventListener("click", () => onFileSelect(node.path));
            wrapper.appendChild(item);
        }

        parent.appendChild(wrapper);
    }

    tree.forEach(node => build(node, container, 0));

    if (!container.childElementCount) {
        const empty = document.createElement("div");
        empty.className = "tree-empty";
        empty.textContent = query ? "No files match this filter." : "No documents found.";
        container.appendChild(empty);
    }
}
