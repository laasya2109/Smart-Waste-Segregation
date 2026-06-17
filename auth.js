/* ==========================================
   EcoStation - Authentication Module (auth.js)
   ========================================== */

// --- Check Session on Load ---
function checkSession() {
    // Clear any previous session so the user starts at the landing page,
    // goes to the login screen, and then logs in to access the dashboard.
    localStorage.removeItem('ecostation_user');
    currentUser = null;
    showLandingPage();
}

// --- Toggle Authentication Forms ---
function toggleAuthCard(view) {
    if (view === 'register') {
        document.getElementById('login-card').classList.add('hidden');
        document.getElementById('register-card').classList.remove('hidden');
    } else {
        document.getElementById('register-card').classList.add('hidden');
        document.getElementById('login-card').classList.remove('hidden');
    }
}

// --- Show Auth View / Hide App ---
function showAuthView() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

// --- Show Landing Page ---
function showLandingPage() {
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

// --- Login Handler ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            currentUser = { name: data.name, email: data.email };
            localStorage.setItem('ecostation_user', JSON.stringify(currentUser));
            loginSuccess(currentUser);
            showToast('Login successful', 'success');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Server connection failed', 'error');
    }
}

// --- Signup Handler ---
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showToast('Registration successful! Please login.', 'success');
            toggleAuthCard('login');
            // Clear inputs
            document.getElementById('register-name').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Server connection failed', 'error');
    }
}

// --- Success Redirect ---
function loginSuccess(user) {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // Sidebar User UI
    document.getElementById('user-display-name').innerText = user.name;
    document.getElementById('user-display-email').innerText = user.email;
    document.getElementById('user-initial').innerText = user.name.charAt(0).toUpperCase();

    // Default view
    navigateToTab('panel-dashboard');
}

// --- Logout Handler ---
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('ecostation_user');
    
    // Clear credentials
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    showLandingPage();
    showToast('Logged out successfully', 'success');
}
