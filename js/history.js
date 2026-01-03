const undoStack = [];
const redoStack = [];

window.historyManager = {
    record(action) {
        undoStack.push(action);
        redoStack.length = 0;
    },

    undo() {
        if (visualizer.isAnimating || undoStack.length === 0)
            return;

        const action = undoStack.pop();
        visualizer.enqueueAnimation(() => action.undo());
        redoStack.push(action);
    },

    redo() {
        if (visualizer.isAnimating || redoStack.length === 0)
            return;

        const action = redoStack.pop();
        visualizer.enqueueAnimation(() => action.redo());
        undoStack.push(action);
    }
};
