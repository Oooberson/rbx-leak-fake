// --- CONFIGURATION & PRE-MADE ACCOUNTS ---
const PRE_MADE_ADMINS = [
    { user: "Owner", pass: "12345", balance: 1000000, isAdmin: true },
    { user: "Admin", pass: "RBX2026", balance: 50000, isAdmin: true }
];

// Initialize system: Load admins into storage if they don't exist
PRE_MADE_ADMINS.forEach(acc => {
    if (!localStorage.getItem(acc.user)) {
        localStorage.setItem(acc.user, JSON.stringify(acc));
    }
});

let currentUser = null;
let gameActive = false;
let godMode = false;
let crashMultiplier = 1.00;
let crashInterval = null;
let minesLocation = [];

// --- AUTHENTICATION SYSTEM ---
function handleAuth(type) {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) return alert("Please enter both username and password.");

    if (type === 'signup') {
        if (localStorage.getItem(user)) return alert("User already exists!");
        
        let newUser = { 
            user: user, 
            pass: pass, 
            balance: 10000, 
            isAdmin: user.toLowerCase().includes("admin") 
        };
        localStorage.setItem(user, JSON.stringify(newUser));
        alert("Account Created! You received 10,000 FAKE Robux.");
        currentUser = newUser;
        loadGame();
    } else {
        let storedData = JSON.parse(localStorage.getItem(user));
        if (storedData && storedData.pass === pass) {
            currentUser = storedData;
            loadGame();
        } else {
            alert("Invalid Username or Password.");
        }
    }
}

function loadGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('display-name').innerText = currentUser.user;
    updateBalanceDisplay();
    
    if (currentUser.isAdmin) {
        document.getElementById('admin-btn').style.display = 'inline-block';
    }
}

function updateBalanceDisplay() {
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
    // Save progress to localStorage
    localStorage.setItem(currentUser.user, JSON.stringify(currentUser));
}

// --- MINES GAME LOGIC ---
function startMines() {
    const bet = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(bet) || bet <= 0) return alert("Enter a valid bet.");
    if (bet > currentUser.balance) return alert("Insufficient Fake Robux!");

    currentUser.balance -= bet;
    updateBalanceDisplay();
    gameActive = true;
    
    // Generate 5 random mine locations
    minesLocation = [];
    while(minesLocation.length < 5) {
        let r = Math.floor(Math.random() * 25);
        if(!minesLocation.includes(r)) minesLocation.push(r);
    }

    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        let tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerText = "?";
        tile.onclick = () => revealTile(tile, i, bet);
        grid.appendChild(tile);
    }
    document.getElementById('cashout-btn').disabled = false;
}

function revealTile(el, index, bet) {
    if (!gameActive || el.classList.contains('safe')) return;

    if (minesLocation.includes(index) && !godMode) {
        el.className = 'tile mine';
        el.innerText = '💣';
        gameActive = false;
        document.getElementById('cashout-btn').disabled = true;
        alert("BOOM! You lost " + bet + " Fake Robux.");
    } else {
        el.className = 'tile safe';
        el.innerText = '💎';
        // Simple logic: Each diamond adds 20% to the bet value
        currentUser.balance += Math.floor(bet * 0.2);
        updateBalanceDisplay();
    }
}

function cashOutMines() {
    gameActive = false;
    document.getElementById('cashout-btn').disabled = true;
    alert("Profit Secured!");
    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '<h3>Game Over - Tiles Reset</h3>';
}

// --- ADMIN PANEL FUNCTIONS ---
function toggleAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}

function addFakeRobux(amt) {
    currentUser.balance += amt;
    updateBalanceDisplay();
    alert(`Added ${amt} Fake Robux to your account!`);
}

function toggleGodMode() {
    godMode = !godMode;
    const status = document.getElementById('god-status');
    status.innerText = godMode ? "ON" : "OFF";
    status.style.color = godMode ? "#00ff44" : "#ff4444";
}

function adminBanOther(targetName) {
    if (targetName === currentUser.user) return alert("You can't ban yourself!");
    localStorage.removeItem(targetName);
    alert(`User ${targetName} has been banned.`);
}

function logout() {
    location.reload();
}
