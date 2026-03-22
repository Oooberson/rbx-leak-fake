let currentUser = null, targetUserObj = null, infLuck = false, crashActive = false, crashVal = 1.0, crashInt;

// Init Owners
if(!localStorage.getItem("Owner")) localStorage.setItem("Owner", JSON.stringify({user:"Owner", pass:"12345", balance:5000000, isAdmin:true}));

function handleAuth(type) {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    if(type === 'signup') {
        let data = {user:u, pass:p, balance:10000, isAdmin:u.toLowerCase().includes('admin')};
        localStorage.setItem(u, JSON.stringify(data));
        currentUser = data;
    } else {
        let data = JSON.parse(localStorage.getItem(u));
        if(data && data.pass === p) currentUser = data; else return alert("Auth Failed");
    }
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    if(currentUser.isAdmin) document.getElementById('admin-nav-btn').style.display = 'inline-block';
    sync();
}

function sync() {
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
    document.getElementById('display-name').innerText = currentUser.user.toUpperCase();
    localStorage.setItem(currentUser.user, JSON.stringify(currentUser));
}

function switchTab(t) {
    document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-view').style.display = 'block';
    event.currentTarget.classList.add('active');
    if(t === 'leaderboard') loadLeaderboard();
}

// GAMES 
function handleCrashLogic() {
    const btn = document.getElementById('crash-action-btn'), disp = document.getElementById('multiplier-display'), bet = parseInt(document.getElementById('crash-bet').value);
    if(!crashActive) {
        if(bet > currentUser.balance) return;
        currentUser.balance -= bet; sync(); crashActive = true; crashVal = 1.0; disp.style.color = "white";
        let boom = infLuck ? 999 : (Math.random() * 4 + 1.2);
        crashInt = setInterval(() => {
            crashVal += 0.01; disp.innerText = crashVal.toFixed(2) + "x";
            if(crashVal >= boom) { clearInterval(crashInt); crashActive = false; disp.style.color = "red"; }
        }, 100);
    } else {
        clearInterval(crashInt); crashActive = false;
        currentUser.balance += Math.floor(bet * crashVal); sync(); alert("Win!");
    }
}

function playDouble(color) {
    const bet = parseInt(document.getElementById('double-bet').value);
    if(bet > currentUser.balance) return;
    currentUser.balance -= bet;
    let res = Math.floor(Math.random() * 15);
    let winColor = res === 0 ? 'green' : (res % 2 === 0 ? 'black' : 'red');
    document.getElementById('double-wheel').innerText = res;
    document.getElementById('double-wheel').style.borderColor = winColor;
    if(color === winColor) {
        let mult = (winColor === 'green' ? 14 : 2);
        currentUser.balance += (bet * mult);
        alert("Double Win!");
    }
    sync();
}

function startMines() {
    const grid = document.getElementById('mines-grid'), bet = parseInt(document.getElementById('mines-bet').value);
    if(bet > currentUser.balance) return;
    currentUser.balance -= bet; sync(); grid.innerHTML = '';
    let mines = infLuck ? [] : Array.from({length:5}, () => Math.floor(Math.random()*25));
    for(let i=0; i<25; i++) {
        let t = document.createElement('div'); t.className = 'tile';
        t.onclick = () => {
            if(mines.includes(i)) { t.style.background = "red"; startMines(); }
            else { t.style.background = "#1fd65f"; currentUser.balance += Math.floor(bet*0.1); sync(); }
        };
        grid.appendChild(t);
    }
}

// LEADERBOARD
function loadLeaderboard() {
    let users = [];
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        try { let u = JSON.parse(localStorage.getItem(key)); if(u.balance) users.push(u); } catch(e){}
    }
    users.sort((a,b) => b.balance - a.balance);
    let html = users.slice(0, 10).map((u, i) => `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #222;"><span>#${i+1} ${u.user}</span> <span>${u.balance.toLocaleString()} R$</span></div>`).join('');
    document.getElementById('lb-content').innerHTML = html;
}

// ADMIN
function adminLookupUser() {
    targetUserObj = JSON.parse(localStorage.getItem(document.getElementById('target-username').value));
    if(targetUserObj) {
        document.getElementById('lookup-results').style.display = 'block';
        document.getElementById('res-name').innerText = targetUserObj.user;
        document.getElementById('res-bal').innerText = targetUserObj.balance.toLocaleString();
    }
}
function modifyUserFunds(add) {
    let a = parseInt(document.getElementById('admin-amount').value);
    targetUserObj.balance += add ? a : -a;
    localStorage.setItem(targetUserObj.user, JSON.stringify(targetUserObj));
    if(targetUserObj.user === currentUser.user) { currentUser.balance = targetUserObj.balance; sync(); }
    adminLookupUser();
}
function toggleInfLuck() { infLuck = !infLuck; document.getElementById('luck-status').innerText = infLuck ? "GOD MODE ON" : "OFF"; }
