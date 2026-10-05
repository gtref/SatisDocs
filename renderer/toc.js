function renderTOC(markdown) {
    const toc = document.getElementById("toc");
    toc.innerHTML = "";

    const lines = markdown.split("\n");

    lines.forEach(line => {
        const match = line.match(/^(#+)\s+(.*)/);
        if (match) {
            const level = match[1].length;
            const text = match[2];

            const item = document.createElement("div");
            item.className = "toc-level-" + level;
            item.textContent = text;

            item.onclick = () => {
                const el = [...document.querySelectorAll("h1, h2, h3")]
                    .find(h => h.textContent === text);
                if (el) el.scrollIntoView({ behavior: "smooth" });
            };

            toc.appendChild(item);
        }
    });
}
