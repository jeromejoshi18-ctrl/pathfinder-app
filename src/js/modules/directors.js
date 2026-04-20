/**
 * Director module for the Pathfinder App
 */

import { id, san, ini, today, esc } from '../utils.js';
import { dbGet } from '../firebase.js';
import { state } from '../state.js';
import { CLASSES } from '../config.js';

export async function loadDevotionStatus() {
    const cont = id('dev-att');
    if (!cont) return;
    
    const students = state.classStudents;
    const data = await dbGet(`clubs/${state.clubKey}/devotionJournals/${state.cu.classId}/${today()}`) || {};
    
    cont.innerHTML = students.map(s => {
        const done = data[san(s)] && data[san(s)].uploaded;
        return `
            <div class="srow">
                <div class="av">${ini(s)}</div>
                <div class="si"><div class="sn">${s}</div></div>
                <div class="badge ${done ? 'bg' : 'ba'}">${done ? '✅ Done' : '❌ Not Done'}</div>
            </div>`;
    }).join('');
}

export async function loadDirectorDevotionOverview() {
    const cont = id('dev-class-list');
    if (!cont) return;
    
    cont.innerHTML = CLASSES.map(c => `
        <div class="srow">
            <div style="font-size:22px">${c.e}</div>
            <div class="si"><div class="sn">${c.n} Class</div></div>
            <div class="badge ba" style="cursor:pointer" onclick="window.swTab('directors');window.openClassModal('${c.id}','${c.n}','${c.e}')">
                View Members
            </div>
        </div>`).join('');
}
