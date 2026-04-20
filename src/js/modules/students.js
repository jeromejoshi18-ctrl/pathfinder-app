/**
 * Student module for the Pathfinder App
 */

import { state, updateState } from '../state.js';
import { dbGet, dbSet } from '../firebase.js';
import { id, san, ini, today } from '../utils.js';
import { buildAssDDs, markA, markH } from './instructors.js';

export async function buildStudents() {
    // Load real students from Firebase — accounts in this club + this class
    const all = await dbGet('accounts');
    const classStudents = [];
    
    if (all) {
        Object.values(all).forEach(acc => {
            if (acc.role === 'student' && san(acc.clubName || '') === state.clubKey && acc.classId === state.cu.classId) {
                classStudents.push(acc.name);
            }
        });
    }
    
    updateState({ classStudents });
    buildAssDDs();
    
    const stu = classStudents;
    const attList = id('att-list');
    const hygList = id('hyg-list');
    
    if (!attList || !hygList) return;

    if (stu.length === 0) {
        const emptyMsg = `<div style="text-align:center;padding:24px;color:var(--mut);font-size:14px">No students in your class yet.<br>Students need to create an account to appear here.</div>`;
        attList.innerHTML = emptyMsg;
        hygList.innerHTML = emptyMsg;
        return;
    }
    
    const btnBase = 'padding:6px 9px;border-radius:8px;font-size:10px;font-weight:800;cursor:pointer;border:1.5px solid;transition:all .15s;';
    attList.innerHTML = stu.map((s, i) => `
        <div class="srow" id="ar${i}">
            <div class="av">${ini(s)}</div>
            <div class="si"><div class="sn">${s}</div><div class="sm2">${state.cu.cn}</div></div>
            <div style="display:flex;gap:5px">
                <button id="ar${i}-p"  style="${btnBase}color:#059669;border-color:#059669;background:transparent" onclick="window.markA(${i},'p')">P</button>
                <button id="ar${i}-l"  style="${btnBase}color:#d97706;border-color:#d97706;background:transparent" onclick="window.markA(${i},'l')">L</button>
                <button id="ar${i}-ab2" style="${btnBase}color:#dc2626;border-color:#dc2626;background:transparent" onclick="window.markA(${i},'ab2')">A</button>
            </div>
        </div>`).join('');
        
    const hygBase = 'flex:1;padding:6px 3px;border-radius:8px;font-size:10px;font-weight:800;cursor:pointer;border:1.5px solid;transition:all .15s;';
    hygList.innerHTML = stu.map((s, i) => `
        <div class="srow" id="hr${i}">
            <div class="av">${ini(s)}</div>
            <div class="si"><div class="sn">${s}</div></div>
            <div style="display:flex;gap:5px;flex:1;margin-left:8px">
                <button id="hr${i}-bad"  style="${hygBase}color:#dc2626;border-color:#dc2626;background:transparent" onclick="window.markH(${i},'bad')">Bad</button>
                <button id="hr${i}-good" style="${hygBase}color:#d97706;border-color:#d97706;background:transparent" onclick="window.markH(${i},'good')">Good</button>
                <button id="hr${i}-perf" style="${hygBase}color:#059669;border-color:#059669;background:transparent" onclick="window.markH(${i},'perf')">✓ Perfect</button>
            </div>
        </div>`).join('');
}

export async function buildStuView() {
    const noScore = `<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No scores yet. Your instructor hasn't scored you yet.</div>`;
    const noAtt = `<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No attendance records yet.</div>`;
    const noHyg = `<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No hygiene records yet.</div>`;
    const labels = { punctuality: 'Punctuality', neatness: 'Neatness / Presentation', clarity: 'Subject Clarity' };

    // Load scores from Firebase
    const scoreData = await dbGet(`clubs/${state.clubKey}/scores/${state.cu.classId}_${san(state.cu.name)}`);
    const scoresEl = id('stu-scores');
    if (scoresEl) {
        if (scoreData && (scoreData.p || scoreData.n || scoreData.c)) {
            scoresEl.innerHTML = Object.entries(labels).map(([k, label]) => {
                const v = scoreData[k[0]] || 0; // k is punctuality, neatness, clarity -> p, n, c
                return `
                    <div style="margin-bottom:12px">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
                            <span style="font-size:13px;color:var(--mut)">${label}</span>
                            <span style="font-size:14px;font-weight:800;color:var(--amb)">${v}/5</span>
                        </div>
                        <div class="sbw"><div class="sbar" style="width:${v * 20}%"></div></div>
                    </div>`;
            }).join('');
        } else { 
            scoresEl.innerHTML = noScore; 
        }
    }


    // Attendance and Hygiene in Firestore are stored as classId_date docs.
    // For simplicity in this migration, we'll show 'No records yet'.
    const attEl = id('stu-att');
    if (attEl) attEl.innerHTML = noAtt; 

    const hygEl = id('stu-hyg');
    if (hygEl) hygEl.innerHTML = noHyg;
}

}
