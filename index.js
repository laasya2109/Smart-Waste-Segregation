/* ==========================================
   EcoStation - Core Client Manager (index.js)
   ========================================== */

// Shared Global App State
let currentUser = null;
let activeTab = 'panel-dashboard';
let selectedFile = null;

// Leaflet Map & Chart References
let leafletMap = null;
let mapMarkers = [];
let distributionChart = null;
let ecoImpactChart = null;

// Map Search & Location State
let currentMapCoords = null;
let locationMode = "gps"; // "gps" or "demo"
let lastScannedItemName = "Battery"; // Default to Battery for quick smart demo
let mapSelectedCategory = "";
let scanHistoryData = [];
let streamTracks = null; // webcam tracks stream reference

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// --- Initialize Application ---
function initApp() {
    setupDateTime();
    setupEventListeners();
    checkSession();
}

// --- Set Date in Header ---
function setupDateTime() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const today = new Date();
    const headerDateEl = document.getElementById('header-date');
    if (headerDateEl) {
        headerDateEl.innerText = today.toLocaleDateString('en-US', options);
    }
}

// --- Setup Nav and Form Events ---
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            navigateToTab(tabId);
        });
    });

    // Toggle forms
    document.getElementById('to-register').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthCard('register');
    });

    document.getElementById('to-login').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthCard('login');
    });

    // Segmented tabs switching
    const tabSignupLogin = document.getElementById('tab-signup-btn-login');
    const tabSigninRegister = document.getElementById('tab-signin-btn-register');
    if (tabSignupLogin) {
        tabSignupLogin.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthCard('register');
        });
    }
    if (tabSigninRegister) {
        tabSigninRegister.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthCard('login');
        });
    }

    // Landing page Get Started / Scan Waste buttons
    document.querySelectorAll('.btn-get-started, .btn-get-started-hero, .btn-scan-waste-hero').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthView();
        });
    });

    // Logo click redirect to home (landing page)
    document.querySelectorAll('.landing-logo, .brand-logo-icon, .brand-name').forEach(logo => {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUser) {
                showLandingPage();
            }
        });
    });

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Image Classification dropzone setup
    setupDropzone();

    // EcoBot Chatbot setup
    setupChatBot();

    // Top header "New Scan" button handler
    const topNewScanBtn = document.getElementById('btn-new-scan-top');
    if (topNewScanBtn) {
        topNewScanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToTab('panel-classify');
        });
    }

    // Dashboard Quick Actions card handler
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = card.getAttribute('data-tab');
            if (tabId) {
                navigateToTab(tabId);
            }
        });
    });

    // History search and filter setup
    const historySearchInput = document.getElementById('history-search-input');
    if (historySearchInput) {
        historySearchInput.addEventListener('input', () => {
            renderHistoryCards();
        });
    }

    const historyChips = document.querySelectorAll('.history-filter-chips .chip');
    historyChips.forEach(chip => {
        chip.addEventListener('click', () => {
            historyChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            renderHistoryCards();
        });
    });
}

// --- View Navigation ---
function navigateToTab(tabId) {
    activeTab = tabId;

    // Toggle menu highlights
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Toggle views
    document.querySelectorAll('.content-panel').forEach(panel => {
        if (panel.id === tabId) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });

    // Header title mapping
    const titleMap = {
        'panel-dashboard': 'Your Impact',
        'panel-classify': 'Scan Waste',
        'panel-nlp': 'EcoBot Assistant',
        'panel-map': 'Recycling Map',
        'panel-history': 'History',
        'panel-play': 'Eco Play'
    };
    const subtitleMap = {
        'panel-dashboard': 'Track scans, categories, and weekly activity at a glance.',
        'panel-classify': 'Upload an image of a waste item for instant segregation analysis.',
        'panel-nlp': 'Ask me any queries about waste, recycling, or composting.',
        'panel-map': 'Find drop-off locations and recycling centers near you.',
        'panel-history': 'Review all your previous scans and environmental contributions.',
        'panel-play': 'Test your sorting speed and knowledge with a drag-and-drop game.'
    };
    document.getElementById('view-title').innerText = titleMap[tabId] || 'EcoStation';
    document.getElementById('view-subtitle').innerText = subtitleMap[tabId] || '';

    // Show/Hide top header actions button based on tab
    const topScanBtn = document.getElementById('btn-new-scan-top');
    if (topScanBtn) {
        if (tabId === 'panel-dashboard') {
            topScanBtn.style.display = 'flex';
        } else {
            topScanBtn.style.display = 'none';
        }
    }

    // Panel-specific triggers
    if (tabId === 'panel-dashboard') {
        loadDashboardStats();
    } else if (tabId === 'panel-history') {
        loadScanHistory();
    } else if (tabId === 'panel-map') {
        setTimeout(initializeMap, 100);
    } else if (tabId === 'panel-play') {
        if (typeof resetGame === "function") resetGame();
    } else if (tabId === 'panel-classify') {
        if (typeof adjustViewportImageSize === "function") {
            setTimeout(adjustViewportImageSize, 50);
        }
    }
}

// --- Toast Notification Trigger ---
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    toastMsg.innerText = message;
    toast.className = `toast ${type}`;

    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else {
        toastIcon.className = 'fas fa-info-circle';
    }

    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
