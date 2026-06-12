// Global Error Handler for debugging
window.onerror = function(msg, url, line, col, err) {
  console.error('Global Error:', msg, 'at', url, ':', line, 'col:', col, 'error:', err);
  
  // Suppress generic "Script error." alerts on line 0 (usually cross-origin script load failures/network drops)
  if (msg && (msg.toLowerCase().indexOf('script error') > -1) && (line === 0 || !line)) {
    return true; // prevent default browser handling and do not alert
  }
  
  let errMsg = 'App Error: ' + msg + '\nLine: ' + line + '\nCol: ' + col + '\nURL: ' + (url || 'unknown');
  if (err && err.stack) {
    errMsg += '\nStack: ' + err.stack.substring(0, 150) + '...';
  }
  alert(errMsg);
  return false;
};

// Handle unhandled promise rejections (useful for async/Firebase errors)
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Promise Rejection:', event.reason);
  let reasonMsg = event.reason ? (event.reason.message || event.reason) : 'Unknown reason';
  let stackMsg = (event.reason && event.reason.stack) ? '\nStack: ' + event.reason.stack.substring(0, 150) + '...' : '';
  alert('Unhandled Rejection: ' + reasonMsg + stackMsg);
});

// Dummy fallback for older cached ui-v2.js files calling syncScoreUI
window.syncScoreUI = window.syncScoreUI || function() { console.log('Dummy syncScoreUI called'); };

// ═══════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════
function id(x) { return document.getElementById(x); }

function load(msg) { 
  const el = id('load-txt');
  if (el) el.textContent = msg || 'Loading...'; 
  const screen = id('loading-screen');
  if (screen) screen.style.display = 'flex'; 
}

function hideLoad() { 
  const screen = id('loading-screen');
  if (screen) screen.style.display = 'none'; 
}

function toast(msg) { 
  const t = id('toast'); 
  if (t) {
    t.textContent = msg; 
    t.classList.add('show'); 
    setTimeout(() => t.classList.remove('show'), 2600); 
  }
}

function show(x) { 
  const e = id(x);
  if (!e) {
    console.error('show: Element with id "' + x + '" not found.');
    return;
  }
  document.querySelectorAll('.screen').forEach(s => { 
    s.classList.remove('active'); 
    s.style.display = 'none'; 
  }); 
  e.classList.add('active'); 
  e.style.display = 'flex'; 
}

function setErr(eid, msg) { const e = id(eid); if (e) { e.textContent = msg; e.style.display = msg ? 'block' : 'none'; } }
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement === id('minp')) {
    if (e.shiftKey) return; 
    e.preventDefault();
    if (window.sendMsg) window.sendMsg();
  }
});

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function ini(n) { return (n || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); }
function today() { return new Date().toISOString().split('T')[0]; }
function san(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''); }

// ═══════════════════════════════════════════════════
// SAFETY FALLBACKS
// ═══════════════════════════════════════════════════
window.checkNewMessages = window.checkNewMessages || ((c, m) => console.log('Safety fallback: checkNewMessages', c, m));
window.checkConnections = window.checkConnections || (() => Promise.resolve({ fbOk: false, cldOk: false }));
window.checkForUpdates = window.checkForUpdates || (() => console.log('Safety fallback: checkForUpdates'));

// ═══════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════
const APP_VERSION = '6.6.5';
const CLOUDINARY_CLOUD_NAME = 'dq1kk9tkd';
const CLOUDINARY_UPLOAD_PRESET = 'tyxio0qs';

let cu = null, clubKey = 'default', curTab = 'home', currentTab = 'home', selRole = null, selClass = null, selDirType = null, selSlot = null;
currentAttendance = {}, currentHygiene = {}, currentScores = {}, currentNotes = {};

const urlParams = new URLSearchParams(window.location.search);
let demoMode = false; // demo mode disabled

let settings = { devot: true, att: true, scores: true, tip: true };
let navHistory = [];
let db = null; 
let rtdb = null; 
let sc = { p: 0, n: 0, c: 0 };
let upCtrs = {};
let msgOff = null;
let activeChat = 'global'; 
let stuFromClass = false;
let renderedMsgKeys = new Set();
let lastMsgCount = 0;
let lastMsgTimestamps = {}; 
let notifPermission = false;
const upMap = { mgport: 'mgp-files' };
const upIco = { mgport: '📁' };
let demoMsgs = {
  global: [],
  devotion: [],
  ranger: [],
};

const CLASSES = [
  { id: 'friend', n: 'Friend', e: '🌱' },
  { id: 'companion', n: 'Companion', e: '🤝' },
  { id: 'explorer', n: 'Explorer', e: '🌿' },
  { id: 'ranger', n: 'Ranger', e: '⛺' },
  { id: 'voyager', n: 'Voyager', e: '⛵' },
  { id: 'guide', n: 'Guide', e: '🧗' },
  { id: 'masterguide', n: 'Master Guide', e: '🏅' }
];

const HONORS = [
  { name: 'Camping Skills I', category: 'Outdoor', patch: 'https://www.pathfindersonline.org/images/honors/outdoor/camping_skills_1.png' },
  { name: 'First Aid', category: 'Health', patch: 'https://www.pathfindersonline.org/images/honors/health/first_aid.png' },
  { name: 'Computer I', category: 'Vocational', patch: 'https://www.pathfindersonline.org/images/honors/vocational/computer_1.png' }
];

let classStudents = []; 
let attLocked = true;
let scLocked = true;
let honorPhotoData = null; 
let pendingUploadType = null;
