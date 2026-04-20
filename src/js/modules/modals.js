/**
 * Modals module for the Pathfinder App (Student and Class details)
 */

import { id, san, ini } from '../utils.js';
import { dbGet } from '../firebase.js';
import { state, updateState } from '../state.js';
import { CLASSES, CLASS_REQUIREMENTS } from '../config.js';

export async function openClassModal(classId, className, classIcon) {
    const modal = id('class-modal');
    const title = id('class-modal-title');
    const cont = id('class-modal-content');
    if (!modal) return;
    
    title.textContent = `${classIcon} ${className} Class`;
    cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Loading members...</div>';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';

    // Load all accounts and filter by class + club
    const all = await dbGet('accounts') || {};
    const members = Object.values(all).filter(a =>
        san(a.clubName || '') === state.clubKey && a.classId === classId
    );

    if (members.length === 0) {
        cont.innerHTML = '<div style="text-align:center;padding:24px;color:var(--mut)">No members in this class yet.</div>';
        return;
    }

    const students = members.filter(m => m.role === 'student');
    const instructors = members.filter(m => m.role === 'instructor');

    cont.innerHTML = `
        ${instructors.length > 0 ? `
        <div class="ct">INSTRUCTORS</div>
        ${instructors.map(m => `
            <div class="srow" style="margin-bottom:6px">
                <div class="av" style="background:var(--accent)">${ini(m.name)}</div>
                <div class="si"><div class="sn">${m.name}</div><div class="sm2">${m.slot === 'slot1' ? 'Instructor 1' : 'Instructor 2'}</div></div>
                <span class="badge bb">Instructor</span>
            </div>`).join('')}
        <div class="div"></div>` : ''}
        
        <div class="ct">STUDENTS (${students.length})</div>
        ${students.length === 0 ? 
            '<div style="font-size:13px;color:var(--mut);padding:10px">No students enrolled yet.</div>' :
            students.map(s => `
                <div class="srow" onclick="window.openStudentModal('${san(s.name)}','${s.name}','${classId}')" style="cursor:pointer" onmousedown="this.style.opacity='.7'" onmouseup="this.style.opacity='1'">
                    <div class="av">${ini(s.name)}</div>
                    <div class="si"><div class="sn">${s.name}</div><div class="sm2">Tap to view details</div></div>
                    <span style="color:var(--mut);font-size:16px">›</span>
                </div>`).join('')}
    `;
}

export function closeClassModal() {
    const modal = id('class-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.flexDirection = '';
    }
}

export async function openStudentModal(studentKey, studentName, classId) {
    const modal = id('student-modal');
    const title = id('modal-title');
    const cont = id('modal-content');
    if (!modal) return;

    // If already in class modal, hide it
    const classModal = id('class-modal');
    if (classModal && classModal.style.display === 'flex') {
        classModal.style.display = 'none';
        updateState({ stuFromClass: true });
    } else {
        updateState({ stuFromClass: false });
    }

    title.textContent = studentName;
    cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Loading details...</div>';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';

    // Load all data for this student in parallel
    const [scores, attData, hygData, honorsData, reqData, uploads] = await Promise.all([
        dbGet(`clubs/${state.clubKey}/scores/${classId}/${san(studentName)}`),
        dbGet(`clubs/${state.clubKey}/attendance/${classId}`),
        dbGet(`clubs/${state.clubKey}/hygiene/${classId}`),
        dbGet(`clubs/${state.clubKey}/honors/${san(studentName)}`),
        dbGet(`clubs/${state.clubKey}/requirements/${san(studentName)}`),
        dbGet(`clubs/${state.clubKey}/uploads/${studentKey}`),
    ]);

    // Process attendance
    let present = 0, late = 0, absent = 0;
    if (attData) {
        Object.values(attData).forEach(day => {
            if (typeof day !== 'object') return;
            Object.values(day).forEach(entry => {
                if (typeof entry === 'object' && entry.name === studentName) {
                    if (entry.status === 'p') present++;
                    else if (entry.status === 'l') late++;
                    else if (entry.status === 'ab2') absent++;
                }
            });
        });
    }

    // Process hygiene
    let lastHyg = 'Not recorded';
    if (hygData) {
        const days = Object.keys(hygData).sort().reverse();
        for (const day of days) {
            const dayData = hygData[day];
            if (typeof dayData !== 'object') continue;
            const entry = Object.values(dayData).find(e => typeof e === 'object' && e.name === studentName);
            if (entry) { 
                lastHyg = entry.level === 'perf' ? '✓ Perfect' : entry.level === 'good' ? '👍 Good' : '⚠️ Needs Improvement'; 
                break; 
            }
        }
    }

    // Process requirements
    const reqs = CLASS_REQUIREMENTS[classId] || CLASS_REQUIREMENTS.ranger;
    const reqDone = reqData ? Object.values(reqData).filter(v => v === true).length : 0;
    const reqPct = reqs.length > 0 ? Math.round((reqDone / reqs.length) * 100) : 0;

    const cls = CLASSES.find(c => c.id === classId);

    cont.innerHTML = `
        <div style="text-align:center;padding:16px 0;border-bottom:1px solid var(--border);margin-bottom:16px">
            <div class="av" style="width:60px;height:60px;font-size:22px;margin:0 auto 10px">${ini(studentName)}</div>
            <div style="font-size:18px;font-weight:800;color:var(--txt)">${studentName}</div>
            <div style="font-size:12px;color:var(--mut);margin-top:3px">${cls?.e || '⛺'} ${cls?.n || classId} Class</div>
        </div>

        <div class="ct">📊 INSTRUCTOR SCORES</div>
        ${scores ? `
            <div class="card" style="margin-bottom:12px">
                ${[{ k: 'punctuality', l: 'Punctuality' }, { k: 'neatness', l: 'Neatness' }, { k: 'clarity', l: 'Clarity' }].map(({ k, l }) => {
                    const v = scores[k] || 0;
                    return `
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                            <span style="font-size:12px;color:var(--mut)">${l}</span>
                            <span style="font-size:13px;font-weight:800;color:var(--amb)">${v}/5</span>
                        </div>
                        <div class="sbw" style="height:6px"><div class="sbar" style="width:${v * 20}%"></div></div>`;
                }).join('<div style="height:10px"></div>')}
            </div>` : 
            '<div class="card" style="margin-bottom:12px;text-align:center;font-size:12px;color:var(--mut)">No scores recorded yet</div>'}

        <div class="ct">✅ ATTENDANCE & HYGIENE</div>
        <div class="card" style="margin-bottom:12px;display:flex;justify-content:space-between;text-align:center">
            <div><div style="font-size:18px;font-weight:800;color:var(--a2)">${present}</div><div style="font-size:10px;color:var(--mut)">Present</div></div>
            <div><div style="font-size:18px;font-weight:800;color:var(--amb)">${late}</div><div style="font-size:10px;color:var(--mut)">Late</div></div>
            <div><div style="font-size:18px;font-weight:800;color:var(--red)">${absent}</div><div style="font-size:10px;color:var(--mut)">Absent</div></div>
            <div style="border-left:1px solid var(--border);padding-left:15px;text-align:right">
                <div style="font-size:13px;font-weight:700;color:var(--txt)">${lastHyg}</div><div style="font-size:10px;color:var(--mut)">Last Hygiene</div>
            </div>
        </div>

        <div class="ct">✍️ PROGRESS: ${reqPct}%</div>
        <div class="card" style="margin-bottom:12px">
            <div class="sbw"><div class="sbar" style="width:${reqPct}%"></div></div>
            <div style="font-size:11px;color:var(--mut);margin-top:8px">${reqDone} of ${reqs.length} requirements completed</div>
        </div>
    `;
}

export function closeStudentModal() {
    id('student-modal').style.display = 'none';
    if (state.stuFromClass) {
        id('class-modal').style.display = 'flex';
    }
}
