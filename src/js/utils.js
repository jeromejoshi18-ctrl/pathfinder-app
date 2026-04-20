/**
 * Utility functions for the Pathfinder App
 */

export function id(x) { 
    return document.getElementById(x); 
}

export function show(x) { 
    document.querySelectorAll('.screen').forEach(s => { 
        s.classList.remove('active'); 
        s.style.display = 'none'; 
    }); 
    const e = id(x); 
    if (e) {
        e.classList.add('active'); 
        e.style.display = 'flex'; 
    }
}

export function load(msg) { 
    const txt = id('load-txt');
    if (txt) txt.textContent = msg || 'Loading...'; 
    show('loading-screen'); 
}

export function hideLoad() { 
    show('auth-screen'); 
}

export function setErr(eid, msg) { 
    const e = id(eid); 
    if (e) {
        e.textContent = msg; 
        e.style.display = msg ? 'block' : 'none'; 
    }
}

export function toast(msg) { 
    const t = id('toast'); 
    if (t) {
        t.textContent = msg; 
        t.classList.add('show'); 
        setTimeout(() => t.classList.remove('show'), 2600); 
    }
}

export function cap(s) { 
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; 
}

export function ini(n) { 
    if (!n) return '??';
    return n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); 
}

export function today() { 
    return new Date().toISOString().split('T')[0]; 
}

export function san(s) { 
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''); 
}

export function esc(s) { 
    const d = document.createElement('div'); 
    d.textContent = s; 
    return d.innerHTML; 
}

/**
 * Navigation utility: switches sub-tabs within a section
 */
export function subTab(sec, tab, loadHonorInboxCb) {
    if (sec === 'instructors' && tab === 'honors' && typeof loadHonorInboxCb === 'function') {
        setTimeout(loadHonorInboxCb, 100);
    }
    const cont = id('tab-' + sec);
    if (!cont) return;
    
    cont.querySelectorAll('[id^="sub-' + sec + '-"]').forEach(s => s.style.display = 'none');
    const target = id('sub-' + sec + '-' + tab);
    if (target) target.style.display = 'block';
    
    const subs = cont.querySelectorAll('[id^="sub-' + sec + '-"]');
    const names = Array.from(subs).map(s => s.id.replace('sub-' + sec + '-', ''));
    cont.querySelectorAll('.tabs:first-of-type .tab').forEach((t, i) => {
        t.classList.toggle('a', names[i] === tab);
    });
}
