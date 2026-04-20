/**
 * UI Building module for the Pathfinder App
 */

import { id, ini } from '../utils.js';
import { state } from '../state.js';

/**
 * Build the bottom navigation bar based on user role
 */
export function buildNav() {
    let tabs;
    const r = state.cu.role;
    
    if (r === 'student') {
        tabs = [
            { id: 'home', e: '🏠', l: 'Home' },
            { id: 'students', e: '📊', l: 'My Panel' },
            { id: 'devotion', e: '📖', l: 'Devotion' },
            { id: 'messages', e: '💬', l: 'Chat' },
            { id: 'upload-history', e: '📜', l: 'History' },
            { id: 'settings', e: '⚙️', l: 'Settings' }
        ];
    } else if (r === 'instructor') {
        tabs = [
            { id: 'home', e: '🏠', l: 'Home' },
            { id: 'instructors', e: '📋', l: 'Instruct.' },
            { id: 'devotion', e: '📖', l: 'Devotion' },
            { id: 'messages', e: '💬', l: 'Chat' },
            { id: 'settings', e: '⚙️', l: 'Settings' }
        ];
    } else { // director
        tabs = [
            { id: 'home', e: '🏠', l: 'Home' },
            { id: 'directors', e: '🎗️', l: 'Director' },
            { id: 'devotion', e: '📖', l: 'Devotion' },
            { id: 'masterguide', e: '🎖️', l: 'MG' },
            { id: 'messages', e: '💬', l: 'Chat' },
            { id: 'settings', e: '⚙️', l: 'Settings' }
        ];
    }
    
    const bnav = id('bnav');
    if (bnav) {
        bnav.innerHTML = tabs.map(t => 
            `<button class="nb" id="nb-${t.id}" onclick="window.swTab('${t.id}')">
                <span class="ni">${t.e}</span>
                <span>${t.l}</span>
            </button>`
        ).join('');
        // Mark current tab as active
        id('nb-' + state.currentTab)?.classList.add('a');
    }
}

/**
 * Build the home dashboard sections based on user role
 */
export function buildHome() {
    let s = [];
    const r = state.cu.role;
    
    if (r === 'student') {
        s = [
            { e: '📊', n: 'My Scores', d: 'Instructor scores', a: "swTab('students')" },
            { e: '📤', n: 'Uploads', d: 'Submit work', a: "swTab('students');subTab('students','uploads')" },
            { e: '💬', n: 'Chat', d: 'Club messages', a: "swTab('messages')" },
            { e: '⚙️', n: 'Settings', d: 'App preferences', a: "swTab('settings')" }
        ];
    } else if (r === 'instructor') {
        s = [
            { e: '✅', n: 'Attendance', d: 'Mark class', a: "swTab('instructors')" },
            { e: '🧼', n: 'Hygiene', d: 'Hygiene check', a: "swTab('instructors');subTab('instructors','hygiene')" },
            { e: '📋', n: 'Assessment', d: 'Score students', a: "swTab('instructors');subTab('instructors','assessment')" },
            { e: '💬', n: 'Chat', d: 'Club messages', a: "swTab('messages')" }
        ];
    } else { // director
        s = [
            { e: '📊', n: 'Dashboard', d: 'Club overview', a: "swTab('directors')" },
            { e: '🎖️', n: 'MG Program', d: 'Master Guide', a: "swTab('masterguide')" },
            { e: '💬', n: 'All Chats', d: 'View all channels', a: "swTab('messages')" },
            { e: '⚙️', n: 'Settings', d: 'App preferences', a: "swTab('settings')" }
        ];
    }
    
    const hmSections = id('hm-sections');
    if (hmSections) {
        hmSections.innerHTML = s.map(x => 
            `<div class="sc" onclick="${x.a}">
                <div style="font-size:28px;margin-bottom:7px">${x.e}</div>
                <div style="font-size:13px;font-weight:700;margin-bottom:3px;color:var(--txt)">${x.n}</div>
                <div style="font-size:11px;color:var(--mut)">${x.d}</div>
            </div>`
        ).join('');
    }
}

/**
 * Hide the splash screen with a fade effect
 */
export function hideSplash() {
    const s = id('splash-screen');
    if (s && s.style.display !== 'none') {
        s.classList.add('splash-fade');
        setTimeout(() => s.style.display = 'none', 500);
    }
}

export function applyTheme(th, save = true) {
    document.documentElement.setAttribute('data-theme', th);
    if (save) localStorage.setItem('pf-theme', th);
    
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('s'));
    id('thm-' + th)?.classList.add('s');
}

export function setTheme(th) {
    applyTheme(th);
    toast(`Theme set to ${th} ✨`);
}

export function syncToggleUI() {
    ['devot', 'att', 'scores'].forEach(k => {
        id('tog-' + k)?.classList.toggle('on', state.settings[k]);
    });
}

export function toggleSetting(k) {
    const newVal = !state.settings[k];
    state.settings[k] = newVal;
    localStorage.setItem('pf-settings', JSON.stringify(state.settings));
    syncToggleUI();
    toast(`${k} ${newVal ? 'enabled' : 'disabled'}`);
}
