let currentUser = null;
let targetUserObj = null; // For the admin lookup
let crashActive = false;
let crashValue = 1.00;
let crashInterval;

// Pre-set Owner account
if(!localStorage.getItem("Owner")) {
    localStorage.setItem("Owner", JSON.stringify({user: "Owner", pass: "12345", balance: 500000, isAdmin: true}));
}

// 1. AUTHENTICATION
function handleAuth(type) {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!u || !p) return alert("Enter credentials");

    if(type === 'signup') {
        if(localStorage.getItem(u)) return alert("User exists");
        let newUser = { user: u, pass: p, balance: 10000, isAdmin: u.toLowerCase().includes('admin') };
        localStorage.setItem(u, JSON.stringify(newUser));
        currentUser = newUser;
    } else {
        let data = JSON.parse(localStorage.getItem(u));
        if(data && data.pass === p) currentUser = data;
        else return alert("Wrong login");
    }

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    if(currentUser.isAdmin) document.getElementById('admin-nav-btn').style.display = 'inline-block';
    syncUI();
}

function syncUI() {
    document.getElementById('display-name').innerText = currentUser.user;
    document.getElementById('balance').innerText = currentUser.balance.toLocaleString();
    localStorage.setItem(currentUser.user, JSON.stringify(currentUser));
}

// 2. NAVIGATION
function switchTab(tab) {
    document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tab + '-view').style.display = 'block';
    // Find the button that was clicked to set it active
    event.currentTarget.classList.add('active');
}

// 3. CRASH GAME
function handleCrashLogic() {
    const btn = document.getElementById('crash-action-btn');
    const display = document.getElementById('multiplier-display');
    const bet = parseInt(document.getElementById('crash-bet').value);

    if(!crashActive) {
        if(bet > currentUser.balance) return alert("Not enough R$");
        currentUser.balance -= bet;
        syncUI();
        
        crashActive = true;
        crashValue = 1.00;
        btn.innerText = "CASH OUT";
        btn.style.background = "orange";
        display.style.color = "white";

        let crashAt = (Math.random() * 4 + 1.1).toFixed(2); // Random crash point

        crashInterval = setInterval(() => {
            crashValue += 0.01;
            display.innerText = crashValue.toFixed(2) + "x";

            if(crashValue >= crashAt) {
                clearInterval(crashInterval);
                crashActive = false;
                display.style.color = "#ff4d4d";
                display.innerText = "CRASHED @ " + crashValue.toFixed(2) + "x";
                btn.innerText = "BET";
                btn.style.background = ""; 
            }
        }, 100);
    } else {
        // CASH OUT
        clearInterval(crashInterval);
        crashActive = false;
        let win = Math.floor(bet * crashValue);
        currentUser.balance += win;
        alert("Success! You won " + win + " R$");
        btn.innerText = "BET";
        btn.style.background = "";
        syncUI();
    }
}

// 4. ADMIN PANEL LOOKUP
function adminLookupUser() {
    const searchName = document.getElementById('target-username').value.trim();
    const data = JSON.parse(localStorage.getItem(searchName));

    if(data) {
        targetUserObj = data;
        document.getElementById('lookup-results').style.display = 'block';
        document.getElementById('res-name').innerText = data.user;
        document.getElementById('res-bal').innerText = data.balance.toLocaleString();
    } else {
        alert("User not found!");
    }
}

function modifyUserFunds(amt) {
    if(!targetUserObj) return;
    targetUserObj.balance += amt;
    localStorage.setItem(targetUserObj.user, JSON.stringify(targetUserObj));
    
    // Refresh the lookup view
    document.getElementById('res-bal').innerText = targetUserObj.balance.toLocaleString();
    
    // If you are editing yourself, update your main balance
    if(targetUserObj.user === currentUser.user) {
        currentUser.balance = targetUserObj.balance;
        syncUI();
    }
}
