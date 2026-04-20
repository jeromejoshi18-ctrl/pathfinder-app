/**
 * Honors module for the Pathfinder App
 */

import { id, toast, san, ini, esc, load, hideLoad } from '../utils.js';
import { state } from '../state.js';
import { dbGet, dbSet } from '../firebase.js';

export async function loadHonorInbox() {
    const cont = id('honor-inbox-list');
    if (!cont) return;
    cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Loading...</div>';
    
    const all = await dbGet(`clubs/${state.clubKey}/uploads`) || {};
    let html = '';
    
    Object.keys(all).forEach(uid => {
        const studentUploads = all[uid];
        if (studentUploads.honor) {
            Object.keys(studentUploads.honor).forEach(key => {
                const up = studentUploads.honor[key];
                if (up.status === 'pending') {
                    html += `
                        <div class="card" style="margin-bottom:12px">
                            <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
                                <div class="av">${ini(up.by)}</div>
                                <div style="flex:1"><div class="sn">${up.by}</div><div class="sm2">${up.date}</div></div>
                                <div class="badge ba">Pending</div>
                            </div>
                            <img src="${up.url}" style="width:100%;border-radius:10px;margin-bottom:10px">
                            <div style="display:flex;gap:8px">
                                <button class="btn btn-p" style="flex:1" onclick="window.setScore('${uid}','honor','${key}','earned')">Approve</button>
                                <button class="btn" style="flex:1;background:var(--red);color:#fff" onclick="window.setScore('${uid}','honor','${key}','rejected')">Reject</button>
                            </div>
                        </div>`;
                }
            });
        }
    });
    
    cont.innerHTML = html || '<div style="text-align:center;padding:40px;color:var(--mut)">No pending honor submissions</div>';
}

export async function setScore(uid, type, key, status) {
    load('Processing...');
    await dbSet(`clubs/${state.clubKey}/uploads/${uid}/${type}/${key}/status`, status);
    
    if (status === 'earned') {
        const up = await dbGet(`clubs/${state.clubKey}/uploads/${uid}/${type}/${key}`);
        if (up && up.name) {
            await dbSet(`clubs/${state.clubKey}/honors/${uid}/${san(up.name)}`, 'earned');
        }
    }
    
    hideLoad();
    toast(status === 'earned' ? '✅ Approved!' : '❌ Rejected');
    loadHonorInbox();
}
