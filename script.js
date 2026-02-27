import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- FIREBASE CONFIG (Replace with your own) ---
const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_PROJECT.firebaseapp.com", projectId: "YOUR_PROJECT_ID", storageBucket: "YOUR_PROJECT.appspot.com", messagingSenderId: "YOUR_ID", appId: "YOUR_APP_ID" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- OWNER DATA ---
const ADMIN_EMAIL = "Plm159357258456a@gmail.com"; 
const ADMIN_TELEGRAM_ID = "8004368400"; 
const BOT_TOKEN = "YOUR_BOT_TOKEN"; 

// --- LOGIN BUTTON FIX ---
document.getElementById('login-btn').addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(err => console.error("Login failed:", err));
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

// --- AUTH MONITOR ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('user-pic').src = user.photoURL;
        if (user.email === ADMIN_EMAIL) document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    } else {
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});

// --- BRANDING TOOL ---
window.changeSiteName = () => {
    const name = document.getElementById('new-site-name').value;
    if (name) {
        document.getElementById('site-logo').innerText = name;
        document.getElementById('page-title').innerText = name;
        document.getElementById('new-site-name').value = "";
    }
};
document.getElementById('update-name-btn').onclick = window.changeSiteName;

// --- ORDER LOGIC ---
window.processOrder = async (name, price, cat) => {
    const user = auth.currentUser;
    if (!user) return alert("Login with Google first!");

    const customerTelegram = prompt("Enter your Telegram handle or number:");
    if (!customerTelegram) return;

    const qty = document.getElementById(`qty-${name}`).value;
    const orderID = Math.floor(Math.random() * 9000) + 1000;
    const totalPrice = (price * qty).toFixed(2);

    const botMessage = `🚀 <b>NEW ORDER</b>\n\n<b>ID:</b> #${orderID}\n<b>Section:</b> ${cat}\n<b>Item:</b> ${name}\n<b>Price:</b> $${totalPrice}\n\n<b>Customer:</b> ${user.displayName}\n<b>Gmail:</b> ${user.email}\n<b>Contact:</b> ${customerTelegram}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ADMIN_TELEGRAM_ID, text: botMessage, parse_mode: "HTML" })
    });

    logOrderToAdmin(user, name, cat, totalPrice, orderID, customerTelegram);
    alert("Request successful! We will contact you via Telegram soon.");
};

function logOrderToAdmin(user, name, cat, price, id, tel) {
    const table = document.getElementById('order-log-table');
    const row = document.createElement('tr');
    row.className = "border-b border-white/5";
    row.innerHTML = `<td class="p-2">${user.email}</td><td class="p-2">${name} (#${id})</td><td class="p-2">${cat}</td><td class="p-2">$${price}</td><td class="p-2"><b>${tel}</b></td><td class="p-2"><span class="status-pending" id="st-${id}">Pending</span></td><td class="p-2"><button onclick="markDone('${id}')" class="text-green-500 mr-2"><i class="fas fa-check"></i></button><button onclick="this.closest('tr').remove()" class="text-red-500"><i class="fas fa-trash"></i></button></td>`;
    table.prepend(row);
}

window.markDone = (id) => {
    const el = document.getElementById(`st-${id}`);
    el.innerText = "Completed";
    el.className = "status-completed";
};

// --- PRODUCT MANAGEMENT ---
window.uploadProduct = async () => {
    const name = document.getElementById('prod-name').value;
    const cat = document.getElementById('prod-category').value;
    const price = document.getElementById('prod-price').value;
    const file = document.getElementById('prod-img').files[0];

    if (!name || !file) return alert("Missing data.");

    const compressed = await imageCompression(file, { maxSizeMB: 0.1, maxWidthOrHeight: 800 });
    const reader = new FileReader();
    reader.readAsDataURL(compressed);
    reader.onloadend = () => {
        const grid = document.getElementById('product-grid');
        const card = document.createElement('div');
        card.className = "glass p-4 rounded-xl relative group fade-in";
        card.innerHTML = `<button class="admin-only absolute top-2 right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px]" onclick="this.parentElement.remove()">X</button><img src="${reader.result}" class="w-full h-32 object-cover rounded-lg mb-3"><p class="text-[10px] text-blue-400 font-bold uppercase">${cat}</p><h4 class="font-bold text-sm">${name}</h4><div class="flex items-center justify-between mt-3 mb-3"><span class="text-green-400 font-bold">$${price}</span><input type="number" id="qty-${name}" value="1" min="1" class="w-10 bg-slate-900 border border-slate-700 rounded text-[10px] text-center"></div><button onclick="processOrder('${name}', '${price}', '${cat}')" class="w-full bg-blue-600 py-2 rounded text-[10px] font-bold uppercase">Order Now</button>`;
        grid.appendChild(card);
    };
};
document.getElementById('add-prod-btn').onclick = window.uploadProduct;

// --- DEATH PROTOCOL ---
window.triggerDeath = () => {
    if(confirm("Permanently wipe all owner data?")) {
        document.body.innerHTML = `<div class='h-screen flex flex-col items-center justify-center text-red-700'><i class='fas fa-skull text-8xl mb-4'></i><p class='text-2xl font-black'>DATA WASHED AWAY</p></div>`;
        auth.signOut();
        localStorage.clear();
    }
};
document.getElementById('death-btn').onclick = window.triggerDeath;

window.addNewSection = () => {
    const title = document.getElementById('section-name').value;
    const main = document.getElementById('main-content');
    const div = document.createElement('div');
    div.className = "mb-12 pt-8 border-t border-white/5 fade-in";
    div.innerHTML = `<div class='flex justify-between'><h3 class='text-2xl font-bold mb-6'>${title}</h3><button class='admin-only text-red-500' onclick='this.parentElement.parentElement.remove()'>X</button></div><div class='grid grid-cols-2 md:grid-cols-4 gap-6'></div>`;
    main.appendChild(div);
};
document.getElementById('add-section-btn').onclick = window.addNewSection;
