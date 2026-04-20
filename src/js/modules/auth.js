/**
 * Authentication module for the Pathfinder App
 */

import { id, toast, load, hideLoad, show, san } from '../utils.js';
import { dbGet, dbSet } from '../firebase.js';
import { state, updateState } from '../state.js';
import { CLASSES } from '../config.js';

export function showAuth() { 
    show('auth-screen'); 
}

export async function doSignIn(onLaunch) { 
    const emailInput = id('si-email');
    const pwInput = id('si-pw');
    if (!emailInput || !pwInput) return;
    
    const e = emailInput.value.trim();
    const p = pwInput.value; 
    
    if (!e || !p) {
        toast('Please enter email and password');
        return;
    }
    
    load('Signing in...'); 
    const k = san(e); 
    const u = await dbGet('accounts/' + k); 
    
    if (!u || u.pw !== btoa(p)) { 
        hideLoad(); 
        toast('Invalid login'); 
        return; 
    } 
    
    const cls = CLASSES.find(c => c.id === u.classId) || { n: 'All', e: '🎗️' }; 
    const cu = { ...u, uid: k, cn: cls.n, ce: cls.e, ini: u.name[0].toUpperCase() }; 
    const clubKey = san(u.clubName); 
    
    updateState({ cu, clubKey });
    hideLoad(); 
    
    if (typeof onLaunch === 'function') onLaunch();
}

export async function doSignUp(onLaunch) { 
    const clubInput = id('su-club');
    const nameInput = id('su-name');
    const emailInput = id('su-email');
    const pwInput = id('su-pw');
    
    if (!clubInput || !nameInput || !emailInput || !pwInput) return;
    
    const cn = clubInput.value.trim();
    const n = nameInput.value.trim();
    const e = emailInput.value.trim();
    const p = pwInput.value; 
    
    if (!cn || !n || !e || !p || !state.selRole) {
        toast('Please fill all fields and select a role');
        return; 
    }
    
    load('Joining...'); 
    const k = san(e); 
    const prof = { 
        name: n, 
        email: e, 
        pw: btoa(p), 
        role: state.selRole, 
        classId: state.selClass || 'all', 
        clubName: cn, 
        ts: Date.now() 
    }; 
    
    await dbSet('accounts/' + k, prof); 
    
    const cls = CLASSES.find(c => c.id === prof.classId) || { n: 'All', e: '🎗️' }; 
    const cu = { ...prof, uid: k, cn: cls.n, ce: cls.e, ini: n[0].toUpperCase() }; 
    const clubKey = san(cn); 
    
    updateState({ cu, clubKey });
    hideLoad(); 
    
    if (typeof onLaunch === 'function') onLaunch();
}
