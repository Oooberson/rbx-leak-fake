let currentUser = null;
let minesLocation = [];
let gameActive = false;
let godMode = false;

function handleAuth(type) {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (!user || !pass) return alert("Fill fields!");

    if (type === 'signup') {
        let userData = { user, pass, balance: 10000, isAdmin: user.toLowerCase().includes("admin") };
        localStorage.setItem(user, JSON.stringify(userData));
        alert("Account Created! 10k FAKE Robux added.");
    } else {
        let data = JSON.parse(localStorage.getItem(user));
        if (data && data.pass === pass) {
            currentUser = data;
            loadGame();
        } else { alert("Wrong login!"); }
    }
}

function loadGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('display-name').innerText = currentUser.user;
    updateBalance();
    if (currentUser.isAdmin) document.getElementById('admin-btn').style.display = 'inline';
}

function updateBalance() {
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
}

// --- MINES GAME LOGIC ---
function startMines() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (bet > currentUser.balance) return alert("Not enough fake R$!");
    
    currentUser.balance -= bet;
    updateBalance();
    gameActive = true;
    minesLocation = Array.from({length: 5}, () => Math.floor(Math.random() * 25));
    
    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        let tile = document.createElement('div');
        tile.className = 'tile';
        tile.onclick = () => revealTile(tile, i);
        grid.appendChild(tile);
    }
    document.getElementById('cashout-btn').disabled = false;
}

function revealTile(el, index) {
    if (!gameActive) return;
    if (minesLocation.includes(index) && !godMode) {
        el.className = 'tile mine';
        el.innerText = '💣';
        gameActive = false;
        alert("CRASHED! You lost your bet.");
    } else {
        el.className = 'tile safe';
        el.innerText = '💎';
        // Logic for multiplier increase would go here
    }
}

// --- ADMIN FEATURES ---
function toggleAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function addFakeRobux(amt) {
    currentUser.balance += amt;
    updateBalance();
}

function toggleGodMode() {
    godMode = !godMode;
    document.getElementById('god-status').innerText = godMode ? "ON" : "OFF";
    document.getElementById('god-status').style.color = godMode ? "lime" : "red";
}

function logout() { location.reload(); }
