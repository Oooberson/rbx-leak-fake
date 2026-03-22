let currentUser = null;
let targetUserData = null; // For admin lookup

// 1. Auth & Accounts
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    if (type === 'signup') {
        let user = { user: u, pass: p, balance: 10000, isAdmin: u.toLowerCase().includes('admin') };
        localStorage.setItem(u, user.isAdmin ? "ADMIN_SIG" : JSON.stringify(user));
        // Simple admin hack for this demo:
        if(u === "Owner") user.isAdmin = true;
        localStorage.setItem(u, JSON.stringify(user));
        currentUser = user;
    } else {
        let data = JSON.parse(localStorage.getItem(u));
        if (data && data.pass === p) currentUser = data;
        else return alert("Invalid Credentials");
    }
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    if(currentUser.isAdmin) document.getElementById('admin-nav').style.display = 'inline-block';
    refreshUI();
}

function refreshUI() {
    document.getElementById('display-name').innerText = currentUser.user.toUpperCase();
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
    localStorage.setItem(currentUser.user, JSON.stringify(currentUser));
}

function switchTab(tab) {
    document.getElementById('game-view').style.display = (tab === 'admin') ? 'none' : 'block';
    document.getElementById('admin-view').style.display = (tab === 'admin') ? 'block' : 'none';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

// 2. Admin Logic (Lookup System)
function adminLookup() {
    const name = document.getElementById('target-user').value;
    const data = JSON.parse(localStorage.getItem(name));
    
    if(data) {
        targetUserData = data;
        document.getElementById('lookup-results').style.display = 'block';
        document.getElementById('res-name').innerText = data.user;
        document.getElementById('res-bal').innerText = data.balance.toLocaleString();
    } else {
        alert("User not found in local database.");
    }
}

function adjustFunds(amt) {
    if(!targetUserData) return;
    targetUserData.balance += amt;
    localStorage.setItem(targetUserData.user, JSON.stringify(targetUserData));
    
    // If we edited ourselves, update the top bar
    if(targetUserData.user === currentUser.user) {
        currentUser.balance = targetUserData.balance;
        refreshUI();
    }
    adminLookup(); // Refresh result view
}

// 3. Simple Crash Logic
let crashVal = 1.00;
let crashActive = false;
function playCrash() {
    if(!crashActive) {
        crashActive = true;
        crashVal = 1.00;
        document.getElementById('main-action').innerText = "CASH OUT";
        let timer = setInterval(() => {
            crashVal += 0.01;
            document.getElementById('multiplier').innerText = crashVal.toFixed(2) + "x";
            if(Math.random() < 0.01 && crashActive) { 
                clearInterval(timer); 
                crashActive = false;
                document.getElementById('multiplier').style.color = "red";
                document.getElementById('main-action').innerText = "BET";
            }
        }, 100);
    } else {
        crashActive = false;
        alert("Cashed out!");
        document.getElementById('main-action').innerText = "BET";
    }
}
