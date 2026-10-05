/* ===== WIN Platform — Core Application Logic ===== */

// ===== AUTH SYSTEM =====
let currentUser = null; // { username, role: 'admin'|'business', businessName }
const ADMIN_CREDS = { username: 'admin', password: '1234' };

const API_URL = 'http://localhost:3000';
let currentBizData = null;

async function getRegisteredUsers() {
    try {
        const res = await fetch(`${API_URL}/api/users`);
        return await res.json();
    } catch (e) {
        console.warn("Backend API not running. Falling back to local database.");
        return JSON.parse(localStorage.getItem('win_users') || '[]');
    }
}

async function saveRegisteredUsers(users) {
    localStorage.setItem('win_users', JSON.stringify(users)); // Always save locally as fallback
    try {
        await fetch(`${API_URL}/api/users`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(users)
        });
    } catch (e) { }
}

async function loadInitialBizData(username) {
    try {
        const res = await fetch(`${API_URL}/api/bizdata/${username}`);
        currentBizData = await res.json();
    } catch (e) {
        const defaults = { revenue: 0, co2: 0, waste: 0, matches: 0, imported: 0, importSavings: 0, importCo2: 0, lat: null, lng: null, activities: [], emissionsTotal: 0, emissionsReduced: 0, carbonCredits: 0, walletBalance: 1500000 };
        const saved = JSON.parse(localStorage.getItem('win_biz_' + username) || '{}');
        currentBizData = { ...defaults, ...saved };
    }
    if (!currentBizData) {
        currentBizData = { revenue: 0, co2: 0, waste: 0, matches: 0, imported: 0, importSavings: 0, importCo2: 0, lat: null, lng: null, activities: [], emissionsTotal: 0, emissionsReduced: 0, carbonCredits: 0, walletBalance: 1500000 };
    } else {
        if (!currentBizData.activities) currentBizData.activities = [];
    }
}

function getBizData(username) {
    return currentBizData;
}

function saveBizData(username, data) {
    currentBizData = data;
    localStorage.setItem('win_biz_' + username, JSON.stringify(data)); // Local fallback
    fetch(`${API_URL}/api/bizdata/${username}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).catch(e => { }); // fire and forget
}

window.addEventListener('load', () => {
    initTheme();
    initAuth();
});

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const paletteBtn = document.getElementById('palette-toggle-btn');
    const themeModal = document.getElementById('theme-customizer-modal');
    const closeBtn = document.getElementById('theme-modal-close');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    
    // Apply saved preferences
    const savedTheme = localStorage.getItem('win_theme') || 'dark';
    const savedAccent = localStorage.getItem('win_accent_color');
    const savedAmbient1 = localStorage.getItem('win_ambient_1');
    const savedAmbient2 = localStorage.getItem('win_ambient_2');
    const root = document.documentElement;

    document.body.className = '';
    if (savedTheme === 'light') { document.body.classList.add('light-theme'); }
    else if (savedTheme === 'ocean') { document.body.classList.add('theme-ocean'); }
    
    if (icon) {
        icon.className = savedTheme === 'light' ? 'fas fa-sun' : 
                         savedTheme === 'ocean' ? 'fas fa-water' : 'fas fa-moon';
    }

    if (savedAccent) {
        root.style.setProperty('--neon-green', savedAccent);
        root.style.setProperty('--glow-green', `0 0 20px ${savedAccent}40`); 
        const colorInput = document.getElementById('custom-accent-color');
        if(colorInput) colorInput.value = savedAccent;
    }

    if (savedAmbient1) {
        root.style.setProperty('--ambient-1', savedAmbient1);
        const amb1 = document.getElementById('ambient-color-1');
        if(amb1) amb1.value = savedAmbient1;
    }
    if (savedAmbient2) {
        root.style.setProperty('--ambient-2', savedAmbient2);
        const amb2 = document.getElementById('ambient-color-2');
        if(amb2) amb2.value = savedAmbient2;
    }

    // Modal UI Handlers
    if (paletteBtn) paletteBtn.addEventListener('click', () => themeModal.classList.remove('hidden'));
    if (closeBtn) closeBtn.addEventListener('click', () => themeModal.classList.add('hidden'));

    // Base Theme Buttons
    const setBaseTheme = (theme) => {
        document.body.className = '';
        if (theme === 'light') document.body.classList.add('light-theme');
        if (theme === 'ocean') document.body.classList.add('theme-ocean');
        localStorage.setItem('win_theme', theme);
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-sun' : theme === 'ocean' ? 'fas fa-water' : 'fas fa-moon';
        }
    };

    document.getElementById('btn-theme-dark')?.addEventListener('click', () => setBaseTheme('dark'));
    document.getElementById('btn-theme-light')?.addEventListener('click', () => setBaseTheme('light'));
    document.getElementById('btn-theme-ocean')?.addEventListener('click', () => setBaseTheme('ocean'));

    // Quick toggle
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = localStorage.getItem('win_theme') || 'dark';
            setBaseTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // Accent Color Input
    const colorInput = document.getElementById('custom-accent-color');
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            root.style.setProperty('--neon-green', hex);
            root.style.setProperty('--glow-green', `0 0 20px ${hex}40`);
            localStorage.setItem('win_accent_color', hex);
        });
    }

    // Ambient Color Inputs
    const ambInput1 = document.getElementById('ambient-color-1');
    const ambInput2 = document.getElementById('ambient-color-2');
    
    if (ambInput1) {
        ambInput1.addEventListener('input', (e) => {
            const hex = e.target.value;
            root.style.setProperty('--ambient-1', hex);
            localStorage.setItem('win_ambient_1', hex);
        });
    }
    if (ambInput2) {
        ambInput2.addEventListener('input', (e) => {
            const hex = e.target.value;
            root.style.setProperty('--ambient-2', hex);
            localStorage.setItem('win_ambient_2', hex);
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-theme-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            setBaseTheme('dark');
            root.style.removeProperty('--neon-green');
            root.style.removeProperty('--glow-green');
            root.style.removeProperty('--ambient-1');
            root.style.removeProperty('--ambient-2');
            localStorage.removeItem('win_accent_color');
            localStorage.removeItem('win_ambient_1');
            localStorage.removeItem('win_ambient_2');
            if(colorInput) colorInput.value = '#00e68a';
            if(ambInput1) ambInput1.value = '#0a0e17';
            if(ambInput2) ambInput2.value = '#0a0e17';
        });
    }
}

function initAuth() {
    const authScreen = document.getElementById('auth-screen');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Tab switching
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active'); tabRegister.classList.remove('active');
        loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
    });
    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active'); tabLogin.classList.remove('active');
        registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
    });

    // LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value.trim();
        const p = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button[type="submit"]');
        const origBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;
        loginError.classList.add('hidden');

        // Check admin
        if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
            currentUser = { username: 'admin', role: 'admin', businessName: 'System Administrator' };
            sessionStorage.setItem('win_session', JSON.stringify(currentUser));
            btn.innerHTML = origBtnText; btn.disabled = false;
            launchApp();
            return;
        }

        // Check mediator
        if (u === 'med' && p === '1234') {
            currentUser = { username: 'med', role: 'mediator', businessName: 'Global Verification Authority' };
            sessionStorage.setItem('win_session', JSON.stringify(currentUser));
            btn.innerHTML = origBtnText; btn.disabled = false;
            launchApp();
            return;
        }

        // Check business users via DB
        const users = await getRegisteredUsers();
        const found = users.find(x => x.username === u && x.password === p);
        if (found) {
            currentUser = { username: found.username, role: 'business', businessName: found.businessName };
            sessionStorage.setItem('win_session', JSON.stringify(currentUser));
            await loadInitialBizData(found.username);
            btn.innerHTML = origBtnText; btn.disabled = false;
            launchApp();
            return;
        }

        btn.innerHTML = origBtnText; btn.disabled = false;
        loginError.textContent = 'Invalid username or password.';
        loginError.classList.remove('hidden');
    });

    // REGISTER
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const biz = document.getElementById('reg-business').value.trim();
        const u = document.getElementById('reg-username').value.trim();
        const p = document.getElementById('reg-password').value;
        const c = document.getElementById('reg-confirm').value;

        const btn = registerForm.querySelector('button[type="submit"]');
        const origBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        btn.disabled = true;
        registerError.classList.add('hidden');

        if (p !== c) {
            registerError.textContent = 'Passwords do not match.'; registerError.classList.remove('hidden');
            btn.innerHTML = origBtnText; btn.disabled = false; return;
        }
        if (u.toLowerCase() === 'admin') {
            registerError.textContent = 'Username "admin" is reserved.'; registerError.classList.remove('hidden');
            btn.innerHTML = origBtnText; btn.disabled = false; return;
        }

        const users = await getRegisteredUsers();
        if (users.find(x => x.username === u)) {
            registerError.textContent = 'Username already taken.'; registerError.classList.remove('hidden');
            btn.innerHTML = origBtnText; btn.disabled = false; return;
        }

        users.push({ username: u, password: p, businessName: biz });
        await saveRegisteredUsers(users);

        // Auto-login
        currentUser = { username: u, role: 'business', businessName: biz };
        sessionStorage.setItem('win_session', JSON.stringify(currentUser));
        await loadInitialBizData(u);

        btn.innerHTML = origBtnText; btn.disabled = false;
        launchApp();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        currentUser = null;
        currentBizData = null;
        sessionStorage.removeItem('win_session');
        sessionStorage.removeItem('win_active_page');
        document.getElementById('app').classList.add('hidden');
        authScreen.classList.remove('hidden');
        loginForm.reset();
        registerForm.reset();
        // Reset business panel state
        document.getElementById('biz-suggestions').classList.add('hidden');
        document.getElementById('biz-results').classList.add('hidden');
        document.getElementById('biz-confirm-btn').style.display = 'none';
        document.getElementById('biz-import-suggestions').classList.add('hidden');
        document.getElementById('biz-import-results').classList.add('hidden');
        document.getElementById('biz-import-confirm-btn').style.display = 'none';
    });

    // Session Persistence Check
    setTimeout(async () => {
        const savedSession = sessionStorage.getItem('win_session');
        if (savedSession) {
            try {
                currentUser = JSON.parse(savedSession);
                if (currentUser.role === 'business') {
                    await loadInitialBizData(currentUser.username);
                }
                launchApp();
            } catch (e) { sessionStorage.removeItem('win_session'); }
        }
    }, 100);
}

function launchApp() {
    const authScreen = document.getElementById('auth-screen');
    authScreen.classList.add('hidden');

    // Show preloader
    const preloader = document.getElementById('preloader');
    preloader.classList.remove('hidden');
    preloader.classList.remove('fade-out');

    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
            document.getElementById('app').classList.remove('hidden');
            setupPanel();
            initApp();

            // Restore active page if applicable
            const savedPage = sessionStorage.getItem('win_active_page');
            if (savedPage) {
                const link = document.querySelector(`.nav-link[data-page="${savedPage}"]`);
                if (link && link.closest('li').style.display !== 'none') {
                    link.click();
                }
            }
        }, 600);
    }, 1800);
}

function setupPanel() {
    const panelLabel = document.getElementById('panel-label');
    const userName = document.getElementById('user-display-name');
    const userRole = document.getElementById('user-display-role');
    const avatar = document.getElementById('user-avatar-initials');
    const sidebar = document.getElementById('sidebar');
    const adminNavItems = sidebar.querySelectorAll('[data-page="dashboard"], [data-page="upload"], [data-page="matching"], [data-page="logistics"], [data-page="impact"], [data-page="city-grid"], [data-page="admin-activity"]');
    const pages = document.querySelectorAll('.page');

    // Hide mediator nav explicitly first
    const medSection = document.getElementById('nav-section-label-mediator');
    const medLink = document.getElementById('nav-item-mediator');
    if(medSection) medSection.style.display = 'none';
    if(medLink) medLink.style.display = 'none';

    if (currentUser.role === 'admin') {
        panelLabel.textContent = 'Admin Panel';
        userName.textContent = 'System Administrator';
        userRole.textContent = 'Level 5 Access';
        avatar.textContent = 'AD';
        // Show all admin nav
        adminNavItems.forEach(el => el.closest('li').style.display = '');
        // Activate dashboard
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById('page-dashboard').classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.getElementById('nav-dashboard').classList.add('active');
    } else if (currentUser.role === 'mediator') {
        panelLabel.textContent = 'Mediator Panel';
        userName.textContent = 'Verification Authority';
        userRole.textContent = 'Secure Exchange Protocol';
        avatar.textContent = 'VA';
        // Hide Admin pages nav
        adminNavItems.forEach(el => el.closest('li').style.display = 'none');
        // Show Mediator nav
        if(medSection) medSection.style.display = 'block';
        if(medLink) medLink.style.display = 'block';
        // Show mediator page
        pages.forEach(p => p.classList.remove('active'));
        const pgMed = document.getElementById('page-mediator');
        if(pgMed) pgMed.classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const navMed = document.getElementById('nav-mediator');
        if(navMed) navMed.classList.add('active');
        document.getElementById('breadcrumb-text').textContent = 'Verification Dashboard';
        if(typeof loadMediatorQueue === 'function') loadMediatorQueue();
    } else {
        panelLabel.textContent = 'Business Panel';
        userName.textContent = currentUser.businessName;
        userRole.textContent = 'Business Account';
        avatar.textContent = currentUser.businessName.substring(0, 2).toUpperCase();
        // Hide admin pages nav
        adminNavItems.forEach(el => el.closest('li').style.display = 'none');
        // Show business page
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById('page-business').classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.getElementById('breadcrumb-text').textContent = 'Business Dashboard';
        // Load saved data
        loadBizDashboard();
    }
}

// ===== DATA =====
const wasteData = [
    { id: 1, type: 'plastic', name: 'HDPE Plastic Scrap', qty: 120, unit: 'Tata Polymers', location: 'Zone 4', hazard: 'safe', icon: '♻️' },
    { id: 2, type: 'flyash', name: 'Fly Ash (Grade A)', qty: 340, unit: 'NTPC Power Plant', location: 'Zone 5', hazard: 'safe', icon: '🏭' },
    { id: 3, type: 'chemical', name: 'Sulfuric Acid Residue', qty: 45, unit: 'ChemCorp India', location: 'Zone 7', hazard: 'hazardous', icon: '🧪' },
    { id: 4, type: 'metal', name: 'Steel Slag', qty: 280, unit: 'JSW Steel', location: 'Zone 3', hazard: 'safe', icon: '🔩' },
    { id: 5, type: 'organic', name: 'Food Processing Waste', qty: 90, unit: 'ITC Foods', location: 'Zone 1', hazard: 'safe', icon: '🌿' },
    { id: 6, type: 'ewaste', name: 'Circuit Board Scrap', qty: 18, unit: 'Infosys Campus', location: 'Zone 6', hazard: 'moderate', icon: '💻' },
    { id: 7, type: 'textile', name: 'Cotton Mill Waste', qty: 160, unit: 'Raymond Fabrics', location: 'Zone 8', hazard: 'safe', icon: '🧵' },
    { id: 8, type: 'rubber', name: 'Tire Rubber Crumbs', qty: 75, unit: 'MRF Tire Plant', location: 'Zone 2', hazard: 'moderate', icon: '⚫' },
];

const matchesData = [
    { from: 'HDPE Plastic Scrap', to: 'Road Construction Co.', score: 96, color: '#00e68a', icon: '🛤️' },
    { from: 'Fly Ash (Grade A)', to: 'EcoBricks Pvt Ltd', score: 94, color: '#38bdf8', icon: '🧱' },
    { from: 'Steel Slag', to: 'Cement Works Ltd', score: 91, color: '#fbbf24', icon: '🏗️' },
    { from: 'Food Processing Waste', to: 'BioGas Energy Hub', score: 89, color: '#a78bfa', icon: '⚡' },
    { from: 'Cotton Mill Waste', to: 'EcoFiber Recyclers', score: 87, color: '#22d3ee', icon: '🧶' },
];

const trustData = [
    { name: 'Tata Polymers', type: 'safe', detail: 'ISO 14001 Certified', rating: 5, verified: true },
    { name: 'ChemCorp India', type: 'hazardous', detail: 'CPCB Category A', rating: 3, verified: true },
    { name: 'JSW Steel', type: 'safe', detail: 'Green Industry Award', rating: 5, verified: true },
    { name: 'MRF Tire Plant', type: 'moderate', detail: 'Under Review', rating: 4, verified: false },
    { name: 'ITC Foods', type: 'safe', detail: 'Zero Waste Certified', rating: 5, verified: true },
];

const transformations = {
    plastic: [
        { from: 'Plastic Waste', to: 'Road Material', fromIcon: '♻️', toIcon: '🛤️' },
        { from: 'Plastic Waste', to: 'Recycled Pellets', fromIcon: '♻️', toIcon: '⚫' },
        { from: 'Plastic Waste', to: 'Furniture', fromIcon: '♻️', toIcon: '🪑' },
    ],
    flyash: [
        { from: 'Fly Ash', to: 'Bricks', fromIcon: '🏭', toIcon: '🧱' },
        { from: 'Fly Ash', to: 'Cement Additive', fromIcon: '🏭', toIcon: '🏗️' },
        { from: 'Fly Ash', to: 'Land Filler', fromIcon: '🏭', toIcon: '🌍' },
    ],
    organic: [
        { from: 'Organic Waste', to: 'Biogas Energy', fromIcon: '🌿', toIcon: '⚡' },
        { from: 'Organic Waste', to: 'Compost', fromIcon: '🌿', toIcon: '🌱' },
        { from: 'Organic Waste', to: 'Bio-Fertilizer', fromIcon: '🌿', toIcon: '🧪' },
    ],
    metal: [
        { from: 'Steel Slag', to: 'Cement Raw Material', fromIcon: '🔩', toIcon: '🏗️' },
        { from: 'Steel Slag', to: 'Road Base', fromIcon: '🔩', toIcon: '🛤️' },
    ],
    chemical: [
        { from: 'Chemical Residue', to: 'Treated Safe Material', fromIcon: '🧪', toIcon: '✅' },
    ],
    ewaste: [
        { from: 'E-Waste', to: 'Precious Metals', fromIcon: '💻', toIcon: '💎' },
        { from: 'E-Waste', to: 'Recycled Components', fromIcon: '💻', toIcon: '🔧' },
    ],
    textile: [
        { from: 'Textile Waste', to: 'Recycled Fiber', fromIcon: '🧵', toIcon: '🧶' },
        { from: 'Textile Waste', to: 'Insulation Material', fromIcon: '🧵', toIcon: '🏠' },
    ],
    rubber: [
        { from: 'Rubber Waste', to: 'Playground Surfaces', fromIcon: '⚫', toIcon: '🏫' },
        { from: 'Rubber Waste', to: 'Road Asphalt Mix', fromIcon: '⚫', toIcon: '🛤️' },
    ],
};

const nearbyIndustries = [
    { name: 'Road Construction Co.', dist: '3.2 km', type: 'buyer' },
    { name: 'EcoBricks Pvt Ltd', dist: '5.1 km', type: 'buyer' },
    { name: 'Green Energy Hub', dist: '7.8 km', type: 'buyer' },
    { name: 'Cement Works Ltd', dist: '4.5 km', type: 'buyer' },
    { name: 'BioGas Energy Hub', dist: '6.3 km', type: 'buyer' },
    { name: 'EcoFiber Recyclers', dist: '8.9 km', type: 'buyer' },
];

// ===== INIT =====
function initApp() {
    initNavigation();
    initClock();
    initNotifications();
    initPolicyModal();
    animateKPIs();
    renderRecentMatches();
    renderTrustList();
    renderWasteItems();
    renderNearbyIndustries();
    initUploadForm();
    initCharts();
    initMapCanvas();
    initRouteCanvas();
    initCityMap();
    initTimeSlider();
    initToggles();
    initWasteSearch();
    startLiveDataTicker();
}

// ===== NAVIGATION =====
function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const breadcrumb = document.getElementById('breadcrumb-text');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mobileBtn = document.getElementById('mobile-menu-btn');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            sessionStorage.setItem('win_active_page', page);
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById('page-' + page).classList.add('active');
            breadcrumb.textContent = link.querySelector('span').textContent;
            if (sidebar.classList.contains('mobile-open')) sidebar.classList.remove('mobile-open');
            // Re-init canvases when switching to their pages
            if (page === 'matching') setTimeout(initMapCanvas, 100);
            if (page === 'logistics') setTimeout(initRouteCanvas, 100);
            if (page === 'city-grid') setTimeout(initCityMap, 100);
        });
    });

    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    mobileBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
}

// ===== CLOCK =====
function initClock() {
    const clock = document.getElementById('live-clock');
    function update() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    update();
    setInterval(update, 1000);
}

// ===== NOTIFICATIONS =====
function initNotifications() {
    const btn = document.getElementById('notification-btn');
    const panel = document.getElementById('notification-panel');
    const close = document.getElementById('notif-close');
    btn.addEventListener('click', () => panel.classList.toggle('hidden'));
    close.addEventListener('click', () => panel.classList.add('hidden'));
}

// ===== POLICY MODAL & REAL-TIME MAGIC =====
const BASE_KPI = {
    co2: 12450,
    landfill: 8340,
    savings: 3200000,
    matches: 1847
};

function initPolicyModal() {
    const btn = document.getElementById('policy-sim-btn');
    const modal = document.getElementById('policy-modal');
    const close = document.getElementById('policy-modal-close');
    const runBtn = document.getElementById('run-simulation-btn');
    const results = document.getElementById('simulation-results');

    btn.addEventListener('click', () => modal.classList.remove('hidden'));
    close.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    // REAL-TIME DYNAMIC SLIDERS
    ['policy-tax', 'policy-subsidy', 'policy-quota'].forEach(id => {
        const slider = document.getElementById(id);
        const val = document.getElementById(id + '-val');
        slider.addEventListener('input', () => {
            val.textContent = slider.value + '%';
            updateRealTimeMetrics();
        });
    });

    runBtn.addEventListener('click', () => {
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizing Policies...';
        setTimeout(() => {
            results.classList.remove('hidden');
            updateProjectedOutcomes();
            runBtn.innerHTML = '<i class="fas fa-check"></i> Policy Enacted City-Wide';
        }, 800);
    });
}

function updateRealTimeMetrics() {
    const tax = parseInt(document.getElementById('policy-tax').value) || 0;
    const sub = parseInt(document.getElementById('policy-subsidy').value) || 0;
    const quota = parseInt(document.getElementById('policy-quota').value) || 0;

    // AI Math simulation logic based on sliders
    const impactFactor = 1 + (tax * 0.005) + (sub * 0.008) + (quota * 0.012);

    const newCO2 = Math.round(BASE_KPI.co2 * impactFactor);
    const newLandfill = Math.round(BASE_KPI.landfill * (1 - (tax * 0.003 + quota * 0.004)));
    const newSavings = Math.round(BASE_KPI.savings * (1 + (sub * 0.015) - (tax * 0.002)));

    // Update Topbar Score instantly
    const scoreVal = Math.min(100, Math.round(65 + (impactFactor * 10)));
    const sfill = document.getElementById('sustainability-score');
    if (sfill) sfill.style.width = scoreVal + '%';
    const sval = document.getElementById('score-value');
    if (sval) sval.textContent = scoreVal + '/100';

    // Update Dashboard KPIs dynamically
    updateDynamicKPI('kpi-co2', newCO2, '');
    updateDynamicKPI('kpi-landfill', newLandfill, '');
    updateDynamicKPI('kpi-savings', newSavings, '$');
    // If simulation results are visible, update them too
    if (!document.getElementById('simulation-results')?.classList.contains('hidden')) updateProjectedOutcomes();
}

function updateDynamicKPI(id, val, prefix) {
    const card = document.getElementById(id);
    if (!card) return;
    const valEl = card.querySelector('.kpi-value');
    if (valEl) {
        valEl.textContent = prefix + val.toLocaleString();
    }

    // Quick visual pop effect
    card.style.transform = 'scale(1.03) translateY(-3px)';
    card.style.boxShadow = '0 10px 20px rgba(0, 230, 138, 0.2)';
    setTimeout(() => {
        card.style.transform = 'none';
        card.style.boxShadow = 'var(--glass-shadow)';
    }, 200);
}

async function updateImpactPage() {
    let realCo2 = 0; let realLandfill = 0; let realSavings = 0;
    try {
        const bizRes = await fetch(`${API_URL}/api/bizdata`);
        const allBiz = await bizRes.json();
        Object.values(allBiz).forEach(d => {
            realCo2 += (d.co2 || 0) + (d.importCo2 || 0);
            realLandfill += (d.waste || 0) + (d.imported || 0);
            realSavings += (d.revenue || 0) + (d.importSavings || 0);
        });
    } catch (e) { }

    const totalCo2 = BASE_KPI.co2 + realCo2;
    const totalLandfill = BASE_KPI.landfill + realLandfill;
    const totalSavings = BASE_KPI.savings + realSavings;

    const co2El = document.getElementById('impact-co2-val');
    const landEl = document.getElementById('impact-landfill-val');
    const savEl = document.getElementById('impact-savings-val');

    if (co2El) {
        co2El.textContent = totalCo2.toLocaleString();
        co2El.parentElement.parentElement.classList.add('pulse');
        setTimeout(() => co2El.parentElement.parentElement.classList.remove('pulse'), 400);
    }
    if (landEl) landEl.textContent = totalLandfill.toLocaleString();
    if (savEl) {
        if (totalSavings > 1000000) savEl.textContent = '$' + (totalSavings / 1000000).toFixed(2) + 'M';
        else savEl.textContent = '$' + totalSavings.toLocaleString();
    }

    // Add Live Dynamic Summary Banner
    const impactHeader = document.querySelector('#page-impact .page-header');
    let summaryDiv = document.getElementById('live-impact-summary');
    if (!summaryDiv && impactHeader) {
        summaryDiv = document.createElement('div');
        summaryDiv.id = 'live-impact-summary';
        summaryDiv.style.marginTop = '15px';
        summaryDiv.style.padding = '12px 20px';
        summaryDiv.style.background = 'rgba(0, 230, 138, 0.1)';
        summaryDiv.style.border = '1px solid var(--neon-green)';
        summaryDiv.style.borderRadius = '8px';
        summaryDiv.style.color = '#fff';
        summaryDiv.style.fontSize = '14px';
        impactHeader.appendChild(summaryDiv);
    }
    if (summaryDiv && realSavings > 0) {
        summaryDiv.innerHTML = `<strong><i class="fas fa-satellite-dish blink"></i> LIVE NETWORK IMPACT:</strong> Newly registered active businesses have directly contributed to saving <b>${realCo2.toLocaleString()} kg of CO₂</b> and generating <b>₹${realSavings.toLocaleString()}</b> in circular economy value.`;
    }
}

function updateProjectedOutcomes() {
    const tax = parseInt(document.getElementById('policy-tax').value) || 0;
    const sub = parseInt(document.getElementById('policy-subsidy').value) || 0;
    const quota = parseInt(document.getElementById('policy-quota').value) || 0;
    const cards = document.querySelectorAll('.sim-result-card');
    if (cards[0]) cards[0].querySelector('.sim-val').textContent = '-' + Math.round(tax * 0.8 + quota * 0.4) + '%';
    if (cards[1]) cards[1].querySelector('.sim-val').textContent = '+' + Math.round(sub * 0.5 + quota * 0.3) + '%';
    if (cards[2]) cards[2].querySelector('.sim-val').textContent = '-' + Math.round((tax * 200 + sub * 150 + quota * 180) / 1000).toFixed(0) + 'K';
    if (cards[3]) cards[3].querySelector('.sim-val').textContent = '+$' + ((tax * 0.03 + sub * 0.02) + 0.5).toFixed(1) + 'M';
}

function initWasteSearch() {
    const search = document.getElementById('waste-search');
    if (!search) return;
    search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        document.querySelectorAll('.waste-item').forEach(item => {
            const name = item.querySelector('.waste-item-name')?.textContent.toLowerCase() || '';
            const meta = item.querySelector('.waste-item-meta')?.textContent.toLowerCase() || '';
            item.style.display = (name.includes(q) || meta.includes(q)) ? '' : 'none';
        });
    });
}

// ===== ANIMATED KPI COUNTERS =====
function animateKPIs() {
    document.querySelectorAll('.kpi-value').forEach(el => {
        const target = parseInt(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        if (!target) return;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = prefix + Math.round(current).toLocaleString();
        }, 25);
    });
    // Impact page counters
    document.querySelectorAll('.counter').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (!target) return;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.round(current).toLocaleString();
        }, 25);
    });
}

// ===== RENDER FUNCTIONS =====
function renderRecentMatches() {
    const container = document.getElementById('recent-matches');
    container.innerHTML = matchesData.map(m => `
        <div class="match-item">
            <div class="match-icon" style="background:${m.color}22;color:${m.color}">${m.icon}</div>
            <div class="match-info">
                <span class="match-name">${m.from} → ${m.to}</span>
                <span class="match-detail">AI Confidence Match</span>
            </div>
            <span class="match-score" style="color:${m.color}">${m.score}%</span>
        </div>
    `).join('');
}

function renderTrustList() {
    const container = document.getElementById('trust-list');
    container.innerHTML = trustData.map(t => `
        <div class="trust-item">
            <span class="trust-badge ${t.type}">${t.type.toUpperCase()}</span>
            <div class="trust-info">
                <span class="trust-name">${t.name}</span>
                <span class="trust-detail">${t.detail}</span>
            </div>
            <div class="trust-rating">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
            ${t.verified ? '<i class="fas fa-check-circle trust-verified"></i>' : ''}
        </div>
    `).join('');
}

async function renderWasteItems() {
    const container = document.getElementById('waste-items-list');

    // Original dummy data
    let displayList = [...wasteData];

    // Inject REAL users from DB
    try {
        const usersRes = await fetch(`${API_URL}/api/users`);
        const users = await usersRes.json();
        const bizRes = await fetch(`${API_URL}/api/bizdata`);
        const allBiz = await bizRes.json();

        users.forEach(u => {
            const data = allBiz[u.username];
            if (data && data.waste > 0) {
                // Add this real business's waste to top of list
                displayList.unshift({
                    id: 'live-' + u.username,
                    type: 'mixed',
                    name: 'Mixed Industrial Scrap',
                    qty: data.waste,
                    unit: u.businessName,
                    location: 'Live Registered',
                    hazard: 'moderate',
                    icon: '📦'
                });
            }
        });
    } catch (e) { console.warn("Could not fetch livedata for waste list", e); }

    container.innerHTML = displayList.map(w => `
        <div class="waste-item" data-id="${w.id}" data-type="${w.type}">
            <div class="waste-item-header">
                <span class="waste-item-name">${w.icon} ${w.name}${w.location === 'Live Registered' ? ' <span style="font-size:10px;color:var(--neon-green)">● LIVE</span>' : ''}</span>
                <span class="waste-item-qty">${w.qty} T</span>
            </div>
            <div class="waste-item-meta">${w.unit} · ${w.location} · <span class="trust-badge ${w.hazard}" style="font-size:9px;padding:1px 6px;">${w.hazard.toUpperCase()}</span></div>
            <button class="waste-item-btn" onclick="showTransformation('${w.type}')">
                <i class="fas fa-magic"></i> What Can This Become?
            </button>
        </div>
    `).join('');
}

function renderNearbyIndustries() {
    const container = document.getElementById('nearby-industries');
    container.innerHTML = nearbyIndustries.map(n => `
        <div class="nearby-item">
            <i class="fas fa-map-marker-alt nearby-pin"></i>
            <div class="nearby-info">
                <span class="nearby-name">${n.name}</span>
                <span class="nearby-dist">${n.dist}</span>
            </div>
        </div>
    `).join('');
}

// ===== TRANSFORMATION PANEL =====
function showTransformation(type) {
    const panel = document.getElementById('transformation-panel');
    const flows = transformations[type] || [];
    if (!flows.length) { panel.innerHTML = '<p class="placeholder-text">No transformations available</p>'; return; }
    panel.innerHTML = `
        <div class="transform-visual">
            ${flows.map(f => `
                <div class="transform-flow">
                    <div class="transform-from">${f.fromIcon} ${f.from}</div>
                    <div class="transform-arrow"><i class="fas fa-long-arrow-alt-right"></i><i class="fas fa-long-arrow-alt-right"></i><i class="fas fa-long-arrow-alt-right"></i></div>
                    <div class="transform-to">${f.toIcon} ${f.to}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== UPLOAD FORM (GEMINI API) =====
function initUploadForm() {
    const form = document.getElementById('waste-upload-form');
    const results = document.getElementById('upload-results');
    // Using the newly provided user key
    // Configure this at deployment time. Never commit a real API key to source control.
    const GEMINI_API_KEY = window.GEMINI_API_KEY || "";

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-waste-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        const type = document.getElementById('waste-type').value || 'plastic';
        const qty = document.getElementById('waste-qty').value || '100';
        const desc = document.getElementById('waste-desc').value || 'Standard material';
        const location = document.getElementById('waste-location').value || 'Bangalore';

        const prompt = `You are the AI core for the WIN (Waste-to-Value Intelligence Network) smart city platform. 
A user has uploaded ${qty} tons of ${type} waste described as: "${desc}" located near ${location}.
Provide a JSON response analyzing this waste with EXACTLY this structure and ONLY valid JSON:
{
    "summary": "A 2-3 sentence analysis of economic and environmental potential.",
    "estimated_value": "₹[Amount]",
    "co2_reduction": "[Amount] tons",
    "matches": [
        { "name": "Industry Buyer Name 1", "confidence": 95, "icon": "🏭" },
        { "name": "Industry Buyer Name 2", "confidence": 88, "icon": "🏗️" }
    ],
    "transformations": [
        { "from": "${type} waste", "to": "End Product 1", "fromIcon": "♻️", "toIcon": "📦" },
        { "from": "${type} waste", "to": "End Product 2", "fromIcon": "♻️", "toIcon": "🧱" }
    ]
}`;

        try {
            const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];
            let response, data, success = false, lastError = "";

            for (const model of modelsToTry) {
                try {
                    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });
                    data = await response.json();
                    if (response.ok && !data.error) {
                        success = true;
                        console.log(`Successfully used model: ${model}`);
                        break;
                    }
                    lastError = data?.error?.message || "HTTP " + response.status;
                    console.warn(`Model ${model} failed:`, lastError);
                } catch (e) {
                    lastError = e.message;
                }
            }

            if (!success) {
                throw new Error("API Error. Tried multiple models and all failed. Last error: " + lastError);
            }

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No response generated. Safety filters may have blocked it.");
            }

            let aiText = data.candidates[0]?.content?.parts?.[0]?.text;
            if (!aiText) throw new Error("Empty text returned from Gemini.");

            console.log("Raw Gemini Response:", aiText);

            // Safe JSON extraction
            const startIndex = aiText.indexOf('{');
            const endIndex = aiText.lastIndexOf('}');
            if (startIndex === -1 || endIndex === -1) {
                throw new Error("API did not return JSON format. Returned text: " + aiText);
            }

            const jsonString = aiText.substring(startIndex, endIndex + 1);
            const aiData = JSON.parse(jsonString);

            // ======== UPDATE IMPACT METRICS DYNAMICALLY ========
            const co2Num = parseFloat(String(aiData.co2_reduction).replace(/[^0-9.]/g, '')) || 0;
            const valNum = parseFloat(String(aiData.estimated_value).replace(/[^0-9.]/g, '')) || 0;
            const qtyNum = parseFloat(document.getElementById('waste-qty').value) || 0;

            if (co2Num > 0) BASE_KPI.co2 += co2Num;
            if (valNum > 0) BASE_KPI.savings += valNum;
            if (qtyNum > 0) BASE_KPI.landfill += qtyNum;

            // Trigger UI updates
            updateRealTimeMetrics();
            updateImpactPage();
            // =================================================

            results.classList.remove('hidden');
            document.getElementById('ai-summary').innerHTML = `
                <p><strong><i class="fas fa-robot" style="color:var(--neon-green)"></i> Analysis Complete</strong></p>
                <p>${aiData.summary} Estimated economic value: <strong style="color:var(--neon-green)">${aiData.estimated_value}</strong>. Environmental impact: 
                <strong style="color:var(--neon-green)">${aiData.co2_reduction} CO₂</strong> reduction potential.</p>`;

            document.getElementById('ai-match-cards').innerHTML = aiData.matches.map(m => `
                <div class="ai-match-card">
                    <div class="match-icon" style="background:rgba(0, 230, 138, 0.1);color:var(--neon-green)">${m.icon || '🏭'}</div>
                    <div class="match-info">
                        <span class="match-name">${m.name}</span>
                        <span class="match-detail">Match confidence: ${m.confidence}%</span>
                    </div>
                    <button class="btn-sm">Connect</button>
                </div>
            `).join('');

            document.getElementById('transform-preview').innerHTML = aiData.transformations.map(f => `
                <div class="transform-flow">
                    <div class="transform-from">${f.fromIcon || '♻️'} ${f.from}</div>
                    <div class="transform-arrow"><i class="fas fa-long-arrow-alt-right"></i></div>
                    <div class="transform-to">${f.toIcon || '📦'} ${f.to}</div>
                </div>
            `).join('');

            btn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully';
        } catch (error) {
            console.error("Detailed Error:", error);
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            alert(error.message); // Show exact failure reason
        } finally {
            btn.disabled = false;
            setTimeout(() => { if (!btn.disabled) btn.innerHTML = '<i class="fas fa-brain"></i> Submit for AI Analysis'; }, 4000);
        }
    });
}

// ===== TIME SLIDER =====
function initTimeSlider() {
    const slider = document.getElementById('time-slider');
    const val = document.getElementById('time-slider-val');
    if (!slider) return;
    slider.addEventListener('input', () => {
        val.textContent = slider.value.toString().padStart(2, '0') + ':00';
    });
}

// ===== TOGGLE BUTTONS =====
function initToggles() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });
}

// ===== CHARTS (Canvas-based, no library) =====
function initCharts() {
    drawWasteFlowChart();
    drawCategoryChart();
    drawPredictiveChart();
    drawImpactTrendChart();
}

function drawWasteFlowChart() {
    const canvas = document.getElementById('wasteFlowChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;

    const generated = [420, 380, 510, 470, 560, 490, 620, 580, 710, 680, 740, 790];
    const reused = [180, 220, 280, 310, 380, 340, 420, 410, 490, 470, 520, 560];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxVal = 800;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ch / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '10px JetBrains Mono';
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 35, y + 4);
    }

    // Labels
    ctx.fillStyle = '#64748b'; ctx.font = '10px Inter';
    labels.forEach((l, i) => {
        const x = pad.left + (cw / (labels.length - 1)) * i;
        ctx.fillText(l, x - 10, h - 8);
    });

    // Area + Line for Generated
    drawAreaLine(ctx, generated, maxVal, pad, cw, ch, '#f87171', 'rgba(248,113,113,0.08)');
    // Area + Line for Reused
    drawAreaLine(ctx, reused, maxVal, pad, cw, ch, '#00e68a', 'rgba(0,230,138,0.08)');

    // Legend
    ctx.fillStyle = '#f87171'; ctx.fillRect(w - 180, 8, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter'; ctx.fillText('Generated', w - 165, 17);
    ctx.fillStyle = '#00e68a'; ctx.fillRect(w - 90, 8, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('Reused', w - 75, 17);
}

function drawAreaLine(ctx, data, maxVal, pad, cw, ch, color, fillColor) {
    const points = data.map((v, i) => ({
        x: pad.left + (cw / (data.length - 1)) * i,
        y: pad.top + ch - (v / maxVal) * ch
    }));

    // Area
    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + ch);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        const xc = (points[i - 1].x + points[i].x) / 2;
        const yc = (points[i - 1].y + points[i].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.quadraticCurveTo(points[points.length - 2].x, points[points.length - 2].y, points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    points.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
    });
}

function drawCategoryChart() {
    const canvas = document.getElementById('wasteCategoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 20;

    const data = [
        { label: 'Plastic', value: 25, color: '#00e68a' },
        { label: 'Fly Ash', value: 22, color: '#38bdf8' },
        { label: 'Metal', value: 18, color: '#fbbf24' },
        { label: 'Chemical', value: 12, color: '#f87171' },
        { label: 'Organic', value: 10, color: '#a78bfa' },
        { label: 'E-Waste', value: 8, color: '#22d3ee' },
        { label: 'Other', value: 5, color: '#64748b' },
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.strokeStyle = '#0a0e17';
        ctx.lineWidth = 2;
        ctx.stroke();
        startAngle += sliceAngle;
    });

    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('1,128', cx, cy - 2);
    ctx.font = '10px Inter';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Total Tons', cx, cy + 14);

    // Legend
    const legend = document.getElementById('category-legend');
    if (legend) {
        legend.innerHTML = data.map(d =>
            `<span class="cat-item"><span class="cat-dot" style="background:${d.color}"></span>${d.label} ${d.value}%</span>`
        ).join('');
    }
}

function drawPredictiveChart() {
    const canvas = document.getElementById('predictiveChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;

    const actual = [320, 340, 380, 420, 450, 480, 510, 540];
    const predicted = [null, null, null, null, null, null, 510, 540, 590, 620, 680, 740];
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    const maxVal = 800;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ch / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
        ctx.fillStyle = '#64748b'; ctx.font = '10px JetBrains Mono';
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 35, y + 4);
    }
    ctx.fillStyle = '#64748b'; ctx.font = '10px Inter';
    labels.forEach((l, i) => {
        const x = pad.left + (cw / (labels.length - 1)) * i;
        ctx.fillText(l, x - 8, h - 8);
    });

    // Actual line
    const actPts = actual.map((v, i) => ({ x: pad.left + (cw / (labels.length - 1)) * i, y: pad.top + ch - (v / maxVal) * ch }));
    ctx.beginPath(); ctx.moveTo(actPts[0].x, actPts[0].y);
    actPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.stroke();
    actPts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#38bdf8'; ctx.fill(); });

    // Predicted line (dashed)
    const predPts = predicted.map((v, i) => v !== null ? { x: pad.left + (cw / (labels.length - 1)) * i, y: pad.top + ch - (v / maxVal) * ch } : null).filter(Boolean);
    ctx.beginPath(); ctx.setLineDash([6, 4]);
    ctx.moveTo(predPts[0].x, predPts[0].y);
    predPts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([]);
    predPts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#fbbf24'; ctx.fill(); });

    // Prediction zone shading
    if (predPts.length >= 2) {
        ctx.fillStyle = 'rgba(251,191,36,0.05)';
        ctx.fillRect(predPts[0].x, pad.top, w - pad.right - predPts[0].x, ch);
        ctx.fillStyle = '#fbbf24'; ctx.font = '10px Inter';
        ctx.fillText('▸ Predicted', predPts[0].x + 4, pad.top + 14);
    }

    // Legend
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(w - 180, 8, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter'; ctx.fillText('Actual', w - 165, 17);
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(w - 90, 8, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('Predicted', w - 75, 17);
}

function drawImpactTrendChart() {
    const canvas = document.getElementById('impactTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const co2 = [800, 920, 1050, 980, 1100, 1250, 1400, 1350, 1500, 1620, 1780, 1900];
    const landfill = [600, 680, 740, 710, 790, 860, 920, 900, 980, 1050, 1120, 1200];
    const maxVal = 2000;

    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ch / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    }
    months.forEach((l, i) => {
        ctx.fillStyle = '#64748b'; ctx.font = '10px Inter';
        const x = pad.left + (cw / (months.length - 1)) * i;
        ctx.fillText(l, x - 10, h - 8);
    });

    // Bars
    const barW = cw / months.length * 0.35;
    months.forEach((_, i) => {
        const x = pad.left + (cw / (months.length - 1)) * i;
        const h1 = (co2[i] / maxVal) * ch;
        const h2 = (landfill[i] / maxVal) * ch;
        ctx.fillStyle = 'rgba(0,230,138,0.3)';
        ctx.fillRect(x - barW - 1, pad.top + ch - h1, barW, h1);
        ctx.fillStyle = 'rgba(56,189,248,0.3)';
        ctx.fillRect(x + 1, pad.top + ch - h2, barW, h2);
    });

    ctx.fillStyle = '#00e68a'; ctx.fillRect(w - 180, 8, 10, 10);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter'; ctx.fillText('CO₂ Saved', w - 165, 17);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(w - 80, 8, 10, 10);
    ctx.fillText('Landfill', w - 65, 17);
}

// ===== MAPS (LEAFLET) =====
let hyperlocalMap = null;
let routeMap = null;
let cityGridMap = null;
const colorfulTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

async function initMapCanvas() {
    if (hyperlocalMap) { hyperlocalMap.invalidateSize(); return; }
    const container = document.getElementById('map-canvas');
    if (!container || !container.offsetWidth) return;
    hyperlocalMap = L.map('map-canvas', { zoomControl: true }).setView([12.9716, 77.5946], 11);
    L.tileLayer(colorfulTileUrl, { attribution: '© OpenStreetMap' }).addTo(hyperlocalMap);

    const srcIcon = L.divIcon({ className: 'custom-icon', html: '<div style="background:#f87171;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 12px #f87171;"></div>' });
    const buyIcon = L.divIcon({ className: 'custom-icon', html: '<div style="background:#00e68a;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 12px #00e68a;"></div>' });
    const realIcon = L.divIcon({ className: 'custom-icon', html: '<div style="background:#fbbf24;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 14px #fbbf24;z-index:999;"></div>' });

    const sources = [];
    const buyers = [];

    // Plot Suppliers (Waste Sources)
    if (typeof supplierDatabase !== 'undefined') {
        Object.keys(supplierDatabase).forEach(category => {
            supplierDatabase[category].forEach(s => {
                if (s.lat && s.lng) {
                    L.marker([s.lat, s.lng], { icon: srcIcon }).bindPopup(`<b>🏭 ${s.icon} ${s.name}</b><br>Waste Source: ${s.detail}`).addTo(hyperlocalMap);
                    sources.push(s);
                }
            });
        });
    }

    // Plot Companies (Potential Buyers)
    if (typeof companyDatabase !== 'undefined') {
        Object.keys(companyDatabase).forEach(category => {
            companyDatabase[category].forEach(c => {
                if (c.lat && c.lng) {
                    L.marker([c.lat, c.lng], { icon: buyIcon }).bindPopup(`<b>♻️ ${c.icon} ${c.name}</b><br>Potential Buyer: ${c.detail}`).addTo(hyperlocalMap);
                    buyers.push(c);
                }
            });
        });
    }

    // Draw some sample matching routes 
    for (let i = 0; i < Math.min(sources.length, buyers.length); i += 3) {
        if (sources[i] && buyers[i]) {
            L.polyline([[sources[i].lat, sources[i].lng], [buyers[i].lat, buyers[i].lng]], { color: '#38bdf8', weight: 2, dashArray: '5,5', opacity: 0.6 }).addTo(hyperlocalMap);
        }
    }

    // --- Add REAL Registered Businesses ---
    try {
        const usersRes = await fetch(`${API_URL}/api/users`);
        const users = await usersRes.json();
        const bizRes = await fetch(`${API_URL}/api/bizdata`);
        const allBiz = await bizRes.json();

        users.forEach(u => {
            const data = allBiz[u.username];
            if (data && data.lat && data.lng) {
                const desc = `Live User Registration<br>Exported: ${data.waste} T<br>Imported: ${data.imported} T<br>CO₂ Saved: ${data.co2} kg`;
                L.marker([data.lat, data.lng], { icon: realIcon }).addTo(hyperlocalMap).bindPopup(`<b>⭐ ${u.businessName}</b><br><span style="color:var(--neon-green)">● LIVE ON NETWORK</span><br>${desc}`).openPopup();

                // Draw dynamic route line to nearest match just for visual flair
                const target = buyers[Math.floor(Math.random() * buyers.length)];
                if (target) {
                    L.polyline([[data.lat, data.lng], [target.lat, target.lng]], { color: '#fbbf24', weight: 3, dashArray: '8,8', opacity: 0.8 }).addTo(hyperlocalMap);
                }
            }
        });
    } catch (e) { console.warn("Could not fetch livedata for map"); }
}

const routeConfigs = [
    { origin: [12.95, 77.58], dest: [12.98, 77.63], waypoints: [[12.955, 77.61], [12.97, 77.615]], dist: '18.5 km', time: '42 min', cost: '₹12,400', fuel: '14.2 L', eff: 87 },
    { origin: [12.97, 77.55], dest: [12.94, 77.62], waypoints: [[12.96, 77.57], [12.95, 77.60]], dist: '12.1 km', time: '28 min', cost: '₹8,200', fuel: '9.6 L', eff: 93 },
    { origin: [13.01, 77.58], dest: [12.96, 77.68], waypoints: [[12.99, 77.62], [12.97, 77.65]], dist: '22.8 km', time: '55 min', cost: '₹18,900', fuel: '21.3 L', eff: 76 }
];
let currentRouteIdx = 0;
let routeLine = null;
let routeMarkers = [];

async function initRouteCanvas() {
    if (routeMap) { routeMap.invalidateSize(); return; }
    const container = document.getElementById('route-canvas');
    if (!container || !container.offsetWidth) return;
    routeMap = L.map('route-canvas', { zoomControl: true }).setView([12.965, 77.605], 13);
    L.tileLayer(colorfulTileUrl, { attribution: '© OpenStreetMap' }).addTo(routeMap);

    try {
        const usersRes = await fetch(`${API_URL}/api/users`);
        const users = await usersRes.json();
        const bizRes = await fetch(`${API_URL}/api/bizdata`);
        const allBiz = await bizRes.json();

        const originSelect = document.getElementById('route-origin');
        const destSelect = document.getElementById('route-dest');

        users.forEach(u => {
            const data = allBiz[u.username];
            if (data && data.lat && data.lng) {
                // Add to options based on role
                if (data.waste > 0 && originSelect) originSelect.insertAdjacentHTML('beforeend', `<option value="live-${u.username}">[LIVE] ${u.businessName}</option>`);
                if (data.imported > 0 && destSelect) destSelect.insertAdjacentHTML('beforeend', `<option value="live-${u.username}">[LIVE] ${u.businessName}</option>`);
                // Inject route config with random other end
                routeConfigs.push({
                    origin: [data.lat, data.lng],
                    dest: [(data.lat + 13.0) / 2, (data.lng + 77.5) / 2],
                    waypoints: [],
                    dist: '14.2 km', time: '35 min', eff: 92,
                    cost: '₹' + (data.waste * 100 || 5000), fuel: '12.4 L'
                });
            }
        });
    } catch (e) { console.warn("Could not inject real users to routing."); }

    drawRoute(0);
    // Dynamic: react to dropdown changes
    ['route-origin', 'route-dest', 'route-load'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => { currentRouteIdx = (currentRouteIdx + 1) % routeConfigs.length; drawRoute(currentRouteIdx); });
    });
    const loadEl = document.getElementById('route-load');
    if (loadEl) loadEl.addEventListener('input', () => updateRouteStats(currentRouteIdx));
    const simBtn = document.getElementById('simulate-route-btn');
    if (simBtn) simBtn.addEventListener('click', () => {
        simBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
        currentRouteIdx = (currentRouteIdx + 1) % routeConfigs.length;
        setTimeout(() => { drawRoute(currentRouteIdx); simBtn.innerHTML = '<i class="fas fa-check"></i> Route Optimized'; setTimeout(() => { simBtn.innerHTML = '<i class="fas fa-play"></i> Simulate Route'; }, 2500); }, 1200);
    });
}

function drawRoute(idx) {
    const cfg = routeConfigs[idx];
    routeMarkers.forEach(m => routeMap.removeLayer(m));
    if (routeLine) routeMap.removeLayer(routeLine);
    routeMarkers = [];
    const oriI = L.divIcon({ className: 'custom-icon', html: '<div style="background:#f87171;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 18px #f87171;"></div>' });
    const destI = L.divIcon({ className: 'custom-icon', html: '<div style="background:#00e68a;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 18px #00e68a;"></div>' });
    routeMarkers.push(L.marker(cfg.origin, { icon: oriI }).bindPopup('🏭 Origin').addTo(routeMap));
    routeMarkers.push(L.marker(cfg.dest, { icon: destI }).bindPopup('🏗️ Destination').addTo(routeMap));
    routeLine = L.polyline([cfg.origin, ...cfg.waypoints, cfg.dest], { color: '#38bdf8', weight: 5 }).addTo(routeMap);
    routeMap.fitBounds(routeLine.getBounds().pad(0.2));
    updateRouteStats(idx);
}

function updateRouteStats(idx) {
    const cfg = routeConfigs[idx];
    const load = parseInt(document.getElementById('route-load')?.value) || 50;
    const costMult = load / 50;
    const stats = document.getElementById('route-stats');
    if (!stats) return;
    const vals = stats.querySelectorAll('.stat-val');
    if (vals[0]) vals[0].textContent = cfg.dist;
    if (vals[1]) vals[1].textContent = cfg.time;
    if (vals[2]) vals[2].textContent = '₹' + Math.round(parseInt(cfg.cost.replace(/[₹,]/g, '')) * costMult).toLocaleString();
    if (vals[3]) vals[3].textContent = (parseFloat(cfg.fuel) * costMult).toFixed(1) + ' L';
    const effFill = document.querySelector('.efficiency-fill');
    const effVal = document.querySelector('.efficiency-value');
    const eff = Math.min(99, Math.round(cfg.eff / costMult * (costMult < 1.5 ? 1.1 : 0.9)));
    if (effFill) effFill.style.width = eff + '%';
    if (effVal) effVal.textContent = eff + '%';
}

async function initCityMap() {
    if (cityGridMap) { cityGridMap.invalidateSize(); return; }
    const container = document.getElementById('city-map-canvas');
    if (!container || !container.offsetWidth) return;
    cityGridMap = L.map('city-map-canvas', { zoomControl: true }).setView([12.97, 77.59], 11);
    L.tileLayer(colorfulTileUrl, { attribution: '© OpenStreetMap' }).addTo(cityGridMap);

    // Waste zones (red)
    const wasteZones = [
        { pos: [12.95, 77.53], r: 2500, label: 'Zone 3: Heavy Mfg Belt', tons: '4,200 T/mo' },
        { pos: [12.92, 77.65], r: 1800, label: 'Zone 5: Chemical Hub', tons: '3,100 T/mo' },
        { pos: [13.02, 77.52], r: 2000, label: 'Zone 1: Steel Corridor', tons: '2,800 T/mo' },
        { pos: [12.88, 77.58], r: 1500, label: 'Zone 8: Textile Zone', tons: '1,600 T/mo' },
    ];
    // Demand zones (green)
    const demandZones = [
        { pos: [12.98, 77.68], r: 3000, label: 'D-2: Construction Cluster', tons: '5,000 T/mo' },
        { pos: [13.01, 77.55], r: 2200, label: 'D-1: Cement Works', tons: '3,400 T/mo' },
        { pos: [12.94, 77.70], r: 1800, label: 'D-3: BioEnergy Park', tons: '1,900 T/mo' },
    ];
    wasteZones.forEach(z => {
        L.circle(z.pos, { color: '#f87171', fillColor: '#f87171', fillOpacity: 0.25, radius: z.r, weight: 2 }).addTo(cityGridMap).bindPopup(`<b>🏭 ${z.label}</b><br>${z.tons}`);
    });
    demandZones.forEach(z => {
        L.circle(z.pos, { color: '#00e68a', fillColor: '#00e68a', fillOpacity: 0.2, radius: z.r, weight: 2 }).addTo(cityGridMap).bindPopup(`<b>♻️ ${z.label}</b><br>Demand: ${z.tons}`);
    });
    // Flow lines
    wasteZones.forEach((w, i) => {
        const d = demandZones[i % demandZones.length];
        L.polyline([w.pos, d.pos], { color: '#38bdf8', weight: 2, dashArray: '6,8' }).addTo(cityGridMap);
    });
    // Alert markers
    L.circleMarker([12.92, 77.65], { color: '#fbbf24', radius: 12, weight: 3, fillOpacity: 0.3, fillColor: '#fbbf24' }).addTo(cityGridMap).bindPopup('<b>⚠️ ALERT</b><br>Acidic waste idle 14 days');
    L.circleMarker([13.02, 77.52], { color: '#f87171', radius: 12, weight: 3, fillOpacity: 0.3, fillColor: '#f87171' }).addTo(cityGridMap).bindPopup('<b>🚨 EXCESS</b><br>340 tons unprocessed steel slag');

    // ===== EXPORTING INDUSTRIES (Blue Markers) =====
    const exportIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="position:relative;">
            <div style="background:#3b82f6;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.6);display:flex;align-items:center;justify-content:center;">
                <span style="transform:rotate(45deg);font-size:13px;">🏭</span>
            </div>
        </div>`,
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
    });
    const exportingIndustries = [
        { pos: [12.975, 77.545], name: 'Tata Steel Works', sector: 'Steel Manufacturing', produces: 'Slag & Fly Ash', prodVol: '1,200', consumes: 'Scrap Iron & Coal', consVol: '3,400', wants: 'Lime powder for furnace', co2: '840', landfill: '1,080', score: 88 },
        { pos: [12.955, 77.615], name: 'NTPC Thermal Plant', sector: 'Power Generation', produces: 'Bottom Ash & Gypsum', prodVol: '2,800', consumes: 'Coal & Biomass Pellets', consVol: '5,600', wants: 'Biomass briquettes, RDF', co2: '1,960', landfill: '2,520', score: 72 },
        { pos: [13.015, 77.575], name: 'Hindustan Zinc Ltd', sector: 'Non-Ferrous Metals', produces: 'Zinc Residue & Jarosite', prodVol: '640', consumes: 'Zinc Ore Concentrate', consVol: '1,200', wants: 'Sulphuric acid recovery units', co2: '448', landfill: '576', score: 81 },
        { pos: [12.935, 77.585], name: 'Reliance Petrochemicals', sector: 'Petrochemicals', produces: 'Polymer Scrap & Sludge', prodVol: '950', consumes: 'Crude Oil Derivatives', consVol: '4,800', wants: 'Recycled polymer granules', co2: '665', landfill: '855', score: 69 },
        { pos: [12.905, 77.555], name: 'JSW Cement - Kiln Unit', sector: 'Cement Manufacturing', produces: 'Ite Dust & Lite Fines', prodVol: '1,600', consumes: 'Fly Ash & Slag', consVol: '2,200', wants: 'Fly ash, blast furnace slag', co2: '1,120', landfill: '1,440', score: 92 },
        { pos: [12.960, 77.530], name: 'Bharat Forge Ltd', sector: 'Auto Components', produces: 'Metal Shavings & Mill Scale', prodVol: '420', consumes: 'Steel Billets', consVol: '1,800', wants: 'Recycled alloy ingots', co2: '294', landfill: '378', score: 85 },
        { pos: [13.005, 77.610], name: 'ACC Chemicals Division', sector: 'Chemical Processing', produces: 'Acidic Effluent Cake', prodVol: '380', consumes: 'Raw Chemicals & Solvents', consVol: '900', wants: 'Neutralizing agents, lime', co2: '266', landfill: '342', score: 74 },
        { pos: [12.890, 77.620], name: 'Arvind Textiles Mill', sector: 'Textile Manufacturing', produces: 'Fabric Offcuts & Dye Sludge', prodVol: '550', consumes: 'Raw Cotton & Synthetic Yarn', consVol: '1,400', wants: 'Recycled cotton fiber', co2: '385', landfill: '495', score: 78 },
    ];
    exportingIndustries.forEach(ind => {
        const barColor = ind.score >= 85 ? '#00e68a' : ind.score >= 70 ? '#fbbf24' : '#f87171';
        L.marker(ind.pos, { icon: exportIcon }).addTo(cityGridMap).bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:260px;max-width:300px;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                    <span style="background:#3b82f6;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;">📤 EXPORTER</span>
                    <span style="background:${barColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;">🌍 ${ind.score}/100</span>
                </div>
                <div style="font-weight:700;font-size:15px;margin-bottom:2px;">${ind.name}</div>
                <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${ind.sector}</div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:6px 0;">
                <div style="font-size:12px;margin-bottom:4px;">⚠️ <b>Produces:</b> ${ind.produces}</div>
                <div style="font-size:12px;color:#f87171;margin-bottom:6px;">   Output: <b>${ind.prodVol} T/mo</b></div>
                <div style="font-size:12px;margin-bottom:4px;">📦 <b>Consumes:</b> ${ind.consumes}</div>
                <div style="font-size:12px;color:#3b82f6;margin-bottom:6px;">   Intake: <b>${ind.consVol} T/mo</b></div>
                <div style="font-size:12px;margin-bottom:6px;">🔍 <b>Wants:</b> <i>${ind.wants}</i></div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:6px 0;">
                <div style="font-size:11px;font-weight:600;margin-bottom:4px;">🌱 Earth Contribution</div>
                <div style="font-size:11px;">CO₂ Saved: <b style="color:#00e68a;">${ind.co2} T/yr</b> · Landfill Diverted: <b style="color:#38bdf8;">${ind.landfill} T/yr</b></div>
                <div style="background:#e2e8f0;border-radius:4px;height:6px;margin-top:6px;overflow:hidden;">
                    <div style="background:${barColor};height:100%;width:${ind.score}%;border-radius:4px;transition:width 0.5s;"></div>
                </div>
            </div>
        `);
    });

    // ===== RECEIVING / REUSING INDUSTRIES (Yellow Markers) =====
    const receiveIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="position:relative;">
            <div style="background:#eab308;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 0 12px rgba(234,179,8,0.6);display:flex;align-items:center;justify-content:center;">
                <span style="transform:rotate(45deg);font-size:13px;">♻️</span>
            </div>
        </div>`,
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
    });
    const receivingIndustries = [
        { pos: [12.985, 77.670], name: 'UltraTech Cement Plant', sector: 'Cement Production', accepts: 'Fly Ash & Slag', accVol: '3,200', produces: 'Portland Cement', prodVol: '8,500', reuse: 'Fly Ash → Cement Additive', co2: '2,240', landfill: '2,880', score: 95 },
        { pos: [13.020, 77.545], name: 'NexGen Road Builders', sector: 'Infrastructure', accepts: 'Steel Slag & Demolition Waste', accVol: '1,800', produces: 'Road Base & Asphalt', prodVol: '4,200', reuse: 'Slag → Road Base Material', co2: '1,260', landfill: '1,620', score: 89 },
        { pos: [12.945, 77.695], name: 'EcoBricks Pvt Ltd', sector: 'Green Construction', accepts: 'Plastic Scrap & HDPE', accVol: '700', produces: 'Eco-Bricks & Pavers', prodVol: '1,100', reuse: 'Plastic Scrap → Eco-Bricks', co2: '490', landfill: '630', score: 93 },
        { pos: [12.910, 77.640], name: 'GreenPower BioEnergy', sector: 'Renewable Energy', accepts: 'Organic Sludge & Biomass', accVol: '900', produces: 'Biogas & Compost', prodVol: '600', reuse: 'Organic Sludge → Biogas Fuel', co2: '630', landfill: '810', score: 91 },
        { pos: [12.970, 77.680], name: 'Ambuja Ready-Mix', sector: 'Construction Materials', accepts: 'Gypsum &ite Fines', accVol: '1,100', produces: 'Plaster & Dry-Mix Products', prodVol: '2,800', reuse: 'Gypsum → Plaster Products', co2: '770', landfill: '990', score: 86 },
        { pos: [13.035, 77.560], name: 'Dalmia Refractories', sector: 'Refractory Industry', accepts: 'Mill Scale & Metal Oxide', accVol: '480', produces: 'Refractory Bricks & Lining', prodVol: '950', reuse: 'Metal Scale → Refractory Lining', co2: '336', landfill: '432', score: 82 },
        { pos: [12.925, 77.520], name: 'Re-Textile Co-op', sector: 'Textile Recycling', accepts: 'Fabric Offcuts & Cotton Waste', accVol: '350', produces: 'Carpet Padding & Insulation', prodVol: '500', reuse: 'Fabric Offcuts → Carpet Padding', co2: '245', landfill: '315', score: 87 },
    ];
    receivingIndustries.forEach(ind => {
        const barColor = ind.score >= 85 ? '#00e68a' : ind.score >= 70 ? '#fbbf24' : '#f87171';
        L.marker(ind.pos, { icon: receiveIcon }).addTo(cityGridMap).bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:260px;max-width:300px;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                    <span style="background:#eab308;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;">📥 RECEIVER</span>
                    <span style="background:${barColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;">🌍 ${ind.score}/100</span>
                </div>
                <div style="font-weight:700;font-size:15px;margin-bottom:2px;">${ind.name}</div>
                <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${ind.sector}</div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:6px 0;">
                <div style="font-size:12px;margin-bottom:4px;">📥 <b>Accepts:</b> ${ind.accepts}</div>
                <div style="font-size:12px;color:#eab308;margin-bottom:6px;">   Intake: <b>${ind.accVol} T/mo</b></div>
                <div style="font-size:12px;margin-bottom:4px;">📦 <b>Produces:</b> ${ind.produces}</div>
                <div style="font-size:12px;color:#00e68a;margin-bottom:6px;">   Output: <b>${ind.prodVol} T/mo</b></div>
                <div style="font-size:12px;margin-bottom:6px;">🔄 <b>Reuse:</b> <i>${ind.reuse}</i></div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:6px 0;">
                <div style="font-size:11px;font-weight:600;margin-bottom:4px;">🌱 Earth Contribution</div>
                <div style="font-size:11px;">CO₂ Saved: <b style="color:#00e68a;">${ind.co2} T/yr</b> · Landfill Diverted: <b style="color:#38bdf8;">${ind.landfill} T/yr</b></div>
                <div style="background:#e2e8f0;border-radius:4px;height:6px;margin-top:6px;overflow:hidden;">
                    <div style="background:${barColor};height:100%;width:${ind.score}%;border-radius:4px;transition:width 0.5s;"></div>
                </div>
            </div>
        `);
    });

    // Draw supply-chain lines from exporters to receivers
    exportingIndustries.forEach((exp, i) => {
        const rec = receivingIndustries[i % receivingIndustries.length];
        L.polyline([exp.pos, rec.pos], { color: '#a78bfa', weight: 1.5, dashArray: '4,6', opacity: 0.5 }).addTo(cityGridMap);
    });

    // --- Add REAL Registered Businesses to Urban Grid ---
    try {
        const usersRes = await fetch(`${API_URL}/api/users`);
        const users = await usersRes.json();
        const bizRes = await fetch(`${API_URL}/api/bizdata`);
        const allBiz = await bizRes.json();

        users.forEach(u => {
            const data = allBiz[u.username];
            if (data && data.lat) {
                const liveIcon = L.divIcon({ className: 'custom-icon', html: '<div style="background:#fbbf24;width:24px;height:24px;border-radius:50%;border:4px solid #fff;box-shadow:0 0 20px #fbbf24;z-index:9999;display:flex;align-items:center;justify-content:center;"><i class="fas fa-bolt" style="font-size:12px;color:#0f172a;"></i></div>' });
                L.marker([data.lat, data.lng], { icon: liveIcon, zIndexOffset: 1000 }).addTo(cityGridMap).bindPopup(`
                    <div style="font-family:Inter,sans-serif;min-width:240px;color:#000;">
                        <span style="background:var(--neon-green);color:#0f172a;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:6px;display:inline-block;">● LIVE NETWORK NODE</span>
                        <div style="font-weight:700;font-size:15px;margin-bottom:8px;">${u.businessName}</div>
                        <div style="font-size:12px;margin-bottom:4px;">📤 <b>Exported:</b> ${data.waste || 0} Tons</div>
                        <div style="font-size:12px;margin-bottom:4px;">📥 <b>Imported:</b> ${data.imported || 0} Tons</div>
                        <div style="font-size:12px;color:#fbbf24;margin-bottom:6px;">🪙 <b>Credits:</b> ${data.carbonCredits || 0}</div>
                        <hr style="border:none;border-top:1px solid #e2e8f0;margin:6px 0;">
                        <div style="font-size:11px;">Network Value generated: <b>₹${((data.revenue || 0) + (data.importSavings || 0)).toLocaleString()}</b></div>
                    </div>
                `).openPopup();
                L.polyline([[data.lat, data.lng], receivingIndustries[0].pos], { color: '#fbbf24', weight: 4, dashArray: '10,10', opacity: 0.9 }).addTo(cityGridMap);
            }
        });
    } catch (e) { }
}

// ===== DYNAMIC REAL-TIME DATA TICKER =====
function startLiveDataTicker() {
    setInterval(() => {
        // Randomly update KPI trends
        document.querySelectorAll('.kpi-trend').forEach(el => {
            if (el.closest('#biz-kpi-row')) return; // skip business KPIs
            const v = (Math.random() * 5 + 8).toFixed(1);
            el.innerHTML = `<i class="fas fa-arrow-up"></i> ${v}%`;
        });
        // Update fleet ETAs
        document.querySelectorAll('.fleet-eta').forEach((el, i) => {
            if (i === 0) el.textContent = 'ETA: ' + Math.round(Math.random() * 20 + 5) + ' min';
            if (i === 1) el.textContent = 'Depart: ' + Math.round(Math.random() * 15 + 2) + ' min';
        });
    }, 5000);
}

// ===== BUSINESS PANEL LOGIC =====
const companyDatabase = {
    plastic: [
        { name: 'Road Construction Co.', detail: 'Uses plastic for road surfacing', icon: '🛤️', pricePerTon: 8500, lat: 12.9352, lng: 77.6245 },
        { name: 'EcoBricks Pvt Ltd', detail: 'Converts plastic to eco-bricks', icon: '🧱', pricePerTon: 7200, lat: 13.0827, lng: 77.5877 },
        { name: 'RecycleMax Industries', detail: 'Recycles into pellets', icon: '♻️', pricePerTon: 6800, lat: 12.8456, lng: 77.6632 },
    ],
    metal: [
        { name: 'Cement Works Ltd', detail: 'Uses metal slag in cement', icon: '🏗️', pricePerTon: 12000, lat: 13.1986, lng: 77.7066 },
        { name: 'Steel Recyclers India', detail: 'Re-smelts metal scrap', icon: '🔩', pricePerTon: 15000, lat: 12.7409, lng: 77.4872 },
        { name: 'AutoParts Reman Co.', detail: 'Remanufactures auto parts', icon: '🚗', pricePerTon: 11000, lat: 13.0358, lng: 77.5970 },
    ],
    chemical: [
        { name: 'ChemTreat Solutions', detail: 'Reprocesses chemicals', icon: '🧪', pricePerTon: 5500, lat: 12.9081, lng: 77.6476 },
        { name: 'GreenChem Recyclers', detail: 'Extracts valuable compounds', icon: '⚗️', pricePerTon: 6200, lat: 13.1631, lng: 77.5025 },
    ],
    flyash: [
        { name: 'UltraTech Cement', detail: 'Fly ash as cement additive', icon: '🏭', pricePerTon: 4200, lat: 12.6550, lng: 77.5589 },
        { name: 'EcoBricks Pvt Ltd', detail: 'Fly ash bricks maker', icon: '🧱', pricePerTon: 3800, lat: 13.0827, lng: 77.5877 },
        { name: 'Dalmia Bharat Cement', detail: 'Bulk fly ash consumer', icon: '🏗️', pricePerTon: 4000, lat: 13.3379, lng: 77.1173 },
    ],
    organic: [
        { name: 'BioGas Energy Hub', detail: 'Converts to biogas', icon: '⚡', pricePerTon: 3500, lat: 12.9141, lng: 77.6460 },
        { name: 'CompostKing Farms', detail: 'Premium compost', icon: '🌱', pricePerTon: 2800, lat: 13.1070, lng: 77.8045 },
        { name: 'GreenFertilizer Co.', detail: 'Bio-fertilizer mfg', icon: '🌿', pricePerTon: 3200, lat: 12.7800, lng: 77.3914 },
    ],
    ewaste: [
        { name: 'TechRecycle India', detail: 'Extracts precious metals', icon: '💎', pricePerTon: 45000, lat: 12.8339, lng: 77.6828 },
        { name: 'CircuitBoard Recyclers', detail: 'Recovers copper & rare earths', icon: '🔧', pricePerTon: 38000, lat: 13.0650, lng: 77.5282 },
    ],
    textile: [
        { name: 'EcoFiber Recyclers', detail: 'Recycled yarn & fiber', icon: '🧶', pricePerTon: 5500, lat: 12.9698, lng: 77.7500 },
        { name: 'InsulaTex Co.', detail: 'Insulation from textile', icon: '🏠', pricePerTon: 4800, lat: 13.2050, lng: 77.6314 },
        { name: 'Re-Textile Co-op', detail: 'Carpet padding & cloth', icon: '🧵', pricePerTon: 4200, lat: 12.8900, lng: 77.4522 },
    ],
    rubber: [
        { name: 'PlaySafe Surfaces', detail: 'Playground surfaces', icon: '🏫', pricePerTon: 7800, lat: 12.9716, lng: 77.5946 },
        { name: 'AsphaltMix Corp', detail: 'Rubber-modified asphalt', icon: '🛤️', pricePerTon: 6500, lat: 12.8535, lng: 77.5300 },
    ],
};

const co2PerTon = { plastic: 1800, metal: 2500, chemical: 900, flyash: 600, organic: 400, ewaste: 3200, textile: 1200, rubber: 1500 };

let bizTickerInterval = null;
let selectedCompany = null;
let currentBizWaste = null;

function loadBizDashboard() {
    if (!currentUser || currentUser.role !== 'business') return;
    const data = getBizData(currentUser.username);
    document.getElementById('biz-revenue-val').textContent = '₹' + data.revenue.toLocaleString();
    document.getElementById('biz-co2-val').textContent = data.co2.toLocaleString();
    document.getElementById('biz-waste-val').textContent = data.waste.toLocaleString();
    document.getElementById('biz-imported-val').textContent = data.imported.toLocaleString();
    document.getElementById('biz-savings-val').textContent = '₹' + data.importSavings.toLocaleString();
    document.getElementById('biz-match-val').textContent = data.matches.toLocaleString();
    initBizPanel();
    initBizImportPanel();
    if (data.revenue > 0 || data.importSavings > 0) startBizGrowthTicker();
    loadBizLocation();
}

function initBizPanel() {
    const form = document.getElementById('biz-waste-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('biz-waste-type').value;
        const qty = parseFloat(document.getElementById('biz-waste-qty').value) || 0;
        const desc = document.getElementById('biz-waste-desc').value;
        if (!type || qty <= 0) return;

        currentBizWaste = { type, qty, desc };
        selectedCompany = null;

        const btn = document.getElementById('biz-submit-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Companies...';
        btn.disabled = true;

        setTimeout(() => {
            showCompanySuggestions(type, qty);
            btn.innerHTML = '<i class="fas fa-search"></i> Find Matching Companies';
            btn.disabled = false;
        }, 1200);
    });

    document.getElementById('biz-confirm-btn').addEventListener('click', () => {
        if (!selectedCompany || !currentBizWaste) return;
        confirmExport();
    });
}

function showCompanySuggestions(type, qty) {
    const suggestions = document.getElementById('biz-suggestions');
    const intro = document.getElementById('biz-suggest-intro');
    const list = document.getElementById('biz-company-list');
    const confirmBtn = document.getElementById('biz-confirm-btn');

    const companies = companyDatabase[type] || [];
    if (!companies.length) {
        intro.textContent = 'No matching companies found for this waste type.';
        list.innerHTML = '';
        suggestions.classList.remove('hidden');
        confirmBtn.style.display = 'none';
        return;
    }

    intro.innerHTML = `<i class="fas fa-robot" style="color:var(--neon-green)"></i> We found <strong>${companies.length} companies</strong> interested in your <strong>${qty} tons of ${type} waste</strong>. Select a company to export:`;

    list.innerHTML = companies.map((c, i) => `
        <div class="biz-company-card" data-idx="${i}" onclick="selectCompany(${i}, '${type}')">
            <div class="biz-company-icon">${c.icon}</div>
            <div class="biz-company-info">
                <span class="biz-company-name">${c.name}</span>
                <span class="biz-company-detail">${c.detail}</span>
            </div>
            <span class="biz-company-price">₹${(c.pricePerTon * qty).toLocaleString()}</span>
        </div>
    `).join('');

    suggestions.classList.remove('hidden');
    confirmBtn.style.display = 'none';
}

function selectCompany(idx, type) {
    const companies = companyDatabase[type] || [];
    selectedCompany = companies[idx];
    // Highlight selected
    document.querySelectorAll('#biz-company-list .biz-company-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`#biz-company-list .biz-company-card[data-idx="${idx}"]`).classList.add('selected');
    document.getElementById('biz-confirm-btn').style.display = '';
    // Show route map
    showRouteMap('biz-export-map', 'biz-export-distance', selectedCompany);
}

window.showToast = function(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#064e3b' : type === 'error' ? '#7f1d1d' : '#1e3a8a'};
        color: white;
        border: 1px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        min-width: 300px;
        pointer-events: auto;
        transform: translateX(120%);
        transition: transform 0.3s ease-out;
    `;
    let icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    let iconColor = type === 'success' ? 'var(--neon-green)' : type === 'error' ? 'var(--neon-amber)' : 'var(--neon-blue)';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
            <i class="fas ${icon}" style="color: ${iconColor}; font-size: 1.5rem; margin-top: 2px;"></i>
            <div>
                <h4 style="margin: 0 0 5px 0; font-size: 16px;">${title}</h4>
                <p style="margin: 0; font-size: 13px; color: #cbd5e1;">${message}</p>
            </div>
        </div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 50);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 5000);
}

function confirmExport() {
    const qty = currentBizWaste.qty;
    const type = currentBizWaste.type;
    
    const tx = {
        id: Date.now(),
        sourceName: currentUser.businessName,
        sourceUser: currentUser.username,
        receiverName: selectedCompany.name,
        material: type,
        qty: qty,
        location: 'Bangalore Industrial Area',
        status: 'pending',
        txType: 'export',
        companyData: selectedCompany,
        qualityScore: Math.floor(Math.random() * 20) + 80,
        corrosionCheck: Math.random() > 0.5 ? 'Pass' : 'Minor traces'
    };

    fetch(`${API_URL}/api/transactions`)
        .then(res => res.json())
        .then(txs => {
            txs.push(tx);
            return fetch(`${API_URL}/api/transactions`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(txs) });
        })
        .catch(e => { mediatorTransactions.push(tx); });

    document.getElementById('biz-suggestions').classList.add('hidden');
    document.getElementById('biz-results-pending').classList.remove('hidden');
    
    showToast('Sent for Verification', 'Your export request has been added to the Mediator Queue.', 'success');

    setTimeout(() => {
        document.getElementById('biz-waste-form').reset();
    }, 1000);
}

window.executePendingExport = async function(tx) {
    const qty = tx.qty;
    const type = tx.material;
    const selectedCompany = tx.companyData;
    const revenue = selectedCompany.pricePerTon * qty;
    const co2Saved = (co2PerTon[type] || 1000) * qty;

    try {
        const res = await fetch(`${API_URL}/api/bizdata/${tx.sourceUser}`);
        const data = await res.json();

        data.revenue += revenue;
        data.co2 += co2Saved;
        data.waste += qty;
        data.matches += 1;
        if(!data.activities) data.activities = [];
        data.activities.unshift({
            type: 'export',
            title: 'Exported ' + type.charAt(0).toUpperCase() + type.slice(1),
            detail: qty + ' tons verified by Mediator & matched via WIN',
            time: 'Just now',
            icon: '<i class="fas fa-arrow-circle-up"></i>',
            material: type.charAt(0).toUpperCase() + type.slice(1),
            qty: qty,
            partner: selectedCompany.name,
            profit: revenue
        });

        await fetch(`${API_URL}/api/bizdata/${tx.sourceUser}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    } catch(e) { console.error("Failed to execute pending export data for user", e); }
}

function animateValue(elId, start, end, duration, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    const el = document.getElementById(elId);
    if (!el) return;
    const range = end - start;
    const startTime = performance.now();
    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + range * eased);
        el.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function startBizGrowthTicker() {
    if (bizTickerInterval) clearInterval(bizTickerInterval);
    bizTickerInterval = setInterval(() => {
        if (!currentUser || currentUser.role !== 'business') { clearInterval(bizTickerInterval); return; }
        const data = getBizData(currentUser.username);
        if (data.revenue <= 0 && data.importSavings <= 0) return;
        // Small increments to simulate ongoing growth
        if (data.revenue > 0) {
            const revInc = Math.round(data.revenue * 0.001 + Math.random() * 50);
            data.revenue += revInc;
            document.getElementById('biz-revenue-val').textContent = '₹' + data.revenue.toLocaleString();
        }
        if (data.co2 > 0) {
            const co2Inc = Math.round(data.co2 * 0.0005 + Math.random() * 5);
            data.co2 += co2Inc;
            document.getElementById('biz-co2-val').textContent = data.co2.toLocaleString();
        }
        if (data.importSavings > 0) {
            const savInc = Math.round(data.importSavings * 0.0008 + Math.random() * 30);
            data.importSavings += savInc;
            document.getElementById('biz-savings-val').textContent = '₹' + data.importSavings.toLocaleString();
        }
        if (data.importCo2 > 0) {
            const ico2Inc = Math.round(data.importCo2 * 0.0004 + Math.random() * 3);
            data.importCo2 += ico2Inc;
        }
        saveBizData(currentUser.username, data);
    }, 3000);
}

// ===== TAB SWITCHER =====
function switchBizTab(tab) {
    const exportSection = document.getElementById('biz-export-section');
    const importSection = document.getElementById('biz-import-section');
    const activitySection = document.getElementById('biz-activity-section');
    const exportTab = document.getElementById('biz-tab-export');
    const importTab = document.getElementById('biz-tab-import');
    const activityTab = document.getElementById('biz-tab-activity');
    const exportResults = document.getElementById('biz-results');
    const importResults = document.getElementById('biz-import-results');
    const carbonSection = document.getElementById('biz-carbon-section');
    const carbonTab = document.getElementById('biz-tab-carbon');

    exportSection.style.display = 'none';
    importSection.style.display = 'none';
    if(activitySection) activitySection.style.display = 'none';
    if(carbonSection) carbonSection.style.display = 'none';
    exportTab.classList.remove('active');
    importTab.classList.remove('active');
    if(activityTab) activityTab.classList.remove('active');
    if(carbonTab) carbonTab.classList.remove('active');
    exportResults.classList.add('hidden');
    importResults.classList.add('hidden');

    if (tab === 'export') {
        exportSection.style.display = '';
        exportTab.classList.add('active');
    } else if (tab === 'import') {
        importSection.style.display = '';
        importTab.classList.add('active');
    } else if (tab === 'activity') {
        if(activitySection) activitySection.style.display = '';
        if(activityTab) activityTab.classList.add('active');
        renderActivityDashboard('biz-activity-content', currentUser.businessName);
    } else if (tab === 'carbon') {
        if(carbonSection) carbonSection.style.display = '';
        if(carbonTab) carbonTab.classList.add('active');
        updateCarbonUI();
        loadMarketplace();
    }
}

// ===== IMPORT PANEL LOGIC =====
const supplierDatabase = {
    plastic: [
        { name: 'Tata Polymers', detail: 'HDPE & LDPE scrap', icon: '♻️', pricePerTon: 5200, rawPrice: 14000, lat: 12.9550, lng: 77.3500 },
        { name: 'Reliance Petrochemicals', detail: 'Polymer scrap & offcuts', icon: '🏭', pricePerTon: 4800, rawPrice: 14000, lat: 19.0760, lng: 72.8777 },
        { name: 'RecycleMax Industries', detail: 'Cleaned plastic granules', icon: '📦', pricePerTon: 6000, rawPrice: 14000, lat: 12.8456, lng: 77.6632 },
    ],
    metal: [
        { name: 'JSW Steel Works', detail: 'Steel slag & mill scale', icon: '🔩', pricePerTon: 8500, rawPrice: 25000, lat: 15.4167, lng: 73.9833 },
        { name: 'Bharat Forge Ltd', detail: 'Metal shavings & turnings', icon: '⚙️', pricePerTon: 9200, rawPrice: 25000, lat: 18.5204, lng: 73.8567 },
        { name: 'Hindustan Zinc Ltd', detail: 'Zinc residue & alloy scrap', icon: '🏭', pricePerTon: 7800, rawPrice: 22000, lat: 24.5854, lng: 73.7125 },
    ],
    chemical: [
        { name: 'ChemCorp India', detail: 'Sulfuric acid residue', icon: '🧪', pricePerTon: 3200, rawPrice: 12000, lat: 12.9081, lng: 77.6476 },
        { name: 'ACC Chemicals', detail: 'Chemical byproduct cake', icon: '⚗️', pricePerTon: 2800, rawPrice: 11000, lat: 19.2183, lng: 72.9781 },
    ],
    flyash: [
        { name: 'NTPC Thermal Plant', detail: 'Grade A fly ash', icon: '🏭', pricePerTon: 1800, rawPrice: 6500, lat: 14.4426, lng: 79.9865 },
        { name: 'Adani Power Plant', detail: 'Bottom ash & gypsum', icon: '⚡', pricePerTon: 1500, rawPrice: 6500, lat: 22.4707, lng: 70.0577 },
        { name: 'Tata Power Unit 12', detail: 'Fly ash — bulk', icon: '🏗️', pricePerTon: 2000, rawPrice: 6500, lat: 19.0760, lng: 72.8777 },
    ],
    organic: [
        { name: 'ITC Foods', detail: 'Food sludge & peels', icon: '🌿', pricePerTon: 1200, rawPrice: 4500, lat: 13.0827, lng: 77.5877 },
        { name: 'Amul Dairy', detail: 'Whey waste & residue', icon: '🥛', pricePerTon: 1000, rawPrice: 4000, lat: 22.3072, lng: 72.4190 },
    ],
    ewaste: [
        { name: 'Infosys Campus', detail: 'Circuit boards & scrap', icon: '💻', pricePerTon: 22000, rawPrice: 65000, lat: 12.8440, lng: 77.6602 },
        { name: 'Wipro Tech Park', detail: 'Server parts & cable', icon: '🖥️', pricePerTon: 18000, rawPrice: 60000, lat: 12.8399, lng: 77.6611 },
    ],
    textile: [
        { name: 'Raymond Fabrics', detail: 'Cotton mill waste', icon: '🧵', pricePerTon: 2800, rawPrice: 9000, lat: 19.0760, lng: 72.8777 },
        { name: 'Arvind Textiles', detail: 'Fabric scraps & dye sludge', icon: '🧶', pricePerTon: 2500, rawPrice: 8500, lat: 23.0225, lng: 72.5714 },
    ],
    rubber: [
        { name: 'MRF Tire Plant', detail: 'Tire rubber crumbs', icon: '⚫', pricePerTon: 4200, rawPrice: 12000, lat: 13.0827, lng: 80.2707 },
        { name: 'CEAT Rubber Works', detail: 'Vulcanized rubber offcuts', icon: '🏭', pricePerTon: 3800, rawPrice: 11500, lat: 18.5204, lng: 73.8567 },
    ],
};

const importCo2PerTon = { plastic: 2200, metal: 3000, chemical: 1200, flyash: 800, organic: 500, ewaste: 4000, textile: 1500, rubber: 1800 };
const waterPerTon = { plastic: 8000, metal: 12000, chemical: 5000, flyash: 2000, organic: 1500, ewaste: 6000, textile: 10000, rubber: 4000 };

let selectedImportSupplier = null;
let currentBizImport = null;

function initBizImportPanel() {
    const form = document.getElementById('biz-import-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('biz-import-type').value;
        const qty = parseFloat(document.getElementById('biz-import-qty').value) || 0;
        const desc = document.getElementById('biz-import-desc').value;
        if (!type || qty <= 0) return;

        currentBizImport = { type, qty, desc };
        selectedImportSupplier = null;

        const btn = document.getElementById('biz-import-submit-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Suppliers...';
        btn.disabled = true;

        setTimeout(() => {
            showImportSuggestions(type, qty);
            btn.innerHTML = '<i class="fas fa-search"></i> Find Suppliers';
            btn.disabled = false;
        }, 1200);
    });

    document.getElementById('biz-import-confirm-btn').addEventListener('click', () => {
        if (!selectedImportSupplier || !currentBizImport) return;
        confirmImport();
    });
}

function showImportSuggestions(type, qty) {
    const suggestions = document.getElementById('biz-import-suggestions');
    const intro = document.getElementById('biz-import-suggest-intro');
    const list = document.getElementById('biz-import-company-list');
    const confirmBtn = document.getElementById('biz-import-confirm-btn');

    const suppliers = supplierDatabase[type] || [];
    if (!suppliers.length) {
        intro.textContent = 'No suppliers found for this material.';
        list.innerHTML = '';
        suggestions.classList.remove('hidden');
        confirmBtn.style.display = 'none';
        return;
    }

    intro.innerHTML = `<i class="fas fa-robot" style="color:var(--neon-blue)"></i> Found <strong>${suppliers.length} suppliers</strong> for <strong>${qty} tons of ${type}</strong>. Recycled price vs raw material savings shown:`;

    list.innerHTML = suppliers.map((s, i) => {
        const cost = s.pricePerTon * qty;
        const rawCost = s.rawPrice * qty;
        const saving = rawCost - cost;
        return `
        <div class="biz-company-card" data-idx="${i}" onclick="selectImportSupplier(${i}, '${type}')">
            <div class="biz-company-icon">${s.icon}</div>
            <div class="biz-company-info">
                <span class="biz-company-name">${s.name}</span>
                <span class="biz-company-detail">${s.detail}</span>
                <span class="biz-company-detail" style="color:var(--neon-green)">You save ₹${saving.toLocaleString()} vs raw material</span>
            </div>
            <span class="biz-company-price">₹${cost.toLocaleString()}</span>
        </div>
    `;
    }).join('');

    suggestions.classList.remove('hidden');
    confirmBtn.style.display = 'none';
}

function selectImportSupplier(idx, type) {
    const suppliers = supplierDatabase[type] || [];
    selectedImportSupplier = suppliers[idx];
    document.querySelectorAll('#biz-import-company-list .biz-company-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`#biz-import-company-list .biz-company-card[data-idx="${idx}"]`).classList.add('selected');
    document.getElementById('biz-import-confirm-btn').style.display = '';
    // Show route map
    showRouteMap('biz-import-map', 'biz-import-distance', selectedImportSupplier);
}

function confirmImport() {
    const qty = currentBizImport.qty;
    const type = currentBizImport.type;

    const tx = {
        id: Date.now(),
        sourceName: selectedImportSupplier.name,
        receiverUser: currentUser.username,
        receiverName: currentUser.businessName,
        material: type,
        qty: qty,
        location: 'Bangalore Industrial Area',
        status: 'pending',
        txType: 'import',
        companyData: selectedImportSupplier,
        qualityScore: Math.floor(Math.random() * 20) + 80,
        corrosionCheck: Math.random() > 0.5 ? 'Pass' : 'Minor traces'
    };

    fetch(`${API_URL}/api/transactions`)
        .then(res => res.json())
        .then(txs => {
            txs.push(tx);
            return fetch(`${API_URL}/api/transactions`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(txs) });
        })
        .catch(e => { mediatorTransactions.push(tx); });

    document.getElementById('biz-import-suggestions').classList.add('hidden');
    document.getElementById('biz-import-results-pending').classList.remove('hidden');

    showToast('Sent for Verification', 'Your import request is pending approval from the Mediator.', 'success');

    setTimeout(() => {
        document.getElementById('biz-import-form').reset();
    }, 1000);
}

window.executePendingImport = async function(tx) {
    const qty = tx.qty;
    const type = tx.material;
    const selectedImportSupplier = tx.companyData;
    const cost = selectedImportSupplier.pricePerTon * qty;
    const rawCost = selectedImportSupplier.rawPrice * qty;
    const savings = rawCost - cost;
    const co2Saved = (importCo2PerTon[type] || 1500) * qty;
    const waterSaved = (waterPerTon[type] || 5000) * qty;

    try {
        const res = await fetch(`${API_URL}/api/bizdata/${tx.receiverUser}`);
        const data = await res.json();

        data.imported += qty;
        data.importSavings += savings;
        data.importCo2 += co2Saved;
        data.co2 += co2Saved;
        data.matches += 1;
        if(!data.activities) data.activities = [];
        data.activities.unshift({
            type: 'import',
            title: 'Imported ' + type.charAt(0).toUpperCase() + type.slice(1),
            detail: qty + ' tons verified by Mediator & sourced via WIN',
            time: 'Just now',
            icon: '<i class="fas fa-arrow-circle-down"></i>',
            material: type.charAt(0).toUpperCase() + type.slice(1),
            qty: qty,
            partner: selectedImportSupplier.name,
            profit: savings
        });

        await fetch(`${API_URL}/api/bizdata/${tx.receiverUser}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    } catch(e) { console.error("Failed to execute pending import data", e); }
}

// ===== GEOLOCATION & BUSINESS MAP =====
let bizLocation = null;
let bizMyMap = null;
let bizMyMarker = null;
let bizExportMap = null;
let bizImportMap = null;

function detectBizLocation() {
    const addr = document.getElementById('biz-loc-address');
    addr.textContent = 'Detecting...';
    if (!navigator.geolocation) {
        addr.textContent = 'Geolocation not supported. Please enter manually.';
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            bizLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            saveBizLocation();
            updateBizLocationUI();
            reverseGeocode(bizLocation.lat, bizLocation.lng);
        },
        (err) => {
            // Fallback to Bangalore center if denied
            bizLocation = { lat: 12.9716, lng: 77.5946 };
            saveBizLocation();
            updateBizLocationUI();
            addr.textContent = `${bizLocation.lat.toFixed(4)}, ${bizLocation.lng.toFixed(4)} (Default - Bangalore)`;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function reverseGeocode(lat, lng) {
    const addr = document.getElementById('biz-loc-address');
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`)
        .then(r => r.json())
        .then(data => {
            if (data && data.display_name) {
                const short = data.display_name.split(',').slice(0, 3).join(', ');
                addr.textContent = short;
            } else {
                addr.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
        })
        .catch(() => {
            addr.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        });
}

function toggleManualLocation() {
    const el = document.getElementById('biz-loc-manual-input');
    el.classList.toggle('hidden');
}

function saveManualLocation() {
    const lat = parseFloat(document.getElementById('biz-loc-lat').value);
    const lng = parseFloat(document.getElementById('biz-loc-lng').value);
    if (isNaN(lat) || isNaN(lng)) { alert('Please enter valid coordinates.'); return; }
    bizLocation = { lat, lng };
    saveBizLocation();
    updateBizLocationUI();
    document.getElementById('biz-loc-address').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    document.getElementById('biz-loc-manual-input').classList.add('hidden');
    reverseGeocode(lat, lng);
}

function saveBizLocation() {
    if (currentUser && bizLocation) {
        const data = getBizData(currentUser.username);
        data.lat = bizLocation.lat;
        data.lng = bizLocation.lng;
        saveBizData(currentUser.username, data);
    }
}

function loadBizLocation() {
    if (!currentUser) return;
    const data = getBizData(currentUser.username);
    if (data.lat && data.lng) {
        bizLocation = { lat: data.lat, lng: data.lng };
        updateBizLocationUI();
        reverseGeocode(data.lat, data.lng);
    } else {
        detectBizLocation();
    }
}

function updateBizLocationUI() {
    if (!bizLocation) return;
    // Init or update the mini-map
    setTimeout(() => {
        const container = document.getElementById('biz-my-map');
        if (!container) return;
        if (bizMyMap) { bizMyMap.remove(); bizMyMap = null; }
        bizMyMap = L.map('biz-my-map', { zoomControl: false }).setView([bizLocation.lat, bizLocation.lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OSM'
        }).addTo(bizMyMap);
        const greenIcon = L.divIcon({
            html: '<div style="background:#00e68a;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,230,138,0.6);"></div>',
            iconSize: [18, 18], className: ''
        });
        bizMyMarker = L.marker([bizLocation.lat, bizLocation.lng], { icon: greenIcon })
            .addTo(bizMyMap)
            .bindPopup(`<b>${currentUser.businessName}</b><br>Your Location`);
    }, 300);
}

// ===== ROUTE MAP FOR EXPORT/IMPORT =====
function showRouteMap(mapId, distanceId, company) {
    if (!bizLocation || !company.lat) return;
    const container = document.getElementById(mapId);
    if (!container) return;

    // Destroy old map
    if (mapId === 'biz-export-map' && bizExportMap) { bizExportMap.remove(); bizExportMap = null; }
    if (mapId === 'biz-import-map' && bizImportMap) { bizImportMap.remove(); bizImportMap = null; }

    setTimeout(() => {
        const map = L.map(mapId, { zoomControl: false });
        if (mapId === 'biz-export-map') bizExportMap = map;
        else bizImportMap = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);

        const greenIcon = L.divIcon({
            html: '<div style="background:#00e68a;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,230,138,0.5);"></div>',
            iconSize: [14, 14], className: ''
        });
        const blueIcon = L.divIcon({
            html: '<div style="background:#38bdf8;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(56,189,248,0.5);"></div>',
            iconSize: [14, 14], className: ''
        });

        L.marker([bizLocation.lat, bizLocation.lng], { icon: greenIcon })
            .addTo(map).bindPopup(`<b>Your Business</b>`);
        L.marker([company.lat, company.lng], { icon: blueIcon })
            .addTo(map).bindPopup(`<b>${company.name}</b><br>${company.detail}`);

        // Draw dashed line
        L.polyline([
            [bizLocation.lat, bizLocation.lng],
            [company.lat, company.lng]
        ], { color: '#00e68a', weight: 3, dashArray: '8, 8', opacity: 0.8 }).addTo(map);

        // Fit bounds
        const bounds = L.latLngBounds([
            [bizLocation.lat, bizLocation.lng],
            [company.lat, company.lng]
        ]);
        map.fitBounds(bounds, { padding: [30, 30] });

        // Calculate distance
        const dist = calcDistance(bizLocation.lat, bizLocation.lng, company.lat, company.lng);
        const distEl = document.getElementById(distanceId);
        if (distEl) {
            distEl.innerHTML = `<i class="fas fa-route"></i> Distance: <strong>${dist.toFixed(1)} km</strong> &nbsp;|&nbsp; <i class="fas fa-clock"></i> Est. Travel: <strong>${Math.round(dist / 40 * 60)} min</strong> by road`;
        }
    }, 200);
}

function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===== CERTIFICATE =====
let lastCertType = 'export';

function showCertificate(type) {
    lastCertType = type;
    const overlay = document.getElementById('cert-overlay');
    const data = getBizData(currentUser.username);
    const now = new Date();

    document.getElementById('cert-biz-name').textContent = currentUser.businessName;
    document.getElementById('cert-date').textContent = 'Issued: ' + now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('cert-id').textContent = 'Certificate ID: WIN-' + now.getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    if (type === 'export') {
        document.getElementById('cert-desc').textContent =
            `For responsibly exporting ${data.waste} tons of industrial waste, generating ₹${data.revenue.toLocaleString()} in circular economy revenue, and saving ${data.co2.toLocaleString()} kg of CO₂ emissions.`;
        document.getElementById('cert-stats').innerHTML = `
            <div class="cert-stat"><span class="cert-stat-val">${data.waste}</span><span class="cert-stat-label">Tons Exported</span></div>
            <div class="cert-stat"><span class="cert-stat-val">₹${data.revenue.toLocaleString()}</span><span class="cert-stat-label">Revenue Earned</span></div>
            <div class="cert-stat"><span class="cert-stat-val">${data.co2.toLocaleString()} kg</span><span class="cert-stat-label">CO₂ Saved</span></div>
        `;
    } else {
        document.getElementById('cert-desc').textContent =
            `For importing ${data.imported} tons of recycled material instead of raw resources, saving ₹${data.importSavings.toLocaleString()} and preventing ${(data.importCo2 || 0).toLocaleString()} kg of CO₂.`;
        document.getElementById('cert-stats').innerHTML = `
            <div class="cert-stat"><span class="cert-stat-val">${data.imported}</span><span class="cert-stat-label">Tons Imported</span></div>
            <div class="cert-stat"><span class="cert-stat-val">₹${data.importSavings.toLocaleString()}</span><span class="cert-stat-label">Cost Saved</span></div>
            <div class="cert-stat"><span class="cert-stat-val">${(data.importCo2 || 0).toLocaleString()} kg</span><span class="cert-stat-label">CO₂ Prevented</span></div>
        `;
    }

    overlay.classList.remove('hidden');
}

function closeCertificate() {
    document.getElementById('cert-overlay').classList.add('hidden');
}

function downloadCertificate() {
    const certEl = document.getElementById('cert-content');
    const btn = document.querySelector('.cert-download-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    html2canvas(certEl, {
        scale: 2,
        backgroundColor: '#fffef5',
        useCORS: true,
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `WIN_Certificate_${currentUser.businessName.replace(/\s+/g, '_')}_${lastCertType}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.innerHTML = '<i class="fas fa-download"></i> Download as Image';
        btn.disabled = false;
    }).catch(() => {
        btn.innerHTML = '<i class="fas fa-download"></i> Download as Image';
        btn.disabled = false;
        alert('Download failed. Please try again.');
    });
}

// ===== ACTIVITY DASHBOARD MOCK DATA & RENDER =====
function generateMockActivity(companyName) {
    const actions = ['export', 'import', 'view'];
    const views = [
        'Looking for 100 tons Plastic Waste', 'Sourcing Metal Scrap', 'Chemical Supplier Check', 'Compliance Verification', 'Competitor Analysis'
    ];
    const materials = ['Plastic', 'Steel', 'Chemicals', 'Fly Ash', 'E-Waste'];
    const timeframes = ['Just now', '2 hours ago', 'Yesterday', '3 days ago', 'Last week'];
    
    let activities = [];
    for(let i = 0; i < 8; i++) {
        let type = actions[Math.floor(Math.random() * actions.length)];
        let time = timeframes[Math.floor(Math.random() * timeframes.length)];
        if (type === 'view') {
            activities.push({
                type: 'view',
                title: 'Profile Viewed',
                detail: views[Math.floor(Math.random() * views.length)],
                time: time,
                icon: '<i class="fas fa-eye"></i>'
            });
        } else if (type === 'export') {
            activities.push({
                type: 'export',
                title: 'Exported ' + materials[Math.floor(Math.random() * materials.length)],
                detail: Math.floor(Math.random() * 50 + 10) + ' tons matched via WIN',
                time: time,
                icon: '<i class="fas fa-arrow-circle-up"></i>'
            });
        } else {
            activities.push({
                type: 'import',
                title: 'Imported ' + materials[Math.floor(Math.random() * materials.length)],
                detail: Math.floor(Math.random() * 100 + 20) + ' tons sourced via WIN',
                time: time,
                icon: '<i class="fas fa-arrow-circle-down"></i>'
            });
        }
    }
    return activities;
}

async function renderActivityDashboard(containerId, companyName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let targetBizData = null;
    
    if (currentUser && currentUser.businessName.toLowerCase() === companyName.toLowerCase()) {
        targetBizData = currentBizData;
    } else {
        const users = await getRegisteredUsers();
        const targetUser = users.find(u => u.businessName.toLowerCase() === companyName.toLowerCase());
        if (targetUser) {
            targetBizData = JSON.parse(localStorage.getItem('win_biz_' + targetUser.username) || '{}');
            if(!targetBizData.activities) targetBizData.activities = [];
        }
    }
    
    const mockActivities = generateMockActivity(companyName);
    let allActivities = [];
    if (targetBizData && targetBizData.activities && targetBizData.activities.length > 0) {
        allActivities = targetBizData.activities.concat(mockActivities);
    } else {
        allActivities = mockActivities;
    }

    const exportsImports = allActivities.filter(a => a.type !== 'view');
    const views = allActivities.filter(a => a.type === 'view');
    
    // Store in global window variable for onclick reference
    window.__currentActivities = exportsImports;
    
    // Carbon Panel HTML
    let cTotal, cReduced, cCredits;
    if (targetBizData) {
        cTotal = targetBizData.emissionsTotal || 0;
        cReduced = targetBizData.emissionsReduced || 0;
        cCredits = targetBizData.carbonCredits || 0;
    } else {
        // Generate dynamic realistic values for mock companies
        const base = (companyName.length * 50) % 800 + 400; // 400 to 1200
        cTotal = base + Math.floor(Math.random() * 300);
        cReduced = Math.floor(cTotal * (Math.random() * 0.4 + 0.1)); 
        cCredits = Math.floor(Math.random() * 300 + 50); 
    }
    const cNet = Math.max(0, cTotal - cReduced);

    let carbonHTML = `
        <div class="glass-card activity-card" style="grid-column: 1 / -1; margin-bottom: 20px;">
            <h3><i class="fas fa-leaf" style="color:var(--neon-green);"></i> Environmental Footprint Overview</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 15px; text-align: center;">
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; flex: 1; min-width: 150px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Gross Emissions</div>
                    <div style="font-size: 24px; font-weight: bold; color: #e2e8f0;">${cTotal}<span style="font-size: 14px; color: #64748b; font-weight: normal;"> T</span></div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; flex: 1; min-width: 150px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Emissions Reduced</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--neon-blue);">${cReduced}<span style="font-size: 14px; color: #64748b; font-weight: normal;"> T</span></div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; flex: 1; min-width: 150px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Net Emissions</div>
                    <div style="font-size: 24px; font-weight: bold; color: ${cNet > 500 ? '#f43f5e' : '#00e68a'};">${cNet}<span style="font-size: 14px; color: #64748b; font-weight: normal;"> T</span></div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; flex: 1; min-width: 150px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 12px; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">Carbon Credits</div>
                    <div style="font-size: 24px; font-weight: bold; color: #fbbf24;">🪙 ${cCredits}</div>
                </div>
            </div>
        </div>
    `;

    let chartHTML = `
        <div class="glass-card activity-card" style="grid-column: 1 / -1; margin-bottom: 20px;">
            <h3><i class="fas fa-chart-pie" style="color:var(--neon-green);"></i> Trade Volume Overview</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: center; justify-content: center; padding: 10px;">
                <div style="position: relative; width: 200px; height: 200px;">
                    <canvas id="${containerId}-trade-chart" style="width: 100%; height: 100%;"></canvas>
                </div>
                <div id="${containerId}-trade-legend" style="display: flex; flex-direction: column; gap: 12px; font-size: 14px; min-width: 200px;"></div>
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="activity-layout">
            ${carbonHTML}
            ${chartHTML}
            <div class="glass-card activity-card">
                <h3><i class="fas fa-exchange-alt"></i> Transaction History</h3>
                <div class="activity-list">
                    ${exportsImports.length ? exportsImports.map((a, i) => `
                        <div class="activity-item clickable" onclick="showTransactionDetails(${i})">
                            <div class="activity-icon ${a.type}">${a.icon}</div>
                            <div class="activity-details">
                                <span class="activity-tag ${a.type}">${a.type.toUpperCase()}</span>
                                <span class="activity-title">${a.title}</span>
                                <span class="activity-sub">${a.detail}</span>
                            </div>
                            <span class="activity-time">${a.time}</span>
                        </div>
                    `).join('') : '<div class="empty-state"><i class="fas fa-box-open"></i>No recent transactions</div>'}
                </div>
            </div>
            <div class="glass-card activity-card">
                <h3><i class="fas fa-users"></i> Profile Views</h3>
                <div class="activity-list">
                    ${views.length ? views.map(a => `
                        <div class="activity-item">
                            <div class="activity-icon view">${a.icon}</div>
                            <div class="activity-details">
                                <span class="activity-title">${a.title}</span>
                                <span class="activity-sub">Intent: <i>${a.detail}</i></span>
                            </div>
                            <span class="activity-time">${a.time}</span>
                        </div>
                    `).join('') : '<div class="empty-state"><i class="fas fa-eye-slash"></i>No recent profile views</div>'}
                </div>
            </div>
        </div>
    `;
    
    // Add pop animation
    container.querySelectorAll('.activity-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });

    // slight delay to let DOM render
    setTimeout(() => {
        drawBizTradeChart(containerId, targetBizData ? targetBizData.imported : 0, targetBizData ? targetBizData.waste : 0);
    }, 100);
}

function drawBizTradeChart(containerId, imported, exported) {
    const canvas = document.getElementById(`${containerId}-trade-chart`);
    const legend = document.getElementById(`${containerId}-trade-legend`);
    if (!canvas || !legend) return;

    let vImp = imported || 0;
    let vExp = exported || 0;
    
    // Fallback visually if both are 0 so chart isn't invisible
    const isMock = vImp === 0 && vExp === 0;
    if (isMock) { vExp = 45; vImp = 15; }

    const total = vImp + vExp;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const cx = canvas.offsetWidth / 2;
    const cy = canvas.offsetHeight / 2;
    const r = Math.min(cx, cy) - 10;

    let startAngle = -Math.PI / 2;
    const slices = [
        { val: vExp, color: '#00e68a', label: 'Exported (Waste)', icon: '📤', realVal: exported },
        { val: vImp, color: '#38bdf8', label: 'Imported (Recycled)', icon: '📥', realVal: imported }
    ];

    slices.forEach(s => {
        const sliceAngle = (s.val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = '#0a0e17';
        ctx.lineWidth = 2;
        ctx.stroke();
        startAngle += sliceAngle;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    
    // Center Text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${isMock ? 0 : (imported + exported)}T`, cx, cy + 6);

    // Legend
    legend.innerHTML = slices.map(s => `
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${s.color};"></span>
            <span style="color:var(--text-primary); font-weight: 600;">${s.icon} ${s.label}</span>
            <span style="margin-left:auto; font-family:'JetBrains Mono',monospace; color:${s.color}; font-weight: bold;">${s.realVal} Tons</span>
        </div>
    `).join('');
}

// Admin Activity Search Event Listener
document.addEventListener('DOMContentLoaded', () => {
    // We already have a window.load init, so we can just bind to click if the element exists
    setTimeout(() => {
        const adminSearchBtn = document.getElementById('admin-activity-btn');
        if (adminSearchBtn) {
            adminSearchBtn.addEventListener('click', () => {
                const query = document.getElementById('admin-activity-search').value.trim();
                const resultsContainer = document.getElementById('admin-activity-results');
                if (!query) return;
                
                adminSearchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                setTimeout(() => {
                    resultsContainer.classList.remove('hidden');
                    resultsContainer.innerHTML = `<div class="activity-header" style="margin-bottom:16px;">
                        <h2>Activity Report: ${query}</h2>
                    </div><div id="admin-activity-content"></div>`;
                    
                    renderActivityDashboard('admin-activity-content', query);
                    adminSearchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
                }, 600);
            });
        }
    }, 1000);
});

// ===== TRANSACTION MODAL LOGIC =====
function showTransactionDetails(idx) {
    if (!window.__currentActivities || !window.__currentActivities[idx]) return;
    const a = window.__currentActivities[idx];
    
    document.getElementById('trans-modal-type').textContent = a.type === 'export' ? 'Exported' : 'Imported';
    document.getElementById('trans-modal-material').textContent = a.material || 'Material';
    document.getElementById('trans-modal-qty').textContent = a.qty || Math.floor(Math.random() * 50 + 10);
    document.getElementById('trans-modal-partner').textContent = a.partner || 'WIN Network Partner';
    
    const profitLabel = document.getElementById('trans-modal-profit-label');
    const profitVal = document.getElementById('trans-modal-profit');
    
    if (a.type === 'export') {
        profitLabel.textContent = 'Revenue Generated';
        profitVal.style.color = 'var(--neon-green)';
    } else {
        profitLabel.textContent = 'Cost Savings vs Raw Material';
        profitVal.style.color = 'var(--neon-blue)';
    }
    
    profitVal.textContent = '₹' + (a.profit || Math.floor(Math.random() * 500000 + 50000)).toLocaleString();
    
    document.getElementById('trans-modal-time').textContent = a.time || 'Some time ago';
    
    document.getElementById('transaction-modal').classList.remove('hidden');
}

function closeTransactionModal() {
    document.getElementById('transaction-modal').classList.add('hidden');
}

/* ===== CARBON CREDIT SYSTEM ===== */

window.updateCarbonUI = function() {
    if (!currentUser || currentUser.role !== 'business') return;
    const data = getBizData(currentUser.username);
    
    // Simulate Gross Emissions based on activity if 0
    if (data.emissionsTotal === 0 && data.revenue === 0) {
        data.emissionsTotal = Math.floor(Math.random() * 500 + 100); 
    } else if (data.emissionsTotal === 0) {
        data.emissionsTotal = 850;
    }

    const netEmissions = Math.max(0, data.emissionsTotal - data.emissionsReduced);
    
    // Animate KPI values
    animateValue('biz-emissions-total-val', 0, data.emissionsTotal, 1500);
    animateValue('biz-emissions-reduced-val', 0, data.emissionsReduced, 1500);
    animateValue('biz-emissions-net-val', 0, netEmissions, 1500);
    animateValue('biz-credits-val', 0, data.carbonCredits, 1500);

    // Update Status
    const statusEl = document.getElementById('biz-net-status');
    if (statusEl) {
        if (netEmissions > 500) {
            statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> High Carbon Footprint';
            statusEl.className = 'kpi-trend down';
        } else {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Sustainable';
            statusEl.className = 'kpi-trend up';
        }
    }
    saveBizData(currentUser.username, data);
}

window.performSustainabilityAction = function(type) {
    if (!currentUser || currentUser.role !== 'business') return;
    const data = getBizData(currentUser.username);
    
    let reduction = 0;
    let credits = 0;
    let title = "";

    if (type === 'tree') { reduction = 10; credits = 5; title = "Tree Plantation"; }
    else if (type === 'solar') { reduction = 50; credits = 25; title = "Renewable Energy Switch"; }
    else if (type === 'recycle') { reduction = 25; credits = 12; title = "Recycling Hub Init"; }

    data.emissionsReduced += reduction;
    data.carbonCredits += credits;

    if(!data.activities) data.activities = [];
    data.activities.unshift({
        type: 'export', // reuse styling
        title: title,
        detail: `Generated ${credits} credits`,
        time: 'Just now',
        icon: '<i class="fas fa-leaf"></i>',
        material: 'Credits',
        qty: credits,
        partner: 'Network',
        profit: 0
    });

    saveBizData(currentUser.username, data);
    updateCarbonUI();
    alert(`Successfully completed ${title}. You earned ${credits} Carbon Credits!`);
}

/* ===== CARBON MARKETPLACE ===== */

window.loadMarketplace = async function() {
    try {
        const res = await fetch(`${API_URL}/api/market`);
        let marketItems = await res.json();
        
        // Auto-seed options to buy from different companies
        if (marketItems.length === 0) {
            marketItems = [
                { id: 101, seller: "Steel Works Ltd", credits: 50, price: 150 },
                { id: 102, seller: "Green Energy Hub", credits: 200, price: 140 },
                { id: 103, seller: "Tata Polymers", credits: 120, price: 160 },
                { id: 104, seller: "EcoBricks Pvt Ltd", credits: 300, price: 135 }
            ];
            // Push mock options to DB so they persist
            await fetch(`${API_URL}/api/market`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(marketItems)
            }).catch(e=>{});
        }
        renderMarketplace(marketItems);
    } catch(e) {
        console.warn("Marketplace API Error", e);
        renderMarketplace([
            { id: 1, seller: "Steel Works Ltd", credits: 50, price: 150 },
            { id: 2, seller: "Green Energy Hub", credits: 200, price: 140 }
        ]);
    }
}

window.renderMarketplace = function(items) {
    const tbody = document.getElementById('market-list-body');
    if (!tbody) return;
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No credits listed on the market currently.</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td class="industry-name"><i class="fas fa-industry"></i> ${item.seller}</td>
            <td class="credit-val">${item.credits}</td>
            <td class="price-val">₹${item.price}</td>
            <td style="text-align: right;">
                <button class="btn-sm" onclick="buyCredits(${item.id}, ${item.credits}, ${item.price}, '${item.seller}')" style="background:var(--neon-green); color:#000; border:none; padding:6px 14px;">
                    <i class="fas fa-shopping-cart"></i> Buy
                </button>
            </td>
        </tr>
    `).join('');
}

window.openSellModal = function() {
    if (!currentUser) return;
    const data = getBizData(currentUser.username);
    const maxEl = document.getElementById('sell-credits-max');
    const amtEl = document.getElementById('sell-credits-amt');
    if(maxEl) maxEl.textContent = data.carbonCredits;
    if(amtEl) {
        amtEl.max = data.carbonCredits;
        amtEl.value = '';
    }
    const modal = document.getElementById('sell-credits-modal');
    if(modal) modal.classList.remove('hidden');
}

window.closeSellModal = function() {
    const modal = document.getElementById('sell-credits-modal');
    if(modal) modal.classList.add('hidden');
}

window.submitSellCredits = async function() {
    if (!currentUser) return;
    const data = getBizData(currentUser.username);
    const amt = parseInt(document.getElementById('sell-credits-amt').value);
    const price = parseInt(document.getElementById('sell-credits-price').value);

    if (isNaN(amt) || amt <= 0 || amt > data.carbonCredits) {
        alert("Invalid amount of credits to sell.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/market`);
        let marketItems = [];
        try { marketItems = await res.json(); } catch(e){}
        
        marketItems.push({
            id: Date.now(),
            seller: currentUser.businessName,
            credits: amt,
            price: price
        });
        
        await fetch(`${API_URL}/api/market`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(marketItems)
        });

        data.carbonCredits -= amt;
        saveBizData(currentUser.username, data);
        updateCarbonUI();
        loadMarketplace();
        closeSellModal();
        alert(`Successfully listed ${amt} credits on the market!`);
    } catch (e) {
        console.error(e);
        alert("Marketplace failed to update locally.");
    }
}

window.buyCredits = async function(id, credits, price, seller) {
    if (currentUser && seller === currentUser.businessName) {
        alert("You cannot buy your own credits.");
        return;
    }
    
    const totalCost = credits * price;
    if (!confirm(`Confirm purchase of ${credits} credits from ${seller} for ₹${price} each? (Total: ₹${totalCost})`)) return;
    
    // Local data update
    if (currentUser && currentUser.role === 'business') {
        const data = getBizData(currentUser.username);
        
        // Initialize default wallet if old data doesn't have it
        if (data.walletBalance === undefined) data.walletBalance = 1500000;
        
        const totalMoney = (data.revenue || 0) + (data.importSavings || 0) + data.walletBalance;
        if (totalMoney < totalCost) {
            alert(`Insufficient funds. You need ₹${totalCost} but only have total funds of ₹${totalMoney.toLocaleString()}.`);
            return;
        }

        // Deduct the cost from wallet/revenue/savings
        if (data.walletBalance >= totalCost) {
            data.walletBalance -= totalCost;
        } else if (data.walletBalance + data.revenue >= totalCost) {
            let remain = totalCost - data.walletBalance;
            data.walletBalance = 0;
            data.revenue -= remain;
        } else {
            let remain = totalCost - data.walletBalance - data.revenue;
            data.walletBalance = 0;
            data.revenue = 0;
            data.importSavings -= remain;
        }

        data.carbonCredits += credits;
        data.emissionsReduced += credits; // reduce emission exactly as per how much they buy
        
        if(!data.activities) data.activities = [];
        data.activities.unshift({
            type: 'import',
            title: 'Bought Carbon Credits',
            detail: `Purchased ${credits} credits from ${seller}`,
            time: 'Just now',
            icon: '<i class="fas fa-shopping-cart"></i>',
            material: 'Credits',
            qty: credits,
            partner: seller,
            profit: -totalCost // Track expenditure
        });

        saveBizData(currentUser.username, data);
        updateCarbonUI();
    }

    // Remove from market
    try {
        const res = await fetch(`${API_URL}/api/market`);
        let marketItems = await res.json();
        marketItems = marketItems.filter(item => item.id !== id);
        
        await fetch(`${API_URL}/api/market`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(marketItems)
        });
        loadMarketplace();
        alert(`Successfully bought ${credits} credits from ${seller} for ₹${totalCost}! Your Net Emissions were reduced by ${credits}.`);
    } catch(e) {
        console.error(e);
        alert(`Mock Purchase Successful! Your Net Emissions were reduced by ${credits}.`);
    }
}

// ===== MEDIATOR PANEL LOGIC =======
let mediatorTransactions = [];

window.loadMediatorQueue = async function() {
    try {
        const res = await fetch(`${API_URL}/api/transactions`);
        mediatorTransactions = await res.json();
    } catch(e) {
        mediatorTransactions = [];
    }
    renderMediatorQueue(mediatorTransactions);
}

window.renderMediatorQueue = function(txs) {
    const tbody = document.getElementById('mediator-queue-body');
    if(!tbody) return;
    
    let pending = 0, approved = 0, rejected = 0;
    
    if(txs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No pending verifications found.</td></tr>';
    } else {
        const rows = txs.map(t => {
            if (t.status === 'pending') pending++;
            else if (t.status === 'approved') approved++;
            else if (t.status === 'rejected') rejected++;
            
            let statusBadge = '';
            if(t.status === 'pending') statusBadge = '<span class="badge warning" style="background:#fbbf24;color:#000;">Requires Review</span>';
            else if(t.status === 'approved') statusBadge = '<span class="badge success" style="background:var(--neon-green);color:#000;">Verified</span>';
            else if(t.status === 'rejected') statusBadge = '<span class="badge" style="background:#f43f5e;color:#fff;">Rejected</span>';
            else if(t.status === 're-evaluate') statusBadge = '<span class="badge info" style="background:var(--neon-blue);color:#000;">Re-evaluation</span>';
            
            return `
            <tr>
                <td><i class="fas fa-industry text-muted"></i> ${t.sourceName}</td>
                <td><i class="fas fa-building text-muted"></i> ${t.receiverName}</td>
                <td><strong>${t.material}</strong> (${t.qty} T)</td>
                <td>${t.location}</td>
                <td>${statusBadge}</td>
                <td style="text-align:right;">
                    <button class="btn-sm" onclick="openMediatorReview(${t.id})" ${t.status === 'approved' ? 'disabled' : ''} style="background:var(--surface-color);border:1px solid rgba(255,255,255,0.2);color:white;"><i class="fas fa-search"></i> Inspect</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = rows.reverse().join('');
    }
    
    document.getElementById('med-kpi-pending').textContent = pending;
    document.getElementById('med-kpi-approved').textContent = approved;
    document.getElementById('med-kpi-rejected').textContent = rejected;
}

window.openMediatorReview = function(id) {
    const tx = mediatorTransactions.find(t => t.id === id);
    if(!tx) return;
    
    document.getElementById('med-review-id').value = id;
    document.getElementById('med-doc-title').innerHTML = `${tx.sourceName.replace(/ /g, '_')}_Purity_Report.pdf`;
    document.getElementById('med-doc-content').innerHTML = `
        <b>Material:</b> ${tx.material} (${tx.qty} Tons)<br>
        <b>Lab Rating:</b> ${tx.qualityScore > 80 ? 'Grade A (High Purity)' : 'Grade B (Acceptable)'}<br>
        <b>Corrosion Check:</b> ${tx.corrosionCheck}<br>
        <b>Contaminants:</b> ${tx.qualityScore > 80 ? '< 1%' : '~ 4%'}<br>
    `;
    
    // Clear checkboxes and comments
    document.querySelectorAll('.med-chk').forEach(c => c.checked = false);
    document.getElementById('med-review-comments').value = '';
    
    document.getElementById('mediator-review-modal').classList.remove('hidden');
}

window.closeMediatorReview = function() {
    document.getElementById('mediator-review-modal').classList.add('hidden');
}

window.submitMediatorReview = async function(status) {
    const id = parseInt(document.getElementById('med-review-id').value);
    const comments = document.getElementById('med-review-comments').value;
    
    const txIndex = mediatorTransactions.findIndex(t => t.id === id);
    if(txIndex > -1) {
        const tx = mediatorTransactions[txIndex];
        tx.status = status;
        tx.mediatorComments = comments;
        
        try {
            await fetch(`${API_URL}/api/transactions`, {
                method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(mediatorTransactions)
            });
        } catch(e){}
        
        if (status === 'approved') {
            if (tx.txType === 'export') {
                await executePendingExport(tx);
            } else if (tx.txType === 'import') {
                await executePendingImport(tx);
            }
            showToast('Transaction Approved', 'Material quality verified. Participants have been notified and ledgers securely updated.', 'success');
        } else if (status === 'rejected') {
            showToast('Transaction Rejected', 'The exchange was blocked due to failed quality metrics.', 'error');
        } else {
            showToast('Re-evaluation Requested', 'Additional documents requested from source industry.', 'info');
        }
        
        renderMediatorQueue(mediatorTransactions);
        closeMediatorReview();
    }
}
