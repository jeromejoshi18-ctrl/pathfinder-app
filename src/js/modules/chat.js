/**
 * Chat and Messaging module for the Pathfinder App
 */

import { id, esc, toast, san } from '../utils.js';
import { state, updateState } from '../state.js';
import { dbPush, dbListen } from '../firebase.js';
import { CLASSES } from '../config.js';

/**
 * Initialize chat tabs based on user role and class
 */
export function buildChatTabs() {
    const isDir = state.cu.role === 'director';
    
    // Everyone gets: Club-wide
    let channels = [
        { id: 'global', label: '📢 Club-wide' },
    ];

    // Students + Instructors get their own class channel
    if (state.cu.classId && state.cu.classId !== 'all') {
        const cls = CLASSES.find(c => c.id === state.cu.classId);
        if (cls) {
            channels.push({ id: 'class-' + state.cu.classId, label: cls.e + ' ' + cls.n + ' Class' });
        }
    }

    // Director sees ALL class channels
    if (isDir) {
        CLASSES.forEach(cls => {
            if (!channels.find(c => c.id === 'class-' + cls.id))
                channels.push({ id: 'class-' + cls.id, label: cls.e + ' ' + cls.n });
        });
    }

    const chatTabs = id('chat-tabs');
    if (chatTabs) {
        chatTabs.innerHTML = channels.map(c => 
            `<div class="ctab${c.id === state.activeChat ? ' a' : ''}" 
                  id="ctab-${c.id}" 
                  onclick="switchChat('${c.id}')">
                ${c.label}
            </div>`
        ).join('');
    }
}

/**
 * Switch to a different chat channel
 * @param {string} chanId - Channel ID
 */
export function switchChat(chanId) {
    updateState({ activeChat: chanId });
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('a'));
    id('ctab-' + chanId)?.classList.add('a');

    const minp = id('minp');
    if (minp) {
        minp.placeholder = chanId === 'global'
            ? 'Message everyone in your club...'
            : 'Message your class...';
    }
    
    const mbar = id('mbar');
    if (mbar) {
        mbar.style.pointerEvents = 'auto';
        mbar.style.opacity = '1';
    }

    // Stop previous listener
    if (state.msgOff) {
        state.msgOff();
        updateState({ msgOff: null });
    }
    
    listenMsgs(chanId);
}

/**
 * Listen for messages in a specific channel
 * @param {string} chanId - Channel ID
 */
export function listenMsgs(chanId) {
    const list = id('msg-list');
    if (list) list.innerHTML = '';

    // In a real app, you might want to track these to avoid re-rendering
    let lastMsgCount = 0;
    
    const path = `clubs/${state.clubKey}/messages/${chanId}`;
    const unsubscribe = dbListen(path, raw => {
        if (!raw) { 
            renderMsgs([], chanId, 0); 
            return; 
        }
        const msgs = Object.values(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0)).slice(-80);
        renderMsgs(msgs, chanId, lastMsgCount);
        lastMsgCount = msgs.length;
    });
    
    updateState({ msgOff: unsubscribe });
}

/**
 * Render messages in the chat list
 */
function renderMsgs(msgs, chanId, lastCount) {
    const list = id('msg-list');
    if (!list) return;

    if (msgs.length === 0) {
        list.innerHTML = `<div id="no-msgs-placeholder" style="text-align:center;padding:30px 20px;color:var(--mut);font-size:14px">No messages yet. Be the first! 👋</div>`;
        return;
    }

    // Simplification: always re-render for now to ensure consistency
    // A more advanced version would only append new ones
    list.innerHTML = msgs.map(m => msgBubbleHTML(m)).join('');
    list.scrollTop = list.scrollHeight;
    
    // Check for notifications
    if (msgs.length > lastCount) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.uid !== state.cu?.uid) {
            checkNewMessages(chanId, msgs);
        }
    }
}

/**
 * Generate HTML for a single message bubble
 */
function msgBubbleHTML(m) {
    const mine = m.uid === state.cu?.uid;
    const roleBadge = m.r === 'director' ? 'ba' : m.r === 'instructor' ? 'bb' : m.r === 'masterguide' ? 'bp' : 'bg';
    const dispRole = m.roleLabel || m.r || 'student';
    
    return `<div class="mbub ${mine ? 'me' : 'them'}">
        ${!mine ? `<div class="bn">${esc(m.s || '')} <span class="badge ${roleBadge}">${dispRole}</span></div>` : ''}
        <div class="bt">${esc(m.t || m.text || '')}</div>
        <div class="btime">${m.tm || m.time || ''}</div>
    </div>`;
}

/**
 * Send a new message
 */
export async function sendMsg() {
    const inp = id('minp');
    if (!inp) return;
    const txt = inp.value.trim();
    if (!txt) return;

    // Restriction: Students cannot send messages in global chat
    if (state.cu.role === 'student' && state.activeChat === 'global') {
        toast('⚠️ Students are not allowed to send messages in the club-wide chat.');
        return;
    }

    // Clear input immediately
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

    await dbPush(`clubs/${state.clubKey}/messages/${state.activeChat}`, obj);
}

/**
 * Handle browser/app notifications for new messages
 */
function checkNewMessages(cid, msgs) {
    if (!msgs || !msgs.length) return;
    const l = msgs[msgs.length - 1];
    const lastTs = state.lastMsgTimestamps[cid] || 0;
    
    if (l.ts > lastTs && l.uid !== state.cu?.uid) {
        showNotification('New Message', l.t, cid);
    }
    
    const newTimestamps = { ...state.lastMsgTimestamps };
    newTimestamps[cid] = l.ts;
    updateState({ lastMsgTimestamps: newTimestamps });
}

function showNotification(t, b, c) {
    if (state.notifPermission && Notification.permission === 'granted') {
        new Notification(t, { body: b, tag: c });
    } else {
        const ba = document.createElement('div');
        ba.style.cssText = 'position:fixed;top:70px;left:12px;right:12px;background:var(--accent);color:#fff;border-radius:12px;padding:12px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2)';
        ba.innerHTML = b;
        ba.onclick = () => { 
            ba.remove(); 
            if (window.swTab) window.swTab('messages'); 
        };
        document.body.appendChild(ba);
        setTimeout(() => ba.remove(), 5000);
    }
}
