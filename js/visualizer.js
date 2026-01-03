class Visualizer {
    constructor(stackContainer, queueContainer, messageBox) {
        this.stackContainer = stackContainer;
        this.queueContainer = queueContainer;
        this.messageBox = messageBox;

        // animation system
        this.isAnimating = false;
        this.animationQueue = [];

        this.runNext = this.runNext.bind(this);

        // start loop
        requestAnimationFrame(this.runNext);
    }

    enqueueAnimation(fn) {
        this.animationQueue.push(fn);
    }

    resetAnimationQueue() {
        this.animationQueue = [];
        this.isAnimating = false;
    }

    runNext() {
        if (!this.isAnimating && this.animationQueue.length > 0) {
            const next = this.animationQueue.shift();
            next();
        }
        requestAnimationFrame(this.runNext);
    }

    flushAnimations(fn) {
        this.enqueueAnimation(() => {
            this.isAnimating = true;
            fn();
            this.isAnimating = false;
        });
    }

    animateStackPush(value) {
        this.enqueueAnimation(() => {
            this.isAnimating = true;

            const prevTop = this.stackContainer.lastElementChild;
            if (prevTop) prevTop.classList.remove("active");

            const box = this.createBox(value);
            box.classList.add("enter-stack", "active");
            this.stackContainer.appendChild(box);

            requestAnimationFrame(() => {
                box.classList.remove("enter-stack");
            });

            box.addEventListener("transitionend", () => {
                this.isAnimating = false;
            }, { once: true });
        });
    }

    animateStackPop() {
        this.enqueueAnimation(() => {
            const topBox = this.stackContainer.lastElementChild;
            if (!topBox) {
                this.isAnimating = false;
                return;
            }

            this.isAnimating = true;
            topBox.classList.add("removing");

            topBox.addEventListener("transitionend", () => {
                topBox.remove();

                const newTop = this.stackContainer.lastElementChild;
                if (newTop) newTop.classList.add("active");

                this.isAnimating = false;
            }, { once: true });
        });
    }

    animateQueueEnqueue(value) {
        this.enqueueAnimation(() => {
            this.isAnimating = true;

            const wasEmpty = this.queueContainer.children.length === 0;
            const box = this.createBox(value);
            box.classList.add("enter-queue");
            this.queueContainer.appendChild(box);

            requestAnimationFrame(() => {
                box.classList.remove("enter-queue");
                if (wasEmpty) box.classList.add("active");
            });

            box.addEventListener("transitionend", () => {
                this.isAnimating = false;
            }, { once: true });
        });
    };

    animateQueueDequeue() {
        this.enqueueAnimation(() => {
            const firstBox = this.queueContainer.firstElementChild;
            if (!firstBox) {
                this.isAnimating = false;
                return;
            }

            this.isAnimating = true;
            firstBox.classList.add("removing");

            firstBox.addEventListener("transitionend", () => {
                firstBox.remove();

                const newFront = this.queueContainer.firstElementChild;
                if (newFront) newFront.classList.add("active");

                this.isAnimating = false;
            }, { once: true });
        });
    }

    createBox(value) {
        const div = document.createElement("div");
        div.className = "box";
        div.textContent = value;
        return div;
    }

    showStack() {
        document.querySelectorAll(".stack-section")
            .forEach(el => el.classList.remove("hidden"));
        document.querySelectorAll(".queue-section")
            .forEach(el => el.classList.add("hidden"));
        valueInput.focus();
    }

    showQueue() {
        document.querySelectorAll(".queue-section")
            .forEach(el => el.classList.remove("hidden"));
        document.querySelectorAll(".stack-section")
            .forEach(el => el.classList.add("hidden"));
        valueInput.focus();
    }

    isStackVisible() {
        return !document.querySelector(".stack-section.hidden");
    }

    showMessage(text, type = "info") {
        this.messageBox.textContent = text;
        this.messageBox.className = `message ${type}`;
    }

    clearMessage() {
        this.messageBox.textContent = "";
        this.messageBox.className = "message";
    }

    updateLimit() {
        limitLabel.textContent = `Limit: ${appState.limit}`;
        document.documentElement.style.setProperty("--limit", appState.limit);
    }
}