const stackContainer = document.getElementById("stack-container");
const queueContainer = document.getElementById("queue-container");
const messageBox = document.getElementById("message");
const pushBtn = document.getElementById("pushBtn");
const popBtn = document.getElementById("popBtn");
const enqueueBtn = document.getElementById("enqueueBtn");
const dequeueBtn = document.getElementById("dequeueBtn");
const showStackBtn = document.getElementById("showStack");
const showQueueBtn = document.getElementById("showQueue");
const clearBtn = document.getElementById("clearBtn");
const increaseLimitBtn = document.getElementById("increaseLimit");
const decreaseLimitBtn = document.getElementById("decreaseLimit");
const limitLabel = document.getElementById("limitLabel");
const valueInput = document.getElementById("valueInput");
const visualizer = new Visualizer(stackContainer, queueContainer, messageBox);

pushBtn.onclick = () => actions.push(valueInput.value);
popBtn.onclick = () => actions.pop();
enqueueBtn.onclick = () => actions.enqueue(valueInput.value);
dequeueBtn.onclick = () => actions.dequeue();
clearBtn.onclick = () => actions.clear();
showStackBtn.onclick = () => visualizer.showStack();
showQueueBtn.onclick = () => visualizer.showQueue();

increaseLimitBtn.onclick = () => actions.increaseLimit();
decreaseLimitBtn.onclick = () => actions.decreaseLimit();

shortcutManager.init({
    "Ctrl+I": { run: actions.insert, label: "Insert" },
    "Ctrl+O": { run: actions.remove, label: "Remove" },
    "Ctrl+Z": { run: historyManager.undo, label: "Undo" },
    "Ctrl+Shift+Z": { run: historyManager.redo, label: "Redo" }
});

// =========================
// Init
// =========================
visualizer.updateLimit();
visualizer.showStack();