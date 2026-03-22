let currentUser = null, targetUserObj = null, infLuck = false, crashActive = false, crashVal = 1.0, crashInt;

// Default Admin
if(!localStorage.getItem("Owner")) localStorage.setItem("Owner", JSON.stringify({user:"Owner", pass:"12345", balance:1000000, isAdmin:true}));

function handleAuth(type) {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    if(type === 'signup') {
        let data = {user:u, pass:p, balance:10000, isAdmin:u.toLowerCase().includes('admin')};
        localStorage.setItem(u, JSON.stringify(data));
        currentUser = data;
    } else {
        let data = JSON.parse(localStorage.getItem(u));
        if(data && data.pass === p) currentUser = data; else return alert("Fail");
    }
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    if(currentUser.isAdmin) document.getElementById('admin-nav-btn').style.display = 'inline-block';
    sync();
}

function sync() {
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
    document.getElementById('display-name').innerText = currentUser.user;
    localStorage.setItem(currentUser.user, JSON.stringify(currentUser));
}

function switchTab(t) {
    document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-view').style.display = 'block';
    event.currentTarget.classList.add('active');
}

function handleCrashLogic() {
    const btn = document.getElementById('crash-action-btn'), disp = document.getElementById('multiplier-display'), bet = parseInt(document.getElementById('crash-bet').value);
    if(!crashActive) {
        if(bet > currentUser.balance) return;
        currentUser.balance -= bet; sync();
        crashActive = true; crashVal = 1.0; btn.innerText = "CASH OUT";
        let boom = infLuck ? 999 : (Math.random() * 5 + 1.1);
        crashInt = setInterval(() => {
            crashVal += 0.01; disp.innerText = crashVal.toFixed(2) + "x";
            if(crashVal >= boom) { clearInterval(crashInt); crashActive = false; disp.style.color = "red"; btn.innerText = "BET"; }
        }, 100);
    } else {
        clearInterval(crashInt); crashActive = false;
        currentUser.balance += Math.floor(bet * crashVal);
        btn.innerText = "BET"; sync(); alert("Won!");
    }
}

function playLimbo() {
    const bet = parseInt(document.getElementById('limbo-bet').value), target = parseFloat(document.getElementById('limbo-target').value);
    if(bet > currentUser.balance) return;
    currentUser.balance -= bet;
    let res = infLuck ? target + 1 : (Math.random() * 10);
    document.getElementById('limbo-result').innerText = res.toFixed(2) + "x";
    if(res >= target) currentUser.balance += Math.floor(bet * target);
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
            if(mines.includes(i)) { t.style.background = "red"; alert("Boom"); startMines(); }
            else { t.style.background = "green"; currentUser.balance += (bet*0.1); sync(); }
        };
        grid.appendChild(t);
    }
}

function adminLookupUser() {
    targetUserObj = JSON.parse(localStorage.getItem(document.getElementById('target-username').value));
    if(targetUserObj) {
        document.getElementById('lookup-results').style.display = 'block';
        document.getElementById('res-name').innerText = targetUserObj.user;
        document.getElementById('res-bal').innerText = targetUserObj.balance;
    }
}

function modifyUserFunds(add) {
    let a = parseInt(document.getElementById('admin-amount').value);
    targetUserObj.balance += add ? a : -a;
    localStorage.setItem(targetUserObj.user, JSON.stringify(targetUserObj));
    if(targetUserObj.user === currentUser.user) { currentUser.balance = targetUserObj.balance; sync(); }
    adminLookupUser();
}

function toggleInfLuck() { infLuck = !infLuck; document.getElementById('luck-status').innerText = infLuck ? "INF" : "NORM"; }
