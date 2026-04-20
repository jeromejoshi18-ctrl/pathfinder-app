import { state } from '../state.js';
import { dbGet, dbSet, dbPush } from '../firebase.js';
import { id, toast, san, ini, load, hideLoad } from '../utils.js';
import { CLASS_REQUIREMENTS } from '../config.js';

export const ATT_COLORS = {
    p: { bg: '#059669', color: '#fff', border: '#059669' },
    l: { bg: '#d97706', color: '#fff', border: '#d97706' },
    ab2: { bg: '#dc2626', color: '#fff', border: '#dc2626' },
};

export const HYG_COLORS = {
    bad: { bg: '#dc2626', color: '#fff', border: '#dc2626' },
    good: { bg: '#d97706', color: '#fff', border: '#d97706' },
    perf: { bg: '#059669', color: '#fff', border: '#059669' },
};

export const ATT_DEFAULT = {
    p: { bg: 'transparent', color: '#059669', border: '#059669' },
    l: { bg: 'transparent', color: '#d97706', border: '#d97706' },
    ab2: { bg: 'transparent', color: '#dc2626', border: '#dc2626' },
};

export const HYG_DEFAULT = {
    bad: { bg: 'transparent', color: '#dc2626', border: '#dc2626' },
    good: { bg: 'transparent', color: '#d97706', border: '#d97706' },
    perf: { bg: 'transparent', color: '#059669', border: '#059669' },
};

export function applyBtnStyle(el, c) {
    if (!el) return;
    el.style.background = c.bg;
    el.style.color = c.color;
    el.style.borderColor = c.border;
}

export function markA(i, s) {
    ['p', 'l', 'ab2'].forEach(k => {
        applyBtnStyle(id('ar' + i + '-' + k), ATT_DEFAULT[k]);
    });
    applyBtnStyle(id('ar' + i + '-' + s), ATT_COLORS[s]);
}

export function markH(i, s) {
    ['bad', 'good', 'perf'].forEach(k => {
        applyBtnStyle(id('hr' + i + '-' + k), HYG_DEFAULT[k]);
    });
    applyBtnStyle(id('hr' + i + '-' + s), HYG_COLORS[s]);
}

export function getStu() {
    return state.classStudents;
}

export function buildAssDDs() {
    const stu = getStu();
    if (stu.length === 0) {
        const empty = '<option>No students yet</option>';
        ['ass-sel', 'sc-sel', 'req-stu-sel'].forEach(x => { const el = id(x); if (el) el.innerHTML = empty; });
        return;
    }
    const opts = stu.map((s, i) => `<option value="${i}">${s}</option>`).join('');
    ['ass-sel', 'sc-sel', 'req-stu-sel'].forEach(x => { const el = id(x); if (el) el.innerHTML = opts; });
}

export function loadNotes(i) {
    const ta = id('ass-ta');
    if (ta) ta.value = '';
}

export function buildStars() {
    ['p', 'n', 'c'].forEach(k => {
        const el = id('st-' + k); if (!el) return;
        el.innerHTML = [1, 2, 3, 4, 5].map(n => `<div class="st" id="star-${k}-${n}" onclick="window.setStar('${k}',${n})">⭐</div>`).join('');
    });
}

export function setStar(k, v) {
    state.sc[k] = v;
    [1, 2, 3, 4, 5].forEach(n => id(`star-${k}-${n}`)?.classList.toggle('on', n <= v));
    const valEl = id('sv-' + k);
    if (valEl) valEl.textContent = v + '/5';
}

export function assTab(tab) {
    const notesEl = id('ass-notes');
    const scoringEl = id('ass-scoring');
    const reqsEl = id('ass-requirements');
    
    if (notesEl) notesEl.style.display = tab === 'notes' ? 'block' : 'none';
    if (scoringEl) scoringEl.style.display = tab === 'scoring' ? 'block' : 'none';
    if (reqsEl) reqsEl.style.display = tab === 'requirements' ? 'block' : 'none';
    
    document.querySelectorAll('#sub-instructors-assessment > .tabs .tab').forEach((t, i) => {
        t.classList.toggle('a', ['notes', 'scoring', 'requirements'][i] === tab);
    });
    
    if (tab === 'scoring') { 
        const sel = id('sc-sel'); 
        if (sel && sel.value !== undefined) loadExistingScores(sel.value); 
    }
    if (tab === 'notes') { 
        const sel = id('ass-sel'); 
        if (sel && sel.value !== undefined) loadNotes(sel.value); 
    }
    if (tab === 'requirements') { 
        const sel = id('req-stu-sel'); 
        if (sel && sel.value !== undefined) loadInstReqBook(sel.value); 
    }
}

export async function loadExistingScores(idx) {
    const sn = getStu()[idx];
    if (!sn) return;
    const data = await dbGet(`clubs/${state.clubKey}/scores/${state.cu.classId}_${san(sn)}`);
    ['p', 'n', 'c'].forEach(k => {
        const v = (data && data[k]) || 0;
        setStar(k, v);
    });
}

export async function loadInstReqBook(idx) {
    const sn = getStu()[idx];
    const cont = id('req-book-list');
    if (!sn || !cont) return;
    cont.innerHTML = '<div style="padding:20px;text-align:center;color:var(--mut)">Loading...</div>';
    
    const reqs = CLASS_REQUIREMENTS[state.cu.classId] || CLASS_REQUIREMENTS.ranger;
    const data = await dbGet(`clubs/${state.clubKey}/requirements/${san(sn)}`) || {};
    
    cont.innerHTML = reqs.map((r, i) => `
        <div class="srow">
            <div class="si">
                <div class="sm2" style="font-size:10px">${r.cat}</div>
                <div class="sn" style="font-size:13px">${r.req}</div>
            </div>
            <input type="checkbox" ${data[i] ? 'checked' : ''} onchange="window.saveReq(${idx},${i},this.checked)">
        </div>`).join('');
}

export async function saveReq(stuIdx, reqIdx, val) {
    const sn = getStu()[stuIdx];
    if (!sn) return;
    // For requirement checkboxes, we update the whole doc or a field
    const data = await dbGet(`clubs/${state.clubKey}/requirements/${san(sn)}`) || {};
    data[reqIdx] = val;
    await dbSet(`clubs/${state.clubKey}/requirements/${san(sn)}`, data);
    toast('✅ Progress updated');
}

export async function saveScores() {
    const sel = id('sc-sel');
    const sn = getStu()[sel.value];
    if (!sn) return;
    
    load('Saving scores...');
    const obj = {
        p: state.sc.p,
        n: state.sc.n,
        c: state.sc.c,
        ts: Date.now(),
        by: state.cu.name
    };
    await dbSet(`clubs/${state.clubKey}/scores/${state.cu.classId}_${san(sn)}`, obj);

    hideLoad();
    toast('✅ Scores saved!');
}

export async function saveAtt() {
    const stu = getStu();
    if (!stu || stu.length === 0) return;
    
    const att = {};
    stu.forEach((s, i) => {
        ['p', 'l', 'ab2'].forEach(k => {
            const btn = id('ar' + i + '-' + k);
            if (btn && btn.style.background !== 'transparent' && btn.style.background !== '') {
                att[san(s)] = { name: s, status: k };
            }
        });
    });
    
    if (Object.keys(att).length === 0) {
        toast('Please mark attendance for at least one student');
        return;
    }

    load('Saving Attendance...');
    await dbSet(`clubs/${state.clubKey}/attendance/${state.cu.classId}_${today()}`, att);
    hideLoad();
    toast('✅ Attendance saved!');
}

export async function saveHyg() {
    const stu = getStu();
    if (!stu || stu.length === 0) return;

    const hyg = {};
    stu.forEach((s, i) => {
        ['bad', 'good', 'perf'].forEach(k => {
            const btn = id('hr' + i + '-' + k);
            if (btn && btn.style.background !== 'transparent' && btn.style.background !== '') {
                hyg[san(s)] = { name: s, level: k };
            }
        });
    });

    if (Object.keys(hyg).length === 0) {
        toast('Please mark hygiene for at least one student');
        return;
    }

    load('Saving Hygiene...');
    await dbSet(`clubs/${state.clubKey}/hygiene/${state.cu.classId}_${today()}`, hyg);
    hideLoad();
    toast('✅ Hygiene check saved!');
}

