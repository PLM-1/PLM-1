let storeData = JSON.parse(localStorage.getItem('nevoStoreData')) || [];
let siteName = localStorage.getItem('nevoSiteName') || "Nevo Stick";

const adminKey = { 
    email: "plm159357258456a@Gmail.com", 
    pass: "19372846Aa#" 
};

// إعدادات التليجرام (يجب على المشتري ملؤها ليعمل البوت)
const tgConfig = {
    token: "", 
    chatId: "" 
};

let activeOrder = null;

function applySettings() {
    document.getElementById('site-logo').innerText = siteName;
    document.getElementById('tab-title').innerText = siteName;
    document.getElementById('welcome-title').innerText = `Welcome to ${siteName}`;
}

function login() {
    let email = document.getElementById('adm-email').value;
    let pass = document.getElementById('adm-pass').value;
    if(email === adminKey.email && pass === adminKey.pass) {
        document.getElementById('admin-controls').style.display = 'block';
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        renderSidebar();
    } else { alert("Login Failed!"); }
}

function updateSiteName() {
    let name = document.getElementById('new-site-name').value;
    if(name) {
        siteName = name;
        localStorage.setItem('nevoSiteName', siteName);
        applySettings();
        alert("Brand Name Updated!");
    }
}

function addSection() {
    let name = document.getElementById('sec-name').value;
    if(name) {
        storeData.push({ id: Date.now(), name: name, products: [] });
        save();
    }
}

function addProduct() {
    let secId = document.getElementById('sec-list').value;
    let p = {
        name: document.getElementById('p-name').value,
        desc: document.getElementById('p-desc').value,
        price: document.getElementById('p-price').value,
        img: document.getElementById('p-img').value
    };
    let sec = storeData.find(s => s.id == secId);
    if(sec) { sec.products.push(p); save(); }
}

function save() {
    localStorage.setItem('nevoStoreData', JSON.stringify(storeData));
    renderSidebar();
}

function renderSidebar() {
    const menu = document.getElementById('sections-menu');
    const select = document.getElementById('sec-list');
    menu.innerHTML = ''; select.innerHTML = '';
    storeData.forEach(sec => {
        menu.innerHTML += `<li onclick="viewCategory(${sec.id})">${sec.name}</li>`;
        select.innerHTML += `<option value="${sec.id}">${sec.name}</option>`;
    });
}

function viewCategory(id) {
    const display = document.getElementById('display-area');
    const cat = storeData.find(c => c.id == id);
    if(!cat) return;
    let html = `<h2>${cat.name}</h2><div class="product-grid">`;
    cat.products.forEach(p => {
        html += `<div class="product-card">
            <img src="${p.img || 'https://via.placeholder.com/150'}">
            <h4>${p.name}</h4>
            <div class="price">${p.price}</div>
            <button onclick="openOrderModal('${cat.name}', '${p.name}', '${p.price}')">Order Request</button>
        </div>`;
    });
    display.innerHTML = html + `</div>`;
}

function openOrderModal(cat, prod, price) {
    activeOrder = { cat, prod, price };
    document.getElementById('order-details').innerText = `Item: ${prod} (${price})`;
    document.getElementById('order-modal').style.display = 'block';
}

function sendOrder() {
    const email = document.getElementById('customer-email').value;
    const qty = document.getElementById('order-qty').value;

    if(!email) { alert("Enter your email"); return; }
    if(!tgConfig.token) { alert("Admin Telegram Bot is not configured yet."); return; }

    const message = `🛒 New Purchase Request!\n\n📧 Client Email: ${email}\n📂 Category: ${activeOrder.cat}\n📦 Product: ${activeOrder.prod}\n💰 Listed Price: ${activeOrder.price}\n🔢 Quantity: ${qty}\n\n⚠️ Contact the client on email to discuss payment and Telegram deal.`;

    fetch(`https://api.telegram.org/bot${tgConfig.token}/sendMessage?chat_id=${tgConfig.chatId}&text=${encodeURIComponent(message)}`)
    .then(() => { alert("Your order request has been sent to the admin. Check your email soon!"); closeModal(); })
    .catch(() => alert("Error. Admin Bot not found."));
}

function closeModal() { document.getElementById('order-modal').style.display = 'none'; }
function logout() { location.reload(); }

applySettings();
renderSidebar();
