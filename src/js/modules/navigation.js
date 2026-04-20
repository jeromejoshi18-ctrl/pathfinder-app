/**
 * Navigation module for the Pathfinder App
 */

import { id } from '../utils.js';
import { state, updateState } from '../state.js';

/**
 * Switch between main tabs
 * @param {string} t - Tab ID
 * @param {boolean} h - Whether to push to history
 */
export function swTab(t, h = true) {
    if (h) {
        const newHistory = [...state.navHistory];
        newHistory.push(state.currentTab);
        updateState({ navHistory: newHistory });
    }
    updateState({ currentTab: t });
    
    document.querySelectorAll('.con').forEach(c => c.style.display = 'none');
    const targetTab = id('tab-' + t);
    if (targetTab) targetTab.style.display = 'block';
    
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('a'));
    const targetBtn = id('nb-' + t);
    if (targetBtn) targetBtn.classList.add('a');
}

/**
 * Handle back button logic
 */
export function goBack() {
    if (id('student-modal')?.style.display === 'flex') {
        // This will be handled by student module if exported, 
        // for now just close it if we can find the close function
        if (window.closeStudentModal) window.closeStudentModal();
        return;
    }
    if (id('class-modal')?.style.display === 'flex') {
        if (window.closeClassModal) window.closeClassModal();
        return;
    }
    if (!state.cu) return;
    
    if (state.navHistory.length > 0) {
        const newHistory = [...state.navHistory];
        const p = newHistory.pop();
        updateState({ navHistory: newHistory });
        swTab(p, false);
        return;
    }
    
    if (state.currentTab === 'home') {
        if (state._exitToastShown) {
            if (window.AppInventor) window.AppInventor.setWebViewString('EXIT_APP');
        } else {
            updateState({ _exitToastShown: true });
            if (window.toast) window.toast('Press back again to exit');
            setTimeout(() => updateState({ _exitToastShown: false }), 2500);
        }
        return;
    }
    swTab('home', false);
}

/**
 * Handle sub-tab switching (within a tab)
 * @param {string} parentTab - Parent tab ID
 * @param {string} subId - Sub-tab ID
 */
export function subTab(parentTab, subId) {
    // Hide all sub-tabs of this parent
    document.querySelectorAll(`[id^="sub-${parentTab}-"]`).forEach(el => {
        el.style.display = 'none';
    });
    // Show selected sub-tab
    const target = id(`sub-${parentTab}-${subId}`);
    if (target) target.style.display = 'block';
    
    // Update sub-tab buttons
    document.querySelectorAll(`#tab-${parentTab} .tab`).forEach(btn => {
        btn.classList.toggle('a', btn.getAttribute('onclick')?.includes(`'${subId}'`));
    });
}
