// Configuration & Constants
const CONFIG = {
    ASSETS_PATH: './assets/images',
    ANIMATION_DURATION: 1000,
    NEXT_DELAY: 500,
    PLACEHOLDER_BOY: 'https://via.placeholder.com/100x150/FFD700/000?text=👦',
    PLACEHOLDER_LIXI: 'https://via.placeholder.com/100x150/FFD700/000?text=🧧'
};

const CHARACTERS_DB = [
    { id: 1, type: 'boy', name: 'Bé Minh', idle: 'boy-idle.png', lixi: 'boy-lixi.png' },
    { id: 2, type: 'girl', name: 'Bé Lan', idle: 'girl-idle.png', lixi: 'girl-lixi.png' },
    { id: 3, type: 'boy', name: 'Bé Tuấn', idle: 'boy-idle.png', lixi: 'boy-lixi.png' },
    { id: 4, type: 'girl', name: 'Bé Hoa', idle: 'girl-idle.png', lixi: 'girl-lixi.png' },
    { id: 5, type: 'boy', name: 'Bé Khoa', idle: 'boy-idle.png', lixi: 'boy-lixi.png' },
    { id: 6, type: 'girl', name: 'Bé Mai', idle: 'girl-idle.png', lixi: 'girl-lixi.png' }
];

const state = {
    queue: new Queue(),
    received: [],
    isRunning: false,
    stats: { total: 0, given: 0 }
};

// DOM Elements Cache
const elements = {
    slider: document.getElementById('numChildren'),
    numDisplay: document.getElementById('numDisplay'),
    giveOneBtn: document.getElementById('giveOneBtn'),
    giveAllBtn: document.getElementById('giveAllBtn'),
    resetBtn: document.getElementById('resetBtn'),

    queueLine: document.getElementById('queueLine'),
    receivedList: document.getElementById('receivedList'),
    completionMsg: document.getElementById('completionMessage'),
    room: document.getElementById('room'),
    elderImg: document.getElementById('elderImg'),
    
    progressBar: document.getElementById('progressBar'),
    statTotal: document.getElementById('statTotal'),
    statGiven: document.getElementById('statGiven'),
    statWaiting: document.getElementById('statWaiting'),

    charTemplate: document.getElementById('characterTemplate'),
    completionTemplate: document.getElementById('completionTemplate'),
    emptyQueueTemplate: document.getElementById('emptyQueueTemplate'),
};

const getAssetUrl = (filename) => `${CONFIG.ASSETS_PATH}/${filename}`;

const UI = {
    createCharacterNode(char, isReceived) {
        // 1. Clone elements from template's content
        const clone = elements.charTemplate.content.cloneNode(true);

        // 2. Fill in data into the cloned elements
        const img = clone.querySelector('.char-img');
        const nameDiv = clone.querySelector('.character-name');

        const imgPath = getAssetUrl(isReceived ? char.lixi : char.idle);
        const placeholder = isReceived ? CONFIG.PLACEHOLDER_LIXI : CONFIG.PLACEHOLDER_BOY;

        img.src = imgPath;
        img.alt = char.name;
        img.onerror = () => { img.src = placeholder; };
        nameDiv.textContent = char.name;

        return clone;
    },

    updateStats() {
        elements.statTotal.textContent = state.stats.total;
        elements.statGiven.textContent = state.stats.given;
        elements.statWaiting.textContent = state.queue.size();

        const percentage = state.stats.total > 0 ? (state.stats.given / state.stats.total) * 100 : 0;
        elements.progressBar.style.width = `${percentage}%`;
    },

    updateButtons() {
        const canOperate = !state.queue.isEmpty() && !state.isRunning;
        elements.giveOneBtn.disabled = !canOperate;
        elements.giveAllBtn.disabled = !canOperate;
        elements.resetBtn.disabled = state.isRunning;
        elements.slider.disabled = state.isRunning || state.stats.given > 0;
    },

    showCompletionMessage() {
        elements.completionMsg.innerHTML = '';

        if (state.queue.isEmpty() && !state.isRunning && state.stats.given > 0) {
            const clone = elements.completionTemplate.content.cloneNode(true);
            clone.querySelector('.final-count').textContent = state.stats.given;
            elements.completionMsg.appendChild(clone);
        }
    },

    renderQueue() {
        elements.queueLine.innerHTML = '';
        const waiting = state.queue.getAll();

        if (waiting.length === 0 && !state.isRunning) {
            const emptyNode = elements.emptyQueueTemplate.content.cloneNode(true);
            elements.queueLine.appendChild(emptyNode);
            return;
        }

        waiting.forEach(char => {
            const charNode = this.createCharacterNode(char, false);
            elements.queueLine.appendChild(charNode);
        });
    },

    renderReceived() {
        elements.receivedList.innerHTML = '';
        state.received.forEach(char => {
            const charNode = this.createCharacterNode(char, true);
            elements.receivedList.appendChild(charNode);
        });
    },
};

function init() {
    const num = parseInt(elements.slider.value);
    state.queue.clear();
    state.received = [];
    state.isRunning = false;
    state.stats = { total: num, given: 0 };

    CHARACTERS_DB.slice(0, num).forEach(char => {
        state.queue.enqueue({ ...char, hasLixi: false });
    });

    elements.numDisplay.textContent = num;
    elements.room.style.backgroundImage = `url(${getAssetUrl('room.jpg')})`;
    elements.elderImg.src = getAssetUrl('elder.png');
    elements.completionMsg.innerHTML = '';

    UI.renderQueue();
    UI.renderReceived();
    UI.updateStats();
    UI.updateButtons();
}

async function giveLixi() {
    if (state.queue.isEmpty() || state.isRunning) return;

    state.isRunning = true;
    UI.updateButtons();

    const child = state.queue.dequeue();
    const firstCharEl = elements.queueLine.querySelector('.character');
    if (!firstCharEl) return;

    // Animate
    firstCharEl.classList.add('moving-to-elder');
    await new Promise(r => setTimeout(r, CONFIG.ANIMATION_DURATION));
    firstCharEl.remove();

    state.received.push({ ...child, hasLixi: true });
    state.stats.given++;
    state.isRunning = false;

    // Render again
    UI.renderQueue();
    UI.renderReceived();
    UI.updateStats();
    UI.updateButtons();

    if (state.queue.isEmpty()) {
        UI.showCompletionMessage();
    }
}

async function giveAll() {
    while (!state.queue.isEmpty()) {
        await giveLixi();
        if (!state.queue.isEmpty()) {
            await new Promise(r => setTimeout(r, CONFIG.NEXT_DELAY));
        }
    }
}

function setupEventListeners() {
    elements.slider.addEventListener('input', (e) => {
        elements.numDisplay.textContent = e.target.value;
    });
    elements.slider.addEventListener('change', init);
    elements.giveOneBtn.addEventListener('click', giveLixi);
    elements.giveAllBtn.addEventListener('click', giveAll);
    elements.resetBtn.addEventListener('click', init);
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    init();
});