// ============================================
// NEVO STICK - AUTHENTICATION SYSTEM
// Google Authentication & Admin Management
// ============================================

// ============================================
// CONFIGURATION CONSTANTS (EASY TO UPDATE)
// ============================================
const CONFIG = {
    SITE_NAME: 'Nevo Stick',
    SUPER_ADMIN_EMAIL: 'Plm159357258456a@gmail.com',
    TELEGRAM_BOT_LINK: '[INSERT YOUR TELEGRAM BOT LINK HERE]',
    STORAGE_PREFIX: 'nevoStick_',
};

// ============================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================
const AUTH_STATE = {
    isAuthenticated: false,
    user: null,
    isSuperAdmin: false,
    siteInitialized: false,
};

// ============================================
// INITIALIZE GOOGLE SIGN-IN
// ============================================
window.onload = function () {
    initializeApp();
};

function initializeApp() {
    // Load configuration from localStorage
    loadConfiguration();

    // Update UI with site name
    updateSiteNameInUI();

    // Check if user is already logged in
    checkAuthenticationStatus();

    // Initialize Google Sign-In
    initializeGoogleSignIn();

    // Setup event listeners
    setupEventListeners();
}

// ============================================
// GOOGLE SIGN-IN INITIALIZATION
// ============================================
function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID_HERE', // Replace with your Google Client ID
        callback: handleSignInResponse,
        auto_select: false,
        itp_support: true,
    });

    // Render sign-in button in modal
    if (document.getElementById('googleSignInButton')) {
        google.accounts.id.renderButton(
            document.getElementById('googleSignInButton'),
            {
                theme: 'outline',
                size: 'large',
                width: '300',
            }
        );
    }
}

// ============================================
// HANDLE SIGN-IN RESPONSE
// ============================================
function handleSignInResponse(response) {
    if (response.credential) {
        // Decode JWT token
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const user = JSON.parse(jsonPayload);
        AUTH_STATE.user = user;
        AUTH_STATE.isAuthenticated = true;
        AUTH_STATE.isSuperAdmin = user.email === CONFIG.SUPER_ADMIN_EMAIL;

        // Check if this is the first admin login
        if (AUTH_STATE.isSuperAdmin && !getStorageData('siteInitialized')) {
            AUTH_STATE.siteInitialized = true;
            setStorageData('siteInitialized', true);
        }

        // Save user data
        setStorageData('user', user);

        // Close modal and show admin dashboard
        document.getElementById('authModal').classList.add('hidden');
        showAdminDashboard();

        console.log('User authenticated:', user.email);
    }
}

// ============================================
// CHECK AUTHENTICATION STATUS
// ============================================
function checkAuthenticationStatus() {
    const storedUser = getStorageData('user');

    if (storedUser) {
        AUTH_STATE.user = storedUser;
        AUTH_STATE.isAuthenticated = true;
        AUTH_STATE.isSuperAdmin = storedUser.email === CONFIG.SUPER_ADMIN_EMAIL;
        AUTH_STATE.siteInitialized = getStorageData('siteInitialized') || false;

        // Show appropriate UI
        updateAuthenticationUI();
    }
}

// ============================================
// UPDATE AUTHENTICATION UI
// ============================================
function updateAuthenticationUI() {
    const authContainer = document.getElementById('authButtonContainer');

    if (AUTH_STATE.isAuthenticated) {
        // User is logged in - show logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'nav-link';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.onclick = handleLogout;
        authContainer.innerHTML = '';
        authContainer.appendChild(logoutBtn);

        // Show admin dashboard for authenticated users
        showAdminDashboard();
    } else {
        // User is not logged in - show login button
        const loginBtn = document.createElement('button');
        loginBtn.textContent = 'Sign In';
        loginBtn.className = 'nav-link';
        loginBtn.style.cursor = 'pointer';
        loginBtn.onclick = showAuthModal;
        authContainer.innerHTML = '';
        authContainer.appendChild(loginBtn);
    }
}

// ============================================
// SHOW AUTHENTICATION MODAL
// ============================================
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    initializeGoogleSignIn();
}

// ============================================
// CLOSE AUTHENTICATION MODAL
// ============================================
function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

// ============================================
// SHOW ADMIN DASHBOARD
// ============================================
function showAdminDashboard() {
    if (!AUTH_STATE.isAuthenticated) return;

    const dashboard = document.getElementById('adminDashboard');
    dashboard.classList.remove('hidden');

    // Update user information
    document.getElementById('userEmail').textContent = AUTH_STATE.user.email;

    // Set admin status
    const adminStatus = document.getElementById('adminStatus');
    if (AUTH_STATE.isSuperAdmin) {
        adminStatus.textContent = '✓ Super Admin - Full Access';
        adminStatus.style.color = 'var(--success-color)';
    } else {
        adminStatus.textContent = '✗ Limited Access - Contact Super Admin';
        adminStatus.style.color = 'var(--error-color)';
    }

    // Populate current config in inputs
    document.getElementById('siteNameInput').value = CONFIG.SITE_NAME;
    document.getElementById('telegramLinkInput').value = CONFIG.TELEGRAM_BOT_LINK;

    // Only allow super admin to edit
    if (!AUTH_STATE.isSuperAdmin) {
        document.getElementById('siteNameInput').disabled = true;
        document.getElementById('telegramLinkInput').disabled = true;
        document.getElementById('saveConfigBtn').disabled = true;
        document.querySelector('.admin-controls').style.opacity = '0.5';
    }
}

// ============================================
// HIDE ADMIN DASHBOARD
// ============================================
function hideAdminDashboard() {
    document.getElementById('adminDashboard').classList.add('hidden');
}

// ============================================
// HANDLE LOGOUT
// ============================================
function handleLogout() {
    google.accounts.id.disableAutoSelect();
    AUTH_STATE.isAuthenticated = false;
    AUTH_STATE.user = null;
    AUTH_STATE.isSuperAdmin = false;
    removeStorageData('user');

    hideAdminDashboard();
    updateAuthenticationUI();

    console.log('User logged out');
}

// ============================================
// SAVE CONFIGURATION
// ============================================
function saveConfiguration() {
    if (!AUTH_STATE.isSuperAdmin) {
        showSaveMessage('Only Super Admin can save configurations', 'error');
        return;
    }

    const newSiteName = document.getElementById('siteNameInput').value.trim();
    const newTelegramLink = document.getElementById('telegramLinkInput').value.trim();

    if (!newSiteName || !newTelegramLink) {
        showSaveMessage('All fields are required', 'error');
        return;
    }

    // Update config
    CONFIG.SITE_NAME = newSiteName;
    CONFIG.TELEGRAM_BOT_LINK = newTelegramLink;

    // Save to localStorage
    setStorageData('config', CONFIG);

    // Update UI
    updateSiteNameInUI();

    showSaveMessage('Configuration saved successfully!', 'success');
    console.log('Configuration updated:', CONFIG);
}

// ============================================
// SHOW SAVE MESSAGE
// ============================================
function showSaveMessage(message, type) {
    const messageElement = document.getElementById('saveMessage');
    messageElement.textContent = message;
    messageElement.className = type;

    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = '';
    }, 3000);
}

// ============================================
// UPDATE SITE NAME IN UI
// ============================================
function updateSiteNameInUI() {
    document.getElementById('siteName').textContent = CONFIG.SITE_NAME;
    document.getElementById('homeTitle').textContent = CONFIG.SITE_NAME;
    document.getElementById('footerSiteName').textContent = CONFIG.SITE_NAME;

    // Update Telegram button
    const telegramBtn = document.getElementById('telegramBtn');
    if (telegramBtn) {
        telegramBtn.href = CONFIG.TELEGRAM_BOT_LINK;
    }
}

// ============================================
// LOCALSTORAGE MANAGEMENT
// ============================================
function setStorageData(key, value) {
    const storageKey = CONFIG.STORAGE_PREFIX + key;
    try {
        localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getStorageData(key) {
    const storageKey = CONFIG.STORAGE_PREFIX + key;
    try {
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

function removeStorageData(key) {
    const storageKey = CONFIG.STORAGE_PREFIX + key;
    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

function loadConfiguration() {
    const savedConfig = getStorageData('config');
    if (savedConfig) {
        Object.assign(CONFIG, savedConfig);
    }
}