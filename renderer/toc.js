export function renderTOC(content, toc) {
    const headings = [...content.querySelectorAll("h1, h2, h3, h4, h5, h6")];
    toc.replaceChildren();

    if (!headings.length) {
        const empty = document.createElement("p");
        empty.className = "toc-empty";
        empty.textContent = "No section headings";
        toc.appendChild(empty);
        return;
    }

    const usedIds = new Set();
    headings.forEach((heading, index) => {
        if (!heading.id) {
            const baseId = heading.textContent
                .toLocaleLowerCase()
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w-]+/g, "-")
                .replace(/^-+|-+$/g, "") || `section-${index + 1}`;
            let id = baseId;
            let suffix = 2;
            while (usedIds.has(id) || document.getElementById(id)) id = `${baseId}-${suffix++}`;
            heading.id = id;
        }
        usedIds.add(heading.id);

        const item = document.createElement("button");
        item.type = "button";
        item.className = "toc-link";
        item.style.setProperty("--level", heading.tagName.slice(1));
        item.textContent = heading.textContent;
        if (index === 0) item.setAttribute("aria-current", "location");
        item.addEventListener("click", () => heading.scrollIntoView({ behavior: "smooth", block: "start" }));
        toc.appendChild(item);
    });
}
