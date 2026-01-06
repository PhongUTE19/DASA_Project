// Character Data - SỬA ĐƯỜNG DẪN
const characters = [
    { 
        id: 1, 
        type: 'boy', 
        name: 'Bé Minh', 
        idle: './assets/images/boy-idle.png',    
        lixi: './assets/images/boy-lixi.png'     
    },
    { 
        id: 2, 
        type: 'girl', 
        name: 'Bé Lan', 
        idle: './assets/images/girl-idle.png',   
        lixi: './assets/images/girl-lixi.png'    
    },
    { 
        id: 3, 
        type: 'boy', 
        name: 'Bé Tuấn', 
        idle: './assets/images/boy-idle.png', 
        lixi: './assets/images/boy-lixi.png' 
    },
    { 
        id: 4, 
        type: 'girl', 
        name: 'Bé Hoa', 
        idle: './assets/images/girl-idle.png', 
        lixi: './assets/images/girl-lixi.png' 
    },
    { 
        id: 5, 
        type: 'boy', 
        name: 'Bé Khoa', 
        idle: './assets/images/boy-idle.png', 
        lixi: './assets/images/boy-lixi.png' 
    },
    { 
        id: 6, 
        type: 'girl', 
        name: 'Bé Mai', 
        idle: './assets/images/girl-idle.png', 
        lixi: './assets/images/girl-lixi.png' 
    }
];

// Global State
const queue = new Queue();
let received = [];
let isRunning = false;
let stats = { total: 3, given: 0 };

// DOM Elements
const numChildrenSlider = document.getElementById('numChildren');
const numDisplay = document.getElementById('numDisplay');
const giveOneBtn = document.getElementById('giveOneBtn');
const giveAllBtn = document.getElementById('giveAllBtn');
const resetBtn = document.getElementById('resetBtn');
const queueLine = document.getElementById('queueLine');
const receivedList = document.getElementById('receivedList');
const completionMessage = document.getElementById('completionMessage');
const room = document.getElementById('room');
const elderImg = document.getElementById('elderImg');

// Set room background và hình ông già - SỬA ĐƯỜNG DẪN
function setupImages() {
    room.style.backgroundImage = 'url(./assets/images/room.jpg)';  // Thêm ./
    elderImg.src = './assets/images/elder.png';  // Thêm ./
}

// Initialize
function init() {
    const numChildren = parseInt(numChildrenSlider.value);
    queue.clear();
    received = [];
    isRunning = false;
    stats = { total: numChildren, given: 0 };

    const selected = characters.slice(0, numChildren);
    selected.forEach(char => queue.enqueue({ ...char, hasLixi: false }));

    // Setup images
    setupImages();
    
    renderQueue();
    renderReceived();
    updateStats();
    updateButtons();
    clearCompletionMessage();
}

// Render Queue
function renderQueue() {
    queueLine.innerHTML = '';
    const waiting = queue.getAll();

    if (waiting.length === 0 && !isRunning) {
        queueLine.innerHTML = '<div class="empty-queue">Hàng đợi trống</div>';
        return;
    }

    waiting.forEach((char, index) => {
        const div = document.createElement('div');
        div.className = 'character';
        div.setAttribute('data-id', char.id);
        div.innerHTML = `
            <img src="${char.idle}" alt="${char.name}" onerror="this.src='https://via.placeholder.com/100x150/FFD700/000?text=👦'">
            <div class="character-name">${char.name}</div>
        `;
        queueLine.appendChild(div);
    });
}

// Render Received
function renderReceived() {
    receivedList.innerHTML = '';
    received.forEach(char => {
        const div = document.createElement('div');
        div.className = 'character';
        div.innerHTML = `
            <img src="${char.lixi}" alt="${char.name}" onerror="this.src='https://via.placeholder.com/100x150/FFD700/000?text=🧧'">
            <div class="character-name">${char.name}</div>
        `;
        receivedList.appendChild(div);
    });
}

// Show Completion Message
function showCompletionMessage() {
    if (queue.isEmpty() && !isRunning && stats.given > 0) {
        completionMessage.innerHTML = `
            <div class="completion-message">
                <h2> HOÀN THÀNH </h2>
                <p>Đã phát ${stats.given} lì xì!</p>
            </div>
        `;
    }
}

// Clear Completion Message
function clearCompletionMessage() {
    completionMessage.innerHTML = '';
}

// Update Stats
function updateStats() {
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statGiven').textContent = stats.given;
    document.getElementById('statWaiting').textContent = queue.size();
    
    const percentage = stats.total > 0 ? (stats.given / stats.total) * 100 : 0;
    document.getElementById('progressBar').style.width = percentage + '%';
}

// Update Buttons
function updateButtons() {
    const canOperate = !queue.isEmpty() && !isRunning;
    giveOneBtn.disabled = !canOperate;
    giveAllBtn.disabled = !canOperate;
    resetBtn.disabled = isRunning;
    numChildrenSlider.disabled = isRunning || stats.given > 0;
}

// Give Lixi to One Person
async function giveLixi() {
    if (queue.isEmpty() || isRunning) return;

    isRunning = true;
    updateButtons();

    const child = queue.dequeue();
    
    // 1. Lấy nhân vật đầu tiên từ hàng đợi
    const firstCharacter = queueLine.querySelector('.character');
    if (!firstCharacter) return;
    
    // 2. Di chuyển đến ông già (hiệu ứng nhận lì xì tự động hiện ở 70%)
    firstCharacter.classList.add('moving-to-elder');
    
    // 3. Chờ animation hoàn thành
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Xóa nhân vật khỏi màn hình
    firstCharacter.remove();
    
    // 5. Cập nhật trạng thái
    const childWithLixi = { ...child, hasLixi: true };
    received.push(childWithLixi);
    stats.given++;
    
    // 6. Render lại
    renderQueue();
    renderReceived();
    updateStats();
    
    // 7. Kiểm tra hoàn thành
    isRunning = false;
    updateButtons();
    
    if (queue.isEmpty()) {
        showCompletionMessage();
    }
}

// Give All Automatically
async function giveAll() {
    while (!queue.isEmpty()) {
        await giveLixi();
        if (!queue.isEmpty()) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

// Event Listeners
function setupEventListeners() {
    numChildrenSlider.addEventListener('input', (e) => {
        numDisplay.textContent = e.target.value;
    });

    numChildrenSlider.addEventListener('change', init);
    giveOneBtn.addEventListener('click', giveLixi);
    giveAllBtn.addEventListener('click', giveAll);
    resetBtn.addEventListener('click', init);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    init();
});