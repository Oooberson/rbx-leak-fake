let currentUser = null;
let godMode = false;

// Pre-made Admin Accounts
const admins = [{user: "Owner", pass: "12345", bal: 1000000, admin: true}];
admins.forEach(a => { if(!localStorage.getItem(a.user)) localStorage.setItem(a.user, JSON.stringify({user:a.user, pass:a.pass, balance:a.bal, isAdmin:a.admin})); });

// Auth
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(type === 'signup') {
        let data = {user: u, pass: p, balance: 10000, isAdmin: u.toLowerCase().includes('admin')};
        localStorage.setItem(u, JSON.stringify(data));
        currentUser = data;
    } else {
        let data = JSON.parse(localStorage.getItem(u));
        if(data && data.pass === p) currentUser = data;
        else return alert("Invalid Login");
    }
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    updateUI();
}

function updateUI() {
    document.getElementById('display-name').innerText = currentUser.user;
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
    if(currentUser.isAdmin) document.getElementById('admin-btn').style.display = 'inline-block';
    localStorage.setItem(currentUser.user, JSON.stringify(currentUser));
}

function switchTab(game) {
    document.querySelectorAll('.game-module').forEach(m => m.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(game + '-game').style.display = 'flex';
    event.target.classList.add('active');
}

// --- CRASH GAME ENGINE ---
let crashRunning = false;
let multiplier = 1.00;
let crashTimer;

function handleCrashAction() {
    const btn = document.getElementById('crash-control');
    const bet = parseInt(document.getElementById('crash-bet').value);

    if(!crashRunning) {
        if(bet > currentUser.balance) return alert("Not enough R$");
        currentUser.balance -= bet;
        updateUI();
        crashRunning = true;
        multiplier = 1.00;
        btn.innerText = "CASH OUT";
        btn.style.background = "orange";
        
        let crashAt = (Math.random() * 5 + 1).toFixed(2);
        if(godMode) crashAt = 999; 

        crashTimer = setInterval(() => {
            multiplier += 0.01;
            document.getElementById('multiplier-text').innerText = multiplier.toFixed(2) + "x";
            if(multiplier >= crashAt) {
                clearInterval(crashTimer);
                crashRunning = false;
                document.getElementById('multiplier-text').style.color = "red";
                btn.innerText = "BET";
                btn.style.background = "var(--green)";
                setTimeout(() => document.getElementById('multiplier-text').style.color = "white", 2000);
            }
        }, 100);
    } else {
        clearInterval(crashTimer);
        let win = Math.floor(bet * multiplier);
        currentUser.balance += win;
        alert("Won " + win + " R$!");
        crashRunning = false;
        btn.innerText = "BET";
        btn.style.background = "var(--green)";
        updateUI();
    }
}

// --- MINES ENGINE ---
let mineLocations = [];
function startMines() {
    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '';
    mineLocations = Array.from({length: 5}, () => Math.floor(Math.random() * 25));
    for(let i=0; i<25; i++) {
        let t = document.createElement('div');
        t.className = 'tile';
        t.onclick = () => {
            if(mineLocations.includes(i) && !godMode) { t.classList.add('mine'); t.innerText = "💣"; alert("LOSE"); startMines(); }
            else { t.classList.add('safe'); t.innerText = "💎"; currentUser.balance += 100; updateUI(); }
        };
        grid.appendChild(t);
    }
    document.getElementById('mines-cashout').disabled = false;
}

// --- ADMIN STUFF ---
function toggleAdmin() {
    const m = document.getElementById('admin-panel');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}
function adjustBalance(n) { currentUser.balance += n; updateUI(); }
function toggleGodMode() {
    godMode = !godMode;
    document.getElementById('god-status').innerText = godMode ? "ON" : "OFF";
}
