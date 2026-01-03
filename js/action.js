window.actions = {
    push(value) {
        const { stack, limit } = appState;

        if (stack.size() >= limit) {
            visualizer.showMessage(`Stack overflow! Max size is ${limit}.`, "error");
            return;
        }

        stack.push(value);
        visualizer.animateStackPush(value);

        historyManager.record({
            undo: () => {
                stack.pop();
                visualizer.animateStackPop();
            },
            redo: () => {
                stack.push(value);
                visualizer.animateStackPush(value);
            }
        });
    },

    pop() {
        const { stack } = appState;

        if (stack.isEmpty()) {
            visualizer.showMessage("Stack underflow! Nothing to pop.", "error");
            return;
        }

        const value = stack.pop();
        visualizer.animateStackPop();

        historyManager.record({
            undo: () => {
                stack.push(value);
                visualizer.animateStackPush(value);
            },
            redo: () => {
                stack.pop();
                visualizer.animateStackPop();
            }
        });
    },

    enqueue(value) {
        const { queue, limit } = appState;

        if (queue.size() >= limit) {
            visualizer.showMessage(`Queue overflow! Max size is ${limit}.`, "error");
            return;
        }

        queue.enqueue(value);
        visualizer.animateQueueEnqueue(value);

        historyManager.record({
            undo: () => {
                queue.dequeue();
                visualizer.animateQueueDequeue();
            },
            redo: () => {
                queue.enqueue(value);
                visualizer.animateQueueEnqueue(value);
            }
        });
    },

    dequeue() {
        const { queue } = appState;

        if (queue.isEmpty()) {
            visualizer.showMessage("Queue underflow! Nothing to dequeue.", "error");
            return;
        }

        const value = queue.dequeue();
        visualizer.animateQueueDequeue();

        historyManager.record({
            undo: () => {
                queue.enqueue(value);
                visualizer.animateQueueEnqueue(value);
            },
            redo: () => {
                queue.dequeue();
                visualizer.animateQueueDequeue();
            }
        });
    },

    clear() {
        const before = {
            stack: [...appState.stack.items],
            queue: [...appState.queue.items]
        };

        appState.stack.clear();
        appState.queue.clear();
        stackContainer.innerHTML = "";
        queueContainer.innerHTML = "";

        historyManager.record({
            undo: () => restoreState(before),
            redo: () => actions.clear()
        });
    },

    insert() {
        visualizer.isStackVisible() ? actions.push(valueInput.value) : actions.enqueue(valueInput.value);
    },

    remove() {
        visualizer.isStackVisible() ? actions.pop() : actions.dequeue();
    },

    increaseLimit() {
        appState.limit++;
        visualizer.updateLimit();

    },

    decreaseLimit() {
        if (appState.limit <= 1)
            return;
        appState.limit--;
        visualizer.updateLimit();
    },
};

function restoreState(snapshot) {
    visualizer.flushAnimations(() => {
        appState.stack.clear();
        appState.queue.clear();
        stackContainer.innerHTML = "";
        queueContainer.innerHTML = "";

        snapshot.stack.forEach(v => {
            appState.stack.push(v);
            visualizer.animateStackPush(v);
        });

        snapshot.queue.forEach(v => {
            appState.queue.enqueue(v);
            visualizer.animateQueueEnqueue(v);
        });
    });
}
