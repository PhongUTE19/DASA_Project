function getKeyCombo(e) {
    const combo = [];
    if (e.ctrlKey) combo.push("Ctrl");
    if (e.shiftKey) combo.push("Shift");
    if (!["Control", "Shift"].includes(e.key))
        combo.push(e.key.toUpperCase());
    return combo.join("+");
}


function bindShortcuts(shortcuts) {
    document.addEventListener("keydown", e => {
        const combo = getKeyCombo(e);
        const entry = shortcuts[combo];
        if (!entry) return;
        e.preventDefault();
        entry.run();
    });
}

function renderKeyHints(shortcuts) {
    const hints = document.getElementById("keyHints");
    hints.innerHTML = Object.entries(shortcuts)
        .map(([key, meta]) => `<b>${key}</b> → ${meta.label}`)
        .join("<br>");
}

window.shortcutManager = {
    init(shortcuts) {
        bindShortcuts(shortcuts);
        renderKeyHints(shortcuts);
    }
}