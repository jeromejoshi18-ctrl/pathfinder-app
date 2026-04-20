/**
 * Main Application Entry Point
 */

import { id, show, hideLoad, toast, subTab } from './utils.js';
import { dbGet, dbSet, dbPush, dbListen } from './firebase.js';
import { state, updateState } from './state.js';
import { LOGO_BASE64 } from './assets.js';
import * as auth from './modules/auth.js';
import * as nav from './modules/navigation.js';
import * as ui from './modules/ui.js';
import * as messaging from './modules/messaging.js';
import * as students from './modules/students.js';
import * as instructors from './modules/instructors.js';
import * as modals from './modules/modals.js';
import * as uploads from './modules/uploads.js';
import * as honors from './modules/honors.js';
import * as directors from './modules/directors.js';
import { CLASSES } from './config.js';

// Expose functions to window for HTML event handlers
window.doSignIn = () => auth.doSignIn(launch);
window.doSignUp = () => auth.doSignUp(launch);
window.swTab = nav.swTab;
window.goBack = nav.goBack;
window.subTab = subTab;
window.setTheme = ui.setTheme;
window.toggleSetting = ui.toggleSetting;
window.sendMsg = messaging.sendMsg;
window.switchChat = messaging.initChat;
window.markA = instructors.markA;
window.markH = instructors.markH;
window.setStar = instructors.setStar;
window.assTab = instructors.assTab;
window.saveReq = instructors.saveReq;
window.saveScores = instructors.saveScores;
window.loadExistingScores = instructors.loadExistingScores;
window.loadInstReqBook = instructors.loadInstReqBook;
window.buildStudents = students.buildStudents;
window.buildStuView = students.buildStuView;
window.openClassModal = modals.openClassModal;
window.closeClassModal = modals.closeClassModal;
window.openStudentModal = modals.openStudentModal;
window.closeStudentModal = modals.closeStudentModal;
window.loadHonorInbox = honors.loadHonorInbox;
window.setScore = honors.setScore;
window.loadDevotionStatus = directors.loadDevotionStatus;
window.loadDirectorDevotionOverview = directors.loadDirectorDevotionOverview;
window.requestImageFromApp = uploads.requestImageFromApp;
window.receiveImageFromApp = uploads.receiveImageFromApp;
window.uploadToCloudinary = uploads.uploadToCloudinary;
window.closeSheet = uploads.closeSheet;
window.handleSheetAction = uploads.handleSheetAction;

// Auth Tab switching
window.authTab = (t) => {
    id('tab-si').classList.toggle('a', t === 'si');
    id('tab-su').classList.toggle('a', t === 'su');
    id('form-si').style.display = t === 'si' ? 'block' : 'none';
    id('form-su').style.display = t === 'su' ? 'block' : 'none';
};

window.setRole = (r) => {
    updateState({ selRole: r });
    document.querySelectorAll('.r-btn').forEach(b => b.classList.remove('s'));
    const btn = id('role-' + r);
    if (btn) btn.classList.add('s');
    const classSection = id('su-class-section');
    if (classSection) classSection.style.display = r === 'student' || r === 'instructor' ? 'block' : 'none';
};

window.setClass = (c) => {
    updateState({ selClass: c });
    document.querySelectorAll('.c-btn').forEach(b => b.classList.remove('s'));
    const btn = id('cls-' + c);
    if (btn) btn.classList.add('s');
};

function launch() {
    show('main-screen');
    const r = state.cu.role;
    const titleEl = id('hdr-title');
    if (titleEl) titleEl.textContent = state.cu.clubName;
    
    ui.buildNav();
    ui.buildHome();
    buildChatTabs();
    
    if (r !== 'student') {
        students.buildStudents();
    } else {
        students.buildStuView();
    }
    
    messaging.initChat('global');
    requestNotifPermission();
}

function buildChatTabs() {
    const isDir = state.cu.role === 'director';
    const channels = [{ id: 'global', label: '📢 Club-wide' }];

    if (state.cu.classId && state.cu.classId !== 'all') {
        const cls = CLASSES.find(c => c.id === state.cu.classId);
        if (cls) {
            channels.push({ id: 'class-' + state.cu.classId, label: cls.e + ' ' + cls.n + ' Class' });
        }
    }

    if (isDir) {
        CLASSES.forEach(cls => {
            if (!channels.find(c => c.id === 'class-' + cls.id))
                channels.push({ id: 'class-' + cls.id, label: cls.e + ' ' + cls.n });
        });
    }

    const tabsEl = id('chat-tabs');
    if (tabsEl) {
        tabsEl.innerHTML = channels.map(c => 
            `<div class="ctab${c.id === 'global' ? ' a' : ''}" id="ctab-${c.id}" onclick="window.switchChat('${c.id}')">
                ${c.label}
            </div>`
        ).join('');
    }
}

async function requestNotifPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        updateState({ notifPermission: true });
        return;
    }
    const p = await Notification.requestPermission();
    updateState({ notifPermission: p === 'granted' });
}

// Inject Assets
function injectAssets() {
    const logoHtml = `<img src="${LOGO_BASE64}" alt="Pathfinder Logo">`;
    const containers = [
        'splash-logo-container',
        'hero-logo-container',
        'hdr-logo-container',
        'offline-logo-container'
    ];
    containers.forEach(cid => {
        const el = id(cid);
        if (el) el.innerHTML = logoHtml;
    });
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    injectAssets();
    
    // Connectivity Monitoring
    const updateOnlineStatus = () => {
        const offScreen = id('offline-screen');
        if (offScreen) {
            offScreen.style.display = navigator.onLine ? 'none' : 'flex';
        }
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    try {

        const sv = localStorage.getItem('pf-settings');
        if (sv) updateState({ settings: JSON.parse(sv) });
        
        const th = localStorage.getItem('pf-theme') || 'light';
        ui.applyTheme(th, false);
        
        ui.syncToggleUI();
    } catch (e) {
        console.error('Initialization error:', e);
    }
    // Initial Screen
    if (state.cu && state.cu.uid) {
        launch();
    } else {
        auth.showAuth();
    }
    
    // Hide splash after 1.5s
    setTimeout(ui.hideSplash, 1500);
});


// Global escape hatch for back button
window.addEventListener('popstate', () => nav.goBack());
