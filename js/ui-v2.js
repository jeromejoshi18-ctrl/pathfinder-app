// NAVIGATION
// ═══════════════════════════════════════════════════
function buildNav() {
  let tabs;
  const isMG = cu.classId === 'masterguide';
  if (cu.role === 'student')
    tabs = [{ id: 'home', e: '🏠', l: 'Home' }, { id: 'students', e: '📊', l: 'My Panel' }, { id: 'devotion', e: '📖', l: 'Devotion' }, { id: 'messages', e: '💬', l: 'Chat' }, { id: 'settings', e: '⚙️', l: 'Settings' }];
  else if (cu.role === 'instructor')
    tabs = [{ id: 'home', e: '🏠', l: 'Home' }, { id: 'instructors', e: '📋', l: 'Instruct.' }, { id: 'devotion', e: '📖', l: 'Devotion' }, { id: 'messages', e: '💬', l: 'Chat' }, { id: 'settings', e: '⚙️', l: 'Settings' }];
  else
    tabs = [{ id: 'home', e: '🏠', l: 'Home' }, { id: 'directors', e: '🎖', l: 'Director' }, { id: 'devotion', e: '📖', l: 'Devotion' }, { id: 'masterguide', e: '🏅', l: 'MG' }, { id: 'messages', e: '💬', l: 'Chat' }, { id: 'settings', e: '⚙️', l: 'Settings' }];
  id('bnav').innerHTML = tabs.map((t, i) => `<button class="nb${i === 0 ? ' a' : ''}" id="nb-${t.id}" onclick="swTab('${t.id}')"><span class="ni">${t.e}</span><span>${t.l}</span></button>`).join('');
}

function swTab(tab, addHistory = true) {
  if (addHistory && currentTab !== tab) {
    navHistory.push(currentTab);
    if (navHistory.length > 20) navHistory.shift(); // keep max 20
  }
  currentTab = tab;
  document.querySelectorAll('.con').forEach(c => c.style.display = 'none');
  id('tab-' + tab).style.display = 'block';
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('a'));
  id('nb-' + tab)?.classList.add('a');
  const bar = id('mbar');
  if (bar) bar.style.display = tab === 'messages' ? 'flex' : 'none';
  if (tab === 'messages') setTimeout(() => { const m = id('msg-list'); if (m) m.scrollTop = m.scrollHeight; }, 100);
  if (tab === 'devotion') initDevotionTab();
  if (tab === 'students') buildStuView();
}

function getLastSaturday() {
  const d = new Date();
  const day = d.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = (day + 1) % 7; // distance to last Saturday
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function subTab(parent, tab, addHistory = true) {
  if (addHistory) {
    navHistory.push('sub:' + parent + ':' + (window.lastSubTab || ''));
  }
  window.lastSubTab = tab;

  // Hide all sub-containers for this parent
  document.querySelectorAll(`#tab-${parent} [id^="sub-${parent}-"]`).forEach(c => c.style.display = 'none');

  // Show the target sub-container
  const target = id(`sub-${parent}-${tab}`);
  if (target) target.style.display = 'block';

  // Update tab styles
  document.querySelectorAll(`#tab-${parent} .tabs .tab`).forEach(t => {
    const onclick = t.getAttribute('onclick') || '';
    t.classList.toggle('a', onclick.includes(`'${tab}'`));
  });

  // Specific initializations
  if (parent === 'instructors' && tab === 'attendance') {
    if (!id('att-date-input').value) {
      id('att-date-input').value = getLastSaturday();
    }
    // If a student was already selected, refresh history
    if (attSelectedStudent) {
      loadStudentAttendance(id('att-stu-sel').value);
    }
  }
}

async function initDevotionTab() {
  const isStudent = cu.role === 'student';
  id('dev-student-view').style.display = isStudent ? 'block' : 'none';
  id('dev-instructor-view').style.display = !isStudent ? 'block' : 'none';

  if (!isStudent) {
    if (!id('dev-post-date').value) id('dev-post-date').value = today();
  }
  
  loadDevotionHistory();
}

async function loadDevotionHistory() {
  const isStudent = cu.role === 'student';
  const targetId = isStudent ? 'dev-posts-list' : 'dev-inst-history-list';
  const list = id(targetId);
  if (!list) return;

  const posts = await dbGet(`clubs/${clubKey}/devotionPosts/${cu.classId}`) || {};
  const sortedPosts = Object.entries(posts).sort((a, b) => b[1].ts - a[1].ts);

  if (sortedPosts.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">No devotion posts yet.</div>';
    return;
  }

  if (isStudent) {
    // For students, check journals for each post
    const journals = await dbGet(`clubs/${clubKey}/devotionJournals/${cu.classId}`) || {};
    
    list.innerHTML = sortedPosts.map(([pid, p]) => {
      const myJournal = (journals[pid] && journals[pid][san(cu.name)]) ? journals[pid][san(cu.name)] : null;
      return `
        <div class="card" style="margin-bottom:12px;padding:15px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div style="font-size:11px;color:var(--a2);font-weight:800">${new Date(p.tm).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}</div>
            <div style="font-size:11px;color:var(--mut)">Posted by ${p.s}</div>
          </div>
          <div style="font-size:15px;line-height:1.5;margin-bottom:12px">${p.t}</div>
          
          <div id="dev-status-${pid}">
            ${myJournal 
              ? `<div style="display:flex;align-items:center;gap:10px;color:var(--a2);background:rgba(5,150,105,.1);padding:10px;border-radius:8px">
                  <span style="font-size:18px">✅</span>
                  <div style="font-size:12px;flex:1"><strong>Journal Submitted</strong></div>
                  <img src="${myJournal.url}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;cursor:pointer" onclick="window.open('${myJournal.url}','_blank')">
                  <button class="sbtn" style="width:auto;padding:4px 8px;font-size:10px;background:var(--amb)" onclick="openDevotionUpload('${pid}')">Update</button>
                 </div>`
              : `<button class="sbtn" style="background:var(--accent)" onclick="openDevotionUpload('${pid}')">📓 Upload Journal</button>`
            }
          </div>
        </div>
      `;
    }).join('');
  } else {
    // For instructors
    list.innerHTML = sortedPosts.map(([pid, p]) => `
      <div class="card" style="margin-bottom:10px;padding:12px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:12px;font-weight:700">${new Date(p.tm).toLocaleDateString()}</div>
          <div style="font-size:11px;color:var(--mut);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.t}</div>
        </div>
        <button class="sbtn" style="width:auto;padding:6px 12px;font-size:11px" onclick="viewPostJournals('${pid}', '${p.tm}')">View Journals 👁️</button>
      </div>
    `).join('');
  }
}

async function viewPostJournals(pid, dateStr) {
  const dash = id('dev-journal-dash');
  const list = id('dev-journal-list');
  id('dev-dash-date').textContent = new Date(dateStr).toLocaleDateString();
  dash.style.display = 'block';
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Loading journals...</div>';

  const journals = await dbGet(`clubs/${clubKey}/devotionJournals/${cu.classId}/${pid}`) || {};
  const entries = Object.values(journals);

  if (entries.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">No journals submitted yet.</div>';
    return;
  }

  list.innerHTML = entries.map(j => `
    <div class="card" style="margin-bottom:8px;padding:10px;display:flex;align-items:center;gap:12px">
      <div class="av">${ini(j.name)}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${j.name}</div>
        <div style="font-size:11px;color:var(--mut)">${j.note || 'No note'}</div>
      </div>
      <img src="${j.url}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer" onclick="window.open('${j.url}','_blank')">
    </div>
  `).join('');
  
  dash.scrollIntoView({ behavior: 'smooth' });
}

window.currentDevotionPostId = null;
function openDevotionUpload(pid) {
  window.currentDevotionPostId = pid;
  requestImageFromApp('devotion');
}

function handleGalleryUpload(input, type) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (!file.type.startsWith('image/')) { toast('⚠️ Please select an image file'); return; }
  
  toast('Reading image...');
  const reader = new FileReader();
  reader.onload = e => {
    if (window.receiveImageFromApp) {
      window.receiveImageFromApp(e.target.result, type);
    }
  };
  reader.readAsDataURL(file);
}

async function loadStudentHistory(type, targetId) {
  const list = id(targetId);
  if (!list) return;
  list.innerHTML = '<div style="padding:10px;text-align:center">Loading history...</div>';

  const cat = type.endsWith('s') ? type : type + 's';
  const path = `clubs/${clubKey}/uploads/${cat}/${cu.classId}/${san(cu.name)}/history`;
  const data = await dbGet(path);

  if (!data || Object.keys(data).length === 0) {
    list.innerHTML = '<div style="padding:10px;text-align:center;color:var(--mut)">No submissions yet.</div>';
    return;
  }

  const items = Object.entries(data)
    .filter(([fid, f]) => f && typeof f === 'object' && f.url)
    .map(([fid, f]) => ({ ...f, fid }))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));

  list.innerHTML = items.map(f => `
        <div class="card" style="padding:10px;margin-bottom:8px;background:var(--bg2)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div style="flex:1">
              <div style="font-weight:700;font-size:12px">${f.name || type.toUpperCase()}</div>
              <div style="font-size:10px;color:var(--mut)">${f.ts ? new Date(f.ts).toLocaleDateString() : 'Date unknown'}</div>
              ${f.note ? `<div style="font-size:10px;color:var(--txt);margin-top:4px;font-style:italic">"${f.note}"</div>` : ''}
            </div>
            <div style="text-align:right">
              <div class="badge ${f.viewedByInstructor ? 'bg' : 'br'}" style="font-size:9px;margin-bottom:5px">
                ${f.viewedByInstructor ? 'Viewed' : 'Sent'}
              </div>
              <img src="${f.url}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;display:block;cursor:pointer;background:var(--bg3)" onclick="window.open('${f.url}', '_blank')">
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="sbtn" style="padding:4px 8px;font-size:10px;background:var(--accent);flex:1" onclick="window.open('${f.url}', '_blank')">👁️ View Full</button>
            <button class="sbtn" style="padding:4px 8px;font-size:10px;background:var(--red);flex:1" onclick="deleteUploadRecord('${type}', '${f.fid}', '${targetId}')">🗑️ Delete</button>
          </div>
        </div>
      `).join('');
}

async function deleteUploadRecord(type, fid, targetId) {
  if (!confirm('Are you sure you want to delete this upload?')) return;
  const cat = type.endsWith('s') ? type : type + 's';
  const path = `clubs/${clubKey}/uploads/${cat}/${cu.classId}/${san(cu.name)}/history/${fid}`;
  const ok = await dbDelete(path);
  if (ok) {
    toast('✅ Upload deleted');
    loadStudentHistory(type, targetId);
  } else {
    toast('❌ Delete failed');
  }
}
window.deleteUploadRecord = deleteUploadRecord;

function upTab(tab) {
  ['requirements', 'honors'].forEach(t => {
    const el = id('up-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('#sub-students-uploads > .tabs .tab').forEach((t, i) => {
    t.classList.toggle('a', ['requirements', 'honors'][i] === tab);
  });
  if (tab === 'honors') loadStudentHistory('honors', 'hon-history-list');
  if (tab === 'requirements') loadStudentHistory('requirements', 'req-history-list');
}

async function submitRequirementDirect() {
  const name = id('req-name-input').value.trim();
  const note = id('req-note').value.trim();
  const photos = window.requirementPhotoData; // Now an array

  if (!name) { toast('⚠️ Please enter the name of the requirement!'); return; }
  if (!photos || (Array.isArray(photos) && photos.length === 0)) { toast('⚠️ Please upload a photo of your work first!'); return; }

  const photoArray = Array.isArray(photos) ? photos : [photos];
  toast(`Submitting ${photoArray.length} items...`);
  
  const path = `clubs/${clubKey}/uploads/requirements/${cu.classId}/${san(cu.name)}/history`;

  for (const photo of photoArray) {
    const url = await uploadToCloudinary(photo, `req_${san(name)}_${Date.now()}`);
    if (!url) continue;

    const obj = {
      name,
      note,
      url,
      ts: Date.now(),
      date: today(),
      by: cu.name,
      type: 'requirements',
      status: 'pending'
    };
    await dbPush(path, obj);
  }

  window.requirementPhotoData = null;
  id('req-name-input').value = '';
  id('req-note').value = '';
  id('req-photo-preview').style.display = 'none';

  toast('✅ Submitted to instructor!');
  setTimeout(() => {
    loadStudentHistory('requirements', 'req-history-list');
  }, 1000);
}

async function submitHonorDirect() {
  const name = id('hon-name-input').value.trim();
  const note = id('hon-note').value.trim();
  const photos = window.honorPhotoData; // Now an array

  if (!name) { toast('⚠️ Please enter the name of the honor!'); return; }
  if (!photos || (Array.isArray(photos) && photos.length === 0)) { toast('⚠️ Please upload a photo of your work first!'); return; }

  const photoArray = Array.isArray(photos) ? photos : [photos];
  toast(`Submitting ${photoArray.length} items...`);
  
  const path = `clubs/${clubKey}/uploads/honors/${cu.classId}/${san(cu.name)}/history`;

  for (const photo of photoArray) {
    const url = await uploadToCloudinary(photo, `honor_${san(name)}_${Date.now()}`);
    if (!url) continue;

    const obj = {
      name,
      note,
      url,
      ts: Date.now(),
      date: today(),
      by: cu.name,
      type: 'honors',
      status: 'pending'
    };
    await dbPush(path, obj);
  }

  window.honorPhotoData = null;
  id('hon-name-input').value = '';
  id('hon-note').value = '';
  id('hon-photo-preview').style.display = 'none';

  toast('✅ Submitted to instructor!');
  setTimeout(() => {
    loadStudentHistory('honors', 'hon-history-list');
  }, 1000);
}

// ═══════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════
function buildHome() {
  let s = [];
  if (cu.role === 'student') {
    s = [
      { e: '📊', n: 'My Scores', d: 'Instructor scores', a: "swTab('students')" },
      { e: '📤', n: 'Uploads', d: 'Submit work', a: "swTab('students');subTab('students','uploads');upTab('requirements')" },
      { e: '💬', n: 'Chat', d: 'Club messages', a: "swTab('messages')" },
      { e: '⚙️', n: 'Settings', d: 'App preferences', a: "swTab('settings')" },
    ];
  } else if (cu.role === 'instructor') {
    s = [
      { e: '✅', n: 'Attendance', d: 'Mark class', a: "swTab('instructors')" },
      { e: '📁', n: 'Uploads', d: 'View history', a: "swTab('instructors');subTab('instructors','stuuploads')" },
      { e: '📋', n: 'Scoring', d: 'Score students', a: "swTab('instructors');subTab('instructors','assessment')" },
      { e: '💬', n: 'Chat', d: 'Club messages', a: "swTab('messages')" },
    ];
  } else {
    s = [
      { e: '📊', n: 'Dashboard', d: 'Club overview', a: "swTab('directors')" },
      { e: '🏅', n: 'MG Program', d: 'Master Guide', a: "swTab('masterguide')" },
      { e: '💬', n: 'All Chats', d: 'View all channels', a: "swTab('messages')" },
      { e: '⚙️', n: 'Settings', d: 'App preferences', a: "swTab('settings')" },
    ];
  }
  id('hm-sections').innerHTML = s.map(x => `
        <div class="sc" onclick="${x.a}">
          <div style="font-size:28px;margin-bottom:7px">${x.e}</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:3px;color:var(--txt)">${x.n}</div>
          <div style="font-size:11px;color:var(--mut)">${x.d}</div>
        </div>
      `).join('');
}

// ═══════════════════════════════════════════════════
// AI FEATURES
// ═══════════════════════════════════════════════════
function triggerAINotif() {
  const msgs = [];
  if (cu.role === 'instructor' && settings.att) {
    const day = new Date().getDay();
    if (day === 6 || day === 0) msgs.push({ icon: '✅', title: 'Sabbath Attendance Reminder', body: 'Don\'t forget to mark attendance for today\'s Pathfinder meeting!' });
  }
  if (msgs.length > 0) {
    const m = msgs[0];
    const bn = id('ai-notif-banner');
    bn.style.display = 'block';
    bn.innerHTML = `<div class="ai-banner"><div class="ai-icon">${m.icon}</div><div style="flex:1"><div class="ai-title">${m.title}</div><div class="ai-body">${m.body}</div><button class="ai-dismiss" onclick="this.closest('.ai-banner').parentElement.style.display='none'">Got it ✨✓</button></div></div>`;
  }
}

function showAITip() {
  if (!settings.tip) return;
  const tips = AI_TIPS[cu.classId] || AI_TIPS.ranger;
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const card = id('ai-tip-card');
  card.style.display = 'block';
  id('ai-tip-text').textContent = tip;
}

// ═══════════════════════════════════════════════════
// MESSAGING — MULTI-CHANNEL WITH CLASS PRIVACY
// ═══════════════════════════════════════════════════
function buildChatTabs() {
  const isDir = cu.role === 'director';
  const isInst = cu.role === 'instructor';

  // Everyone gets: Club-wide
  let channels = [
    { id: 'global', label: '📢 Club-wide' },
  ];

  // Students + Instructors get their own class channel
  if (cu.classId && cu.classId !== 'all') {
    const cls = CLASSES.find(c => c.id === cu.classId);
    if (cls) {
      channels.push({ id: 'class-' + cu.classId, label: cls.e + ' ' + cls.n + ' Class' });
    }
  }

  // Director sees ALL class channels
  if (isDir) {
    CLASSES.forEach(cls => {
      if (!channels.find(c => c.id === 'class-' + cls.id))
        channels.push({ id: 'class-' + cls.id, label: cls.e + ' ' + cls.n });
    });
  }

  id('chat-tabs').innerHTML = channels.map(c => `<div class="ctab${c.id === 'global' ? ' a' : ''}" id="ctab-${c.id}" onclick="switchChat('${c.id}')">${c.label}</div>`).join('');
}

function switchChat(chanId) {
  activeChat = chanId;
  document.querySelectorAll('.ctab').forEach(t => t.classList.remove('a'));
  id('ctab-' + chanId)?.classList.add('a');

  // Students can read global and devotion but not post
  // Instructors + directors can post everywhere
  const isStudent = cu.role === 'student';
  const isGlobal = chanId === 'global';
  const isDevotion = chanId.startsWith('devotion-');
  const isOwnClass = chanId === 'class-' + cu.classId;

  const readOnly = isStudent && (isGlobal || isDevotion || (!isOwnClass && chanId.startsWith('class-')));

  id('minp').placeholder = readOnly
    ? 'Read-only channel'
    : (isGlobal ? 'Message everyone in your club...' : 'Message your class...');

  id('mbar').style.pointerEvents = readOnly ? 'none' : 'auto';
  id('mbar').style.opacity = readOnly ? '0.6' : '1';

  // Stop previous listener
  if (msgOff) { clearInterval(msgOff); msgOff = null; }
  listenMsgs(chanId);
}

// Track rendered message keys to avoid re-rendering same messages

function msgBubbleHTML(m) {
  const mine = m.uid === cu?.uid || m.s === cu?.name;
  const roleBadge = m.r === 'director' ? 'ba' : m.r === 'instructor' ? 'bb' : m.r === 'masterguide' ? 'bp' : 'bg';
  const dispRole = m.roleLabel || m.r || 'student';
  return `<div class="mbub ${mine ? 'me' : 'them'}" data-key="${m.key || m.ts || ''}">
    ${!mine ? `<div class="bn">${esc(m.s || '')} <span class="badge ${roleBadge}">${dispRole}</span></div>` : ''}
    <div class="bt">${esc(m.t || m.text || '')}</div>
    <div class="btime">${m.tm || m.time || ''}</div>
  </div>`;
}

function listenMsgs(chanId) {
  renderedMsgKeys = new Set();
  lastMsgCount = 0;
  const list = id('msg-list');
  if (list) list.innerHTML = '';

  if (demoMode) {
    let msgs = [];
    if (chanId === 'global') msgs = demoMsgs.global || [];
    else if (chanId.startsWith('devotion-')) msgs = demoMsgs.devotion || [];
    else {
      const clsId = chanId.replace('class-', '');
      msgs = (demoMsgs[clsId] || []);
      if (cu.role !== 'director') msgs = msgs.filter(m => !m.cls || m.cls === 'all' || m.cls === cu.classId);
    }
    renderMsgs(msgs, chanId);
    return;
  }
  const path = `clubs/${clubKey}/messages/${chanId}`;
  dbListen(path, raw => {
    if (!raw) { renderMsgs([], chanId); return; }
    const msgs = Object.values(raw).sort((a, b) => (a.ts || 0) - (b.ts || 0)).slice(-80);
    renderMsgs(msgs, chanId);
  }).then(timer => { msgOff = timer; });
}

function renderMsgs(msgs, chanId) {
  const list = id('msg-list');
  if (!list) return;

  // First render — build full list
  if (lastMsgCount === 0) {
    let html = '';
    if (msgs.length === 0) {
      html += `<div id="no-msgs-placeholder" style="text-align:center;padding:30px 20px;color:var(--mut);font-size:14px">No messages yet. Be the first! 👋</div>`;
    } else {
      msgs.forEach(m => { renderedMsgKeys.add(m.key || m.ts || ''); });
      html += msgs.map(m => msgBubbleHTML(m)).join('');
    }
    list.innerHTML = html;
    list.scrollTop = list.scrollHeight;
    lastMsgCount = msgs.length;
    if (msgs.length > 0) checkNewMessages(chanId || activeChat, msgs);
    return;
  }

  // Subsequent renders — only append NEW messages (no flicker!)
  if (msgs.length > lastMsgCount) {
    const placeholder = id('no-msgs-placeholder');
    if (placeholder) placeholder.remove();
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
    // Only auto-scroll if user was already at bottom
    if (wasAtBottom) list.scrollTop = list.scrollHeight;
    checkNewMessages(chanId || activeChat, msgs);
  }
}

window.checkNewMessages = function (chanId, msgs) {
  if (!msgs || msgs.length === 0) return;
  console.log(`Checking ${msgs.length} messages in ${chanId}`);
};

async function sendMsg() {
  const inp = id('minp'), txt = inp.value.trim();
  if (!txt) return;

  // Read-only checks
  if (cu.role === 'student' && (activeChat === 'global' || activeChat.startsWith('devotion-'))) {
    toast('🔒 This channel is read-only for students.'); return;
  }
  if (activeChat.startsWith('class-') && cu.role !== 'director') {
    const clsId = activeChat.replace('class-', '');
    if (clsId !== cu.classId) { toast('🔒 You can only post in your own class channel.'); return; }
  }

  // Clear input immediately for fast feel
  inp.value = '';
  inp.focus();

  const now = new Date();
  const roleLabel = cu.role === 'instructor'
    ? (cu.slot === 'slot1' ? 'Instructor 1' : 'Instructor 2')
    : cu.role === 'director'
      ? (cu.dirType === 'deputy' ? 'Deputy Director' : 'Director')
      : 'student';
  const obj = {
    s: cu.name, r: cu.role, roleLabel, uid: cu.uid,
    t: txt,
    tm: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    ts: now.getTime(),
    cls: cu.classId || 'all'
  };

  if (demoMode) {
    const key = activeChat === 'global' ? 'global' : activeChat.startsWith('devotion-') ? 'devotion' : activeChat.replace('class-', '');
    if (!demoMsgs[key]) demoMsgs[key] = [];
    demoMsgs[key].push({ ...obj, key: 'demo-' + Date.now() });
    renderMsgs(demoMsgs[key], activeChat);
  } else {
    // Optimistic UI — show message immediately before Firebase confirms
    const list = id('msg-list');
    if (list) {
      const placeholder = id('no-msgs-placeholder');
      if (placeholder) placeholder.remove();
      const div = document.createElement('div');
      div.innerHTML = msgBubbleHTML({ ...obj, key: 'optimistic-' + Date.now() });
      list.appendChild(div.firstChild);
      list.scrollTop = list.scrollHeight;
      lastMsgCount++; // prevent duplicate render when Firebase confirms
    }
    // Send to Firebase (no await — fire and forget for speed)
    dbPush(`clubs/${clubKey}/messages/${activeChat}`, obj);
  }
}

// ═══════════════════════════════════════════════════
// SETTINGS & THEME
// ═══════════════════════════════════════════════════
function setTheme(t) {
  applyTheme(t, true);
  // Update UI selection
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('s'));
  id('thm-' + t)?.classList.add('s');
}
function applyTheme(t, save) {
  document.documentElement.setAttribute('data-theme', t);
  if (save) localStorage.setItem('pf-theme', t);
  // Sync button UI
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('s'));
  id('thm-' + t)?.classList.add('s');
}
function toggleSetting(key) {
  settings[key] = !settings[key];
  localStorage.setItem('pf-settings', JSON.stringify(settings));
  syncToggleUI();
  toast(settings[key] ? 'Notification enabled ✅' : 'Notification disabled');
}
function syncToggleUI() {
  Object.keys(settings).forEach(k => {
    const btn = id('tog-' + k);
    if (btn) btn.className = 'toggle' + (settings[k] ? ' on' : '');
  });
}

// ═══════════════════════════════════════════════════
// STUDENT LISTS
// ═══════════════════════════════════════════════════
function getStu() { return classStudents; }
async function buildStudents() {
  // Load real students from Firebase — accounts in this club + this class
  const all = await dbGet('accounts');
  classStudents = [];
  if (all) {
    Object.values(all).forEach(acc => {
      if (acc.role === 'student' && san(acc.clubName || '') === clubKey && acc.classId === cu.classId) {
        classStudents.push(acc.name);
      }
    });
  }
  buildAssDDs();
}
// Attendance button colors
const ATT_COLORS = {
  p: { bg: '#059669', color: '#fff', border: '#059669', label: 'Present' },
  l: { bg: '#d97706', color: '#fff', border: '#d97706', label: 'Late' },
  ab2: { bg: '#dc2626', color: '#fff', border: '#dc2626', label: 'Absent' },
};
const ATT_DEFAULT = {
  p: { bg: 'transparent', color: '#059669', border: '#059669' },
  l: { bg: 'transparent', color: '#d97706', border: '#d97706' },
  ab2: { bg: 'transparent', color: '#dc2626', border: '#dc2626' },
};

function applyBtnStyle(el, c) {
  if (!el) return;
  el.style.background = c.bg;
  el.style.color = c.color;
  el.style.borderColor = c.border;
}

// Global state for instructor attendance management
let attSelectedStudent = null;
let attClassRecords = {};


async function loadStudentAttendance(stuIdx) {
  if (stuIdx === "" || stuIdx === "all") {
    id('att-marking-card').style.display = 'none';
    attSelectedStudent = null;
    return;
  }
  
  const studentName = classStudents[parseInt(stuIdx)];
  if (!studentName) return;
  
  attSelectedStudent = studentName;
  id('att-marking-card').style.display = 'block';
  id('att-history-list').innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Loading history...</div>';
  
  // Set default date to today if not set
  if (!id('att-date-input').value) {
    id('att-date-input').value = today();
  }

  // Fetch ALL attendance for this class
  attClassRecords = await dbGet(`clubs/${clubKey}/attendance/${cu.classId}`) || {};
  
  renderStudentHistory();
  syncAttStatus();
}

function renderStudentHistory() {
  const historyList = id('att-history-list');
  const statsSummary = id('att-stats-summary');
  if (!historyList || !statsSummary || !attSelectedStudent) return;

  const records = [];
  let p = 0, l = 0, a = 0;
  attLocked = true; // Reset lock state when rendering history


  // Iterate through dates and extract this student's records
  Object.entries(attClassRecords).sort((a, b) => b[0].localeCompare(a[0])).forEach(([date, dayData]) => {
    const entry = dayData[san(attSelectedStudent)];
    if (entry && entry.status) {
      records.push({ date, status: entry.status });
      if (entry.status === 'p') p++;
      else if (entry.status === 'l') l++;
      else if (entry.status === 'ab2') a++;
    }
  });

  if (records.length === 0) {
    historyList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut);font-size:12px">No attendance records found for this student.</div>';
  } else {
    historyList.innerHTML = records.map(r => {
      const config = ATT_COLORS[r.status] || {label: 'Unknown', bg: 'var(--mut)'};
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--bg3)">
          <div style="font-size:13px; font-weight:700">${new Date(r.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</div>
          <div style="background:${config.bg}; color:#fff; font-size:10px; padding:2px 8px; border-radius:10px; font-weight:800">${config.label.toUpperCase()}</div>
        </div>
      `;
    }).join('');
  }

  statsSummary.innerHTML = `
    <div style="text-align:center"><div style="font-size:18px; font-weight:800; color:var(--a2)">${p}</div><div style="font-size:10px; color:var(--mut)">Present</div></div>
    <div style="text-align:center"><div style="font-size:18px; font-weight:800; color:var(--amb)">${l}</div><div style="font-size:10px; color:var(--mut)">Late</div></div>
    <div style="text-align:center"><div style="font-size:18px; font-weight:800; color:var(--red)">${a}</div><div style="font-size:10px; color:var(--mut)">Absent</div></div>
  `;
}

function syncAttStatus() {
  const date = id('att-date-input').value;
  if (!date || !attSelectedStudent) return;

  const dayData = attClassRecords[date] || {};
  const entry = dayData[san(attSelectedStudent)];
  const status = entry ? entry.status : null;

  // Determine if we should be locked (if a record exists and we haven't clicked update)
  const recordExists = !!entry;
  const isLocked = recordExists && attLocked;

  // Show/Hide Lock UI
  if (id('att-update-btn')) id('att-update-btn').style.display = isLocked ? 'block' : 'none';
  if (id('att-saved-banner')) id('att-saved-banner').style.display = isLocked ? 'block' : 'none';

  ['p', 'l', 'ab2'].forEach(s => {
    const btn = id('btn-att-' + s);
    if (!btn) return;
    
    // Styling
    if (status === s) {
      btn.style.opacity = '1';
      btn.style.border = '2px solid #fff';
      btn.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    } else {
      btn.style.opacity = isLocked ? '0.2' : '0.5';
      btn.style.border = 'none';
      btn.style.boxShadow = 'none';
    }
    
    // Interactivity
    btn.style.pointerEvents = isLocked ? 'none' : 'auto';
  });
}

function unlockAtt() {
  attLocked = false;
  syncAttStatus();
  toast('🔓 Attendance unlocked for editing');
}

async function markIndivAtt(status) {
  const date = id('att-date-input').value;
  if (!date) { toast('⚠️ Please select a date first'); return; }
  if (!attSelectedStudent) { toast('⚠️ Please select a student first'); return; }
  if (attLocked && attClassRecords[date] && attClassRecords[date][san(attSelectedStudent)]) return;

  toast('Saving...');
  const entry = {
    name: attSelectedStudent,
    status: status,
    ts: Date.now()
  };

  // Optimistic UI update
  if (!attClassRecords[date]) attClassRecords[date] = {};
  attClassRecords[date][san(attSelectedStudent)] = entry;
  
  const ok = await dbSet(`clubs/${clubKey}/attendance/${cu.classId}`, { [date]: attClassRecords[date] });
  if (ok) {
    toast('✅ Attendance saved');
    attLocked = true; // Re-lock after saving
    renderStudentHistory();
    syncAttStatus();
    buildStuView(); // Sync student dashboard if they are logged in
  } else {
    toast('❌ Failed to save');
  }
}

async function saveSc() {
  const i = id('sc-sel').value;
  if (i === 'all') {
    toast('⚠️ Please select a specific student first!');
    return;
  }
  const name = classStudents[i];
  if (!name) return;
  toast('Saving scores...');
  // Map short keys (p, n, c) back to full keys for Firestore consistency
  const fullData = {
    punctuality: sc.p || 0,
    neatness: sc.n || 0,
    clarity: sc.c || 0,
    ts: Date.now(),
    name: name
  };
  await dbSet(`clubs/${clubKey}/scores/${cu.classId}`, { [san(name)]: fullData });
  toast('✅ Scores updated!');
  scLocked = true;
  syncScoreUI();
  buildStuView(); // Live sync for student dashboard
}


function unlockSc() {
  const i = id('sc-sel').value;
  if (i === 'all') {
    toast('⚠️ Please select a specific student first!');
    return;
  }
  scLocked = false;
  syncScoreUI();
  toast('🔓 Scores unlocked for editing');
}

function syncScoreUI() {
  const isLocked = scLocked;
  if (id('sc-save-btn')) id('sc-save-btn').style.display = isLocked ? 'none' : 'block';
  if (id('sc-update-btn')) id('sc-update-btn').style.display = isLocked ? 'block' : 'none';
  if (id('sc-saved-banner')) id('sc-saved-banner').style.display = isLocked ? 'block' : 'none';

  // Update star interactivity
  document.querySelectorAll('.starr .st').forEach(s => {
    s.style.pointerEvents = isLocked ? 'none' : 'auto';
    s.style.opacity = isLocked ? '0.7' : '1';
  });
}

// ═══════════════════════════════════════════════════
// ASSESSMENT & SCORING
// ═══════════════════════════════════════════════════
function buildAssDDs() {
  const stu = getStu();
  const ids = ['sc-sel', 'req-stu-sel', 'uploads-stu-sel', 'att-stu-sel'];
  if (stu.length === 0) {
    const empty = '<option value="all">No students yet</option>';
    ids.forEach(x => { const el = id(x); if (el) el.innerHTML = empty; });
    return;
  }
  const opts = `<option value="all">All Students</option>` + stu.map((s, i) => `<option value="${i}">${s}</option>`).join('');
  ids.forEach(x => {
    const el = id(x);
    if (el) {
      if (x === 'att-stu-sel' || x === 'sc-sel') {
        el.innerHTML = `<option value="">Choose a student...</option>` + stu.map((s, i) => `<option value="${i}">${s}</option>`).join('');
      } else {
        el.innerHTML = opts;
      }
    }
  });
  scLocked = true;
  syncScoreUI();
}
function buildStars() {
  ['p', 'n', 'c'].forEach(k => {
    const el = id('st-' + k); if (!el) return;
    el.innerHTML = [1, 2, 3, 4, 5].map(n => `<div class="st" id="star-${k}-${n}" onclick="setStar('${k}',${n})">⭐</div>`).join('');
  });
}
function setStar(k, v) {
  if (scLocked) return;
  sc[k] = v;[1, 2, 3, 4, 5].forEach(n => id('star-' + k + '-' + n)?.classList.toggle('on', n <= v)); id('sv-' + k).textContent = v + '/5';
}


// ═══════════════════════════════════════════════════
// STUDENT SCORE VIEW
// ═══════════════════════════════════════════════════
async function buildStuView() {
  const noScore = `<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No scores yet. Your instructor hasn't scored you yet.</div>`;
  const noAtt = `<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No attendance records yet.</div>`;
  const sl = { punctuality: 'Punctuality', neatness: 'Neatness / Presentation', clarity: 'Subject Clarity' };

  // Load scores from Firebase (LIVE)
  if (window.unsubStuScore) { window.unsubStuScore(); window.unsubStuScore = null; }
  const scorePath = `clubs/${clubKey}/scores/${cu.classId}`;
  window.unsubStuScore = await dbListen(scorePath, (classScores) => {
    const scoreData = classScores ? classScores[san(cu.name)] : null;
    const d = id('stu-scores');
    if (d) {
      if (scoreData && (scoreData.punctuality || scoreData.neatness || scoreData.clarity)) {
        d.innerHTML = Object.entries(sl).map(([k, label]) => {
          const v = scoreData[k] || 0;
          return `<div style="margin-bottom:12px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px"><span style="font-size:13px;color:var(--mut)">${label}</span><span style="font-size:14px;font-weight:800;color:var(--amb)">${v}/5</span></div><div class="sbw"><div class="sbar" style="width:${v * 20}%"></div></div></div>`;
        }).join('');
      } else { d.innerHTML = noScore; }
    }
  });

  // Load attendance from Firebase (LIVE)
  if (window.unsubStuAtt) { window.unsubStuAtt(); window.unsubStuAtt = null; }
  const attPath = `clubs/${clubKey}/attendance/${cu.classId}`;
  window.unsubStuAtt = await dbListen(attPath, (attData) => {
    const a = id('stu-att');
    if (a) {
      if (attData && Object.keys(attData).length > 0) {
        let present = 0, late = 0, absent = 0;
        Object.values(attData).forEach(day => {
          Object.values(day).forEach(entry => {
            if (typeof entry === 'object' && entry.name === cu.name) {
              if (entry.status === 'p') present++;
              else if (entry.status === 'l') late++;
              else if (entry.status === 'ab2') absent++;
            }
          });
        });
        a.innerHTML = `<div style="display:flex;gap:20px"><div style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--a2)">${present}</div><div style="font-size:11px;color:var(--mut)">Present</div></div><div style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--amb)">${late}</div><div style="font-size:11px;color:var(--mut)">Late</div></div><div style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--red)">${absent}</div><div style="font-size:11px;color:var(--mut)">Absent</div></div></div>`;
      } else { a.innerHTML = noAtt; }
    }
  });
}

// ═══════════════════════════════════════════════════
// MASTER GUIDE
// ═══════════════════════════════════════════════════
function buildMGUI() {
  id('mg-reqs').innerHTML = MG.map(area => `<div class="mgsec"><div class="mghdr">${area.e} ${area.a}</div>${area.items.map(item => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px"><input type="checkbox" style="width:16px;height:16px;accent-color:var(--pur);flex-shrink:0"><span style="font-size:13px;color:var(--mut)">${item}</span></div>`).join('')}</div>`).join('');
}
async function buildMGCands() {
  const c = id('mg-cands'); if (!c) return;
  const all = await dbGet('accounts');
  if (!all) { c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No candidates yet.</div>'; return; }
  const cands = Object.values(all).filter(a => a.classId === 'masterguide' && san(a.clubName || '') === clubKey);
  if (cands.length === 0) { c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut);font-size:13px">No Master Guide candidates in your club yet.</div>'; return; }
  c.innerHTML = cands.map(a => `<div class="srow"><div class="av" style="background:var(--pur)">${ini(a.name)}</div><div class="si"><div class="sn">${a.name}</div><div class="sm2">Master Guide Candidate</div></div><span class="badge bp">In Progress</span></div>`).join('');
}
function mgTab(tab) {
  ['curriculum', 'candidates', 'portfolio'].forEach(t => id('mg-' + t).style.display = t === tab ? 'block' : 'none');
  document.querySelectorAll('#tab-masterguide > .tabs .tab').forEach((t, i) => t.classList.toggle('a', ['curriculum', 'candidates', 'portfolio'][i] === tab));
  if (tab === 'portfolio') loadStudentHistory('mgport', 'mgp-files');
}

// ═══════════════════════════════════════════════════
// DEVOTION POSTING
// ═══════════════════════════════════════════════════
async function postDevotion() {
  const txt = id('dev-post-ta').value.trim();
  const date = id('dev-post-date').value;
  if (!txt) { toast('⚠️ Please type a devotion message'); return; }
  if (!date) { toast('⚠️ Please select a date'); return; }

  toast('Posting devotion...');
  const obj = { s: cu.name, t: txt, ts: Date.now(), tm: date };
  await dbPush(`clubs/${clubKey}/devotionPosts/${cu.classId}`, obj);
  id('dev-post-ta').value = '';
  toast('✅ Devotion posted to class!');
  loadDevotionHistory();
}

// ═══════════════════════════════════════════════════
// INSTRUCTOR UPLOADS & VIEWED TRACKING
// ═══════════════════════════════════════════════════
let instCurrentUploadTab = 'all';
function instUploadTab(tab) {
  instCurrentUploadTab = tab;
  document.querySelectorAll('#sub-instructors-stuuploads .tab').forEach((t, i) => {
    t.classList.toggle('a', ['requirements', 'honors', 'all'][i] === tab);
  });
  loadInstUploads(tab, id('uploads-stu-sel').value);
}

async function loadInstUploads(type, stuIdx) {
  const list = id('inst-uploads-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Scanning records...</div>';

  let html = '';
  // Get the students to check
  const targetStudents = (stuIdx === 'all')
    ? classStudents.map(name => ({ name, sanName: san(name) }))
    : (classStudents[parseInt(stuIdx)] ? [{ name: classStudents[parseInt(stuIdx)], sanName: san(classStudents[parseInt(stuIdx)]) }] : []);

  if (targetStudents.length === 0 && stuIdx !== 'all') {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--mut)">Student not found.</div>';
    return;
  }

  const catsToCheck = type === 'all' ? ['requirements', 'honors', 'mgport', 'journals'] : [type];
  const cls = cu.classId;

  for (const student of targetStudents) {
    for (let baseCat of catsToCheck) {
      // Normalize category name (ensure plural for the path)
      const cat = baseCat.endsWith('s') ? baseCat : baseCat + 's';

      const hPath = `clubs/${clubKey}/uploads/${cat}/${cls}/${student.sanName}/history`;
      const hData = await dbGet(hPath);

      if (!hData) continue;

      // Handle if hData is a single object (unlikely with history but possible if structure changed)
      const items = (hData.url) ? { [student.sanName]: hData } : hData;

      Object.entries(items).forEach(([fid, f]) => {
        if (!f || typeof f !== 'object' || !f.url) return;
        const dateStr = f.ts ? new Date(f.ts).toLocaleDateString() : (f.date || '');
        const viewed = f.viewedByInstructor ? '<span style="color:var(--a2);font-weight:700">● Viewed</span>' : '<span style="color:var(--amb);font-weight:700">● New</span>';

        html += `
              <div class="card" style="margin-bottom:10px;padding:12px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                  <div>
                    <div style="font-size:14px;font-weight:700;color:var(--txt)">${student.name}</div>
                    <div style="font-size:11px;color:var(--mut)">${cat.toUpperCase()} — ${dateStr}</div>
                  </div>
                  <div style="font-size:11px" onclick="markViewed('${cat}','${cls}','${student.sanName}','${fid}')">${viewed}</div>
                </div>
                <img src="${f.url}" style="width:100%;height:140px;object-fit:cover;border-radius:8px;background:#f0f0f0;cursor:pointer" onclick="markViewed('${cat}','${cls}','${student.sanName}','${fid}');window.open('${f.url}','_blank')">
                ${f.name ? `<div style="font-size:12px;font-weight:700;margin-top:8px">${f.name}</div>` : ''}
                ${f.note ? `<div style="font-size:11px;color:var(--mut);margin-top:4px;font-style:italic">Note: ${f.note}</div>` : ''}
                
                <div style="display:flex;gap:8px;margin-top:12px">
                  <button class="sbtn" style="padding:6px;font-size:11px;background:var(--accent);flex:1" onclick="markViewed('${cat}','${cls}','${student.sanName}','${fid}');window.open('${f.url}','_blank')">👁️ View Full Image</button>
                </div>
              </div>
            `;
      });
    }
  }

  list.innerHTML = html || '<div style="text-align:center;padding:20px;color:var(--mut)">No matching uploads found.</div>';
}

async function instDeleteUpload(cat, clsId, stuName, fid) {
  if (!confirm('Are you sure you want to delete this submission?')) return;
  const path = `clubs/${clubKey}/uploads/${cat}/${clsId}/${stuName}/history/${fid}`;
  const ok = await dbDelete(path);
  if (ok) {
    toast('✅ Submission deleted');
    loadInstUploads(instCurrentUploadTab, id('uploads-stu-sel').value);
  } else {
    toast('❌ Delete failed');
  }
}
window.instDeleteUpload = instDeleteUpload;

async function markViewed(cat, clsId, stuName, fid) {
  const path = `clubs/${clubKey}/uploads/${cat}/${clsId}/${stuName}/history/${fid}`;
  await dbSet(path, { viewedByInstructor: true, viewedAt: Date.now() });
  loadInstUploads(instCurrentUploadTab, id('uploads-stu-sel').value);
}


async function loadStudentReqs(i) {
  const name = classStudents[i];
  if (!name) return;
  const data = await dbGet(`clubs/${clubKey}/requirements/${cu.classId}/${san(name)}`);
  id('inst-req-preview').style.display = 'block';
  id('inst-req-content').innerHTML = data ? `<div style="font-size:13px;color:var(--mut)">Completed: ${Object.keys(data).length} requirements</div>` : 'No progress yet.';
}

async function loadExistingScores(i) {
  if (i === 'all') {
    sc = { p: 0, n: 0, c: 0 };
    ['p', 'n', 'c'].forEach(k => {
      [1, 2, 3, 4, 5].forEach(n => id('star-' + k + '-' + n)?.classList.remove('on'));
      id('sv-' + k).textContent = '0/5';
    });
    scLocked = true;
    syncScoreUI();
    return;
  }
  const name = classStudents[i];
  if (!name) return;
  const classScores = await dbGet(`clubs/${clubKey}/scores/${cu.classId}`);
  const data = classScores ? classScores[san(name)] : null;
  if (data) {
    sc = { p: data.punctuality || 0, n: data.neatness || 0, c: data.clarity || 0 };
  } else {
    sc = { p: 0, n: 0, c: 0 };
  }
  ['p', 'n', 'c'].forEach(k => {
    const val = sc[k];
    [1, 2, 3, 4, 5].forEach(n => id('star-' + k + '-' + n)?.classList.toggle('on', n <= val));
    id('sv-' + k).textContent = val + '/5';
  });
  scLocked = true;
  syncScoreUI();
}

