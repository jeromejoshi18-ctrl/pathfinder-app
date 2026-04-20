/**
 * Messaging and Chat module for the Pathfinder App
 */

import { id, toast, esc } from '../utils.js';
import { dbPush, dbListen } from '../firebase.js';
import { state } from '../state.js';

let lastMsgCount = 0;
let renderedMsgKeys = new Set();
let demoMsgs = { global: [], devotion: [] };

export function msgBubbleHTML(m) {
    const isMe = m.uid === state.cu?.uid;
    const initial = (m.s || '??').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    return `
    <div class="msg ${isMe ? 'me' : 'other'}">
      ${!isMe ? `<div class="av">${initial}</div>` : ''}
      <div class="mcont">
        ${!isMe ? `<div class="ms">${m.s} <span class="mrl">${m.roleLabel || ''}</span></div>` : ''}
        <div class="mtxt">${esc(m.t)}</div>
        <div class="mtm">${m.tm || ''}</div>
      </div>
    </div>`;
}

export function renderMsgs(msgs, chanId) {
    const list = id('msg-list');
    if (!list) return;

    if (!msgs || msgs.length === 0) {
        list.innerHTML = `<div id="no-msgs-placeholder" style="text-align:center;padding:40px;color:var(--mut);font-size:14px;opacity:0.7">
            <div style="font-size:32px;margin-bottom:12px">💬</div>
            No messages yet. Be the first to start the conversation!
        </div>`;
        lastMsgCount = 0;
        renderedMsgKeys.clear();
        return;
    }

    if (lastMsgCount === 0) {
        list.innerHTML = msgs.map(m => {
            renderedMsgKeys.add(m.key || m.ts);
            return msgBubbleHTML(m);
        }).join('');
        list.scrollTop = list.scrollHeight;
        lastMsgCount = msgs.length;
    } else {
        const newMsgs = msgs.slice(lastMsgCount);
        const wasAtBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
        newMsgs.forEach(m => {
            const key = m.key || m.ts || '';
            if (renderedMsgKeys.has(key)) return;
            renderedMsgKeys.add(key);
            const div = document.createElement('div');
            div.innerHTML = msgBubbleHTML(m);
            list.appendChild(div.firstChild);
        });
        lastMsgCount = msgs.length;
        if (wasAtBottom) list.scrollTop = list.scrollHeight;
    }
}

export async function sendMsg() {
    const inp = id('minp');
    if (!inp) return;
    const txt = inp.value.trim();
    if (!txt) return;

    if (state.cu.role === 'student' && state.activeChat === 'global') {
        toast('⚠️ Students are not allowed to send messages in the club-wide chat.');
        return;
    }

    if (state.activeChat.startsWith('devotion-') && state.cu.role === 'student') {
        toast('📖 Devotion is read-only for students.');
        return;
    }
    
    if (state.activeChat.startsWith('class-') && state.cu.role !== 'director') {
        const clsId = state.activeChat.replace('class-', '');
        if (clsId !== state.cu.classId) {
            toast('🔒 You can only post in your own class channel.');
            return;
        }
    }

    inp.value = '';
    inp.focus();

    const now = new Date();
    const roleLabel = state.cu.role === 'instructor'
        ? (state.cu.slot === 'slot1' ? 'Instructor 1' : 'Instructor 2')
        : state.cu.role === 'director'
            ? (state.cu.dirType === 'deputy' ? 'Deputy Director' : 'Director')
            : 'student';
            
    const obj = {
        s: state.cu.name,
        r: state.cu.role,
        roleLabel,
        uid: state.cu.uid,
        t: txt,
        tm: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        ts: now.getTime(),
        cls: state.cu.classId || 'all'
    };

    if (state.demoMode) {
        const key = state.activeChat === 'global' ? 'global' : state.activeChat.startsWith('devotion-') ? 'devotion' : state.activeChat.replace('class-', '');
        if (!demoMsgs[key]) demoMsgs[key] = [];
        demoMsgs[key].push({ ...obj, key: 'demo-' + Date.now() });
        renderMsgs(demoMsgs[key], state.activeChat);
    } else {
        const list = id('msg-list');
        if (list) {
            const placeholder = id('no-msgs-placeholder');
            if (placeholder) placeholder.remove();
            const div = document.createElement('div');
            div.innerHTML = msgBubbleHTML({ ...obj, key: 'optimistic-' + Date.now() });
            list.appendChild(div.firstChild);
            list.scrollTop = list.scrollHeight;
            lastMsgCount++;
        }
        dbPush(`clubs/${state.clubKey}/messages/${state.activeChat}/list`, obj);
    }
}

export function initChat(chanId) {
    lastMsgCount = 0;
    renderedMsgKeys.clear();
    const list = id('msg-list');
    if (list) list.innerHTML = '';
    
    if (state.msgOff) state.msgOff();
    
    if (state.demoMode) {
        const key = chanId === 'global' ? 'global' : chanId.startsWith('devotion-') ? 'devotion' : chanId.replace('class-', '');
        renderMsgs(demoMsgs[key] || [], chanId);
    } else {
        state.msgOff = dbListen(`clubs/${state.clubKey}/messages/${chanId}/list`, msgs => {
            const arr = msgs ? Object.keys(msgs).map(k => ({ ...msgs[k], key: k })) : [];
            renderMsgs(arr, chanId);
        });
    }
}

