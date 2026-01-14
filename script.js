// Configuration & Constants
const CONFIG = {
    IMAGES_PATH: './assets/images',
    SOUNDS_PATH: './assets/sounds',
    WISH_DURATION: 1500,
    LIXI_DURATION: 1000,
    BOUNCE_DURATION: 500,
    NEXT_DELAY: 500,
    EASING_CUBIC_BEZIER: 'cubic-bezier(0.22, 1, 0.36, 1)',
    PLACEHOLDER_IDLE: 'https://via.placeholder.com/100x150/FFD700/000?text=👦',
    PLACEHOLDER_LIXI: 'https://via.placeholder.com/100x150/FFD700/000?text=🧧'
};

const CHARACTERS_DB = [
    { id: 1, type: 'boy', name: 'Bé Như', idle: 'boy-idle.png', lixi: 'boy-lixi.png' },
    { id: 2, type: 'girl', name: 'Bé Trang', idle: 'girl-idle.png', lixi: 'girl-lixi.png' },
    { id: 3, type: 'boy', name: 'Bé Tuấn', idle: 'boy-idle.png', lixi: 'boy-lixi.png' },
    { id: 4, type: 'girl', name: 'Bé Hoa', idle: 'girl-idle.png', lixi: 'girl-lixi.png' },
    { id: 5, type: 'boy', name: 'Bé Khoa', idle: 'boy-idle.png', lixi: 'boy-lixi.png' },
    { id: 6, type: 'girl', name: 'Bé Mai', idle: 'girl-idle.png', lixi: 'girl-lixi.png' }
];

const WISHES_DB = [
    {
        id: 1,
        text: "Chúc ông bà sống lâu trăm tuổi ạ!",
        tone: "respectful"
    },
    {
        id: 2,
        text: "Chúc ông bà luôn mạnh khỏe và vui vẻ ạ!",
        tone: "respectful"
    },
    {
        id: 3,
        text: "Con chúc ông bà năm mới nhiều sức khỏe ạ!",
        tone: "new-year"
    },
    {
        id: 4,
        text: "Con chúc ông bà luôn bình an và hạnh phúc ạ!",
        tone: "gentle"
    },
    {
        id: 5,
        text: "Con chúc ông bà lúc nào cũng cười thật tươi ạ!",
        tone: "cute"
    },
    {
        id: 6,
        text: "Con chúc ông bà năm mới gặp nhiều may mắn ạ!",
        tone: "new-year"
    }
];

const sounds = {
    hapi: new Audio('./assets/sounds/hapi.mp3'),
};


const state = {
    queue: new Queue(),
    received: [],
    isRunning: false,
    stats: { total: 0, given: 0 }
};

// DOM Elements Cache
const elements = {
    numSlider: document.getElementById('numSlider'),
    numLabel: document.getElementById('numLabel'),
    giveOneBtn: document.getElementById('giveOneBtn'),
    giveAllBtn: document.getElementById('giveAllBtn'),
    resetBtn: document.getElementById('resetBtn'),

    waitingLine: document.getElementById('waitingLine'),
    receivedList: document.getElementById('receivedList'),
    completionMsg: document.getElementById('completionMessage'),
    room: document.getElementById('room'),
    elderImg: document.getElementById('elderImg'),

    progressBar: document.getElementById('progressBar'),
    statTotal: document.getElementById('statTotal'),
    statGiven: document.getElementById('statGiven'),
    statWaiting: document.getElementById('statWaiting'),

    characterTemplate: document.getElementById('characterTemplate'),
    completionTemplate: document.getElementById('completionTemplate'),
};

const getImageUrl = (filename) => `${CONFIG.IMAGES_PATH}/${filename}`;
const getSoundUrl = (filename) => `${CONFIG.SOUNDS_PATH}/${filename}`;

const UI = {
    createCharacterNode(char, isReceived) {
        const clone = elements.characterTemplate.content.cloneNode(true);

        const img = clone.querySelector('.char-img');
        const nameDiv = clone.querySelector('.character-name');

        const imgPath = getImageUrl(isReceived ? char.lixi : char.idle);
        const placeholder = isReceived ? CONFIG.PLACEHOLDER_LIXI : CONFIG.PLACEHOLDER_IDLE;

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
        elements.numSlider.disabled = state.isRunning || state.stats.given > 0;
    },

    showCompletionMessage() {
        elements.completionMsg.innerHTML = '';

        if (state.queue.isEmpty() && !state.isRunning && state.stats.given > 0) {
            const clone = elements.completionTemplate.content.cloneNode(true);
            clone.querySelector('.final-count').textContent = state.stats.given;
            elements.completionMsg.appendChild(clone);
        }
    },

    async enqueueWithAnimation(num) {
        state.queue.clear();
        elements.waitingLine.innerHTML = '';
        state.isRunning = true;
        UI.updateButtons();
        const chars = CHARACTERS_DB.slice(0, num);

        for (const char of chars) {
            state.queue.enqueue({ ...char, hasLixi: false });
            await UI.animateEnqueue(char);
            await wait(50);
        }
        state.isRunning = false;
        UI.updateButtons();
    },

    async animateEnqueue(char) {
        const node = UI.createCharacterNode(char, false);
        const el = node.querySelector('.character');

        elements.waitingLine.prepend(node);

        // force reflow để browser ghi nhận vị trí ban đầu
        el.getBoundingClientRect();
        const ITEM_OFFSET = 40;

        await el.animate(
            [
                { transform: `translateX(-${ITEM_OFFSET}px)`, opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ],
            {
                duration: 400,
                easing: CONFIG.EASING_CUBIC_BEZIER,
                fill: 'forwards'
            }
        ).finished;
    },

    renderReceivedList() {
        elements.receivedList.innerHTML = '';
        state.received.forEach(char => {
            const charNode = this.createCharacterNode(char, true);
            elements.receivedList.appendChild(charNode);
        });
    },

    moveToWish(el) {
        return el.animate(
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(70px)' }
            ],
            {
                duration: 500,
                easing: CONFIG.EASING_CUBIC_BEZIER,
                fill: 'forwards'
            }
        ).finished;
    },

    moveToLixi(el) {
        return el.animate(
            [
                { transform: 'translateX(70px)' },
                { transform: 'translateX(100px)' }
            ],
            {
                duration: 300,
                easing: 'ease-in',
                fill: 'forwards'
            }
        ).finished;
    },

    bounce(el) {
        sounds.hapi.play();
        return el.animate(
            [
                { transform: 'translateY(0)' },
                { transform: 'translateY(-20px)' },
                { transform: 'translateY(0)' }
            ],
            {
                duration: 300,
                easing: 'ease-out',
                iterations: 2,
                composite: 'add'
            }
        ).finished;
    },

    shiftQueue(el) {
        const ITEM_OFFSET = 110;

        return elements.waitingLine.animate(
            [
                { transform: `translateX(-${ITEM_OFFSET}px)` },
                { transform: 'translateX(0)' }
            ],
            {
                duration: 800,
                easing: CONFIG.EASING_CUBIC_BEZIER,
                fill: 'forwards'
            }
        ).finished;
    }
};

async function init() {
    const num = parseInt(elements.numSlider.value);
    state.queue.clear();
    state.received = [];
    state.isRunning = false;
    state.stats = { total: num, given: 0 };

    CHARACTERS_DB.slice(0, num).forEach(char => {
        state.queue.enqueue({ ...char, hasLixi: false });
    });

    elements.numLabel.textContent = num;
    elements.room.style.backgroundImage = `url(${getImageUrl('room.jpg')})`;
    elements.elderImg.src = getImageUrl('elder.png');
    elements.completionMsg.innerHTML = '';

    UI.renderReceivedList();
    UI.updateStats();
    UI.updateButtons();
    await UI.enqueueWithAnimation(num);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function giveLixi() {
    if (state.queue.isEmpty() || state.isRunning) return;

    state.isRunning = true;
    UI.updateButtons();

    const chars = elements.waitingLine.querySelectorAll('.character');
    const first = chars[chars.length - 1];
    if (!first) return;

    //Animation
    const wish = WISHES_DB[Math.floor(Math.random() * WISHES_DB.length)];
    const child = { ...state.queue.dequeue(), wish };
    const wishEl = first.querySelector('.wish-bubble');

    await UI.moveToWish(first);

    wishEl.textContent = wish.text;
    first.classList.add('show-wish');
    await wait(CONFIG.WISH_DURATION);
    first.classList.remove('show-wish');

    await UI.moveToLixi(first);

    wishEl.textContent = 'Con cảm ơn ông bà ạ!';
    first.classList.add('show-wish');
    first.classList.add('show-lixi');
    await wait(CONFIG.LIXI_DURATION);
    first.classList.remove('show-wish');
    first.classList.remove('show-lixi');

    await UI.bounce(first);
    await wait(CONFIG.BOUNCE_DURATION);

    // rời đi
    first.remove();
    await UI.shiftQueue(elements.waitingLine);

    state.received.push({ ...child, hasLixi: true });
    const charNode = UI.createCharacterNode(child, true);
    elements.receivedList.appendChild(charNode);
    state.stats.given++;
    state.isRunning = false;

    UI.updateStats();
    UI.updateButtons();

    if (state.queue.isEmpty())
        UI.showCompletionMessage();
}

async function giveAll() {
    while (!state.queue.isEmpty()) {
        await giveLixi();
        await wait(CONFIG.NEXT_DELAY);
    }
}

function setupEventListeners() {
    elements.numSlider.addEventListener('input', (e) => {
        elements.numLabel.textContent = e.target.value;
    });
    elements.numSlider.addEventListener('change', async () => {
        await init();
    });

    elements.giveOneBtn.addEventListener('click', giveLixi);
    elements.giveAllBtn.addEventListener('click', giveAll);
    elements.resetBtn.addEventListener('click', init);
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    init();
});

Object.values(sounds).forEach(a => {
    a.preload = 'auto';
});