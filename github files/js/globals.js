
    // Global Error Handler for debugging
    window.onerror = function(msg, url, line) {
      console.error('Global Error:', msg, 'at', url, ':', line);
      alert('App Error: ' + msg + '\nLine: ' + line);
      return false;
    };

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
        if (e.shiftKey) return; // Shift+Enter = new line
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
    const APP_VERSION = '6.5.1';
    const CLOUDINARY_CLOUD_NAME = 'dq1kk9tkd';
    const CLOUDINARY_UPLOAD_PRESET = 'tyxio0qs';
    
    let cu = null, clubKey = 'default', curTab = 'home', currentTab = 'home', selRole = null, selClass = null, selDirType = null, selSlot = null;
    let currentAttendance = {}, currentHygiene = {}, currentScores = {}, currentNotes = {};
    
    // Support starting in demo mode via URL
    const urlParams = new URLSearchParams(window.location.search);
    let demoMode = urlParams.get('demo') === 'true';
    
    let settings = { devot: true, att: true, scores: true, tip: true };
    let navHistory = [];
    let db = null; // initialized in firebase-init.js
    let rtdb = null; 
    let sc = { p: 0, n: 0, c: 0 };
    let upCtrs = {};
    let msgOff = null;
    let activeChat = 'global'; 
    let stuFromClass = false;
    let renderedMsgKeys = new Set();
    let lastMsgCount = 0;
    let lastMsgTimestamps = {}; // track last seen ts per channel
    let notifPermission = false;
    const upMap = { mgport: 'mgp-files' };
    const upIco = { mgport: '📁' };
    let demoMsgs = {
      global: [
        { s: 'Director Johnson', r: 'director', t: 'Welcome to PathfinderApp! 🎉', tm: '9:00 AM', uid: 'x1', cls: 'all' },
        { s: 'Instructor Maria', r: 'instructor', t: 'Camporee is next Saturday! Get ready!', tm: '10:30 AM', uid: 'x2', cls: 'all' },
      ],
      devotion: [
        { s: 'Instructor Maria', r: 'instructor', t: 'Today\'s devotion theme: Faithfulness. Read Joshua 1:9.', tm: '8:00 AM', uid: 'x3', cls: 'all', type: 'devotion' },
        { s: 'Instructor James', r: 'instructor', t: 'Ranger class devotion at 8:30am. Don\'t be late!', tm: '8:05 AM', uid: 'x4', cls: 'ranger', type: 'devotion' },
      ],
      ranger: [
        { s: 'Instructor Maria', r: 'instructor', t: 'Ranger class — please bring your honor books on Friday.', tm: 'Yesterday', uid: 'x5', cls: 'ranger' },
      ],
    };

    const CLASSES = [
      { id: 'friend', n: 'Friend', e: '🌱', g: 'Grade 5', l: 'Level 1' },
      { id: 'companion', n: 'Companion', e: '🌿', g: 'Grade 6', l: 'Level 2' },
      { id: 'explorer', n: 'Explorer', e: '🧭', g: 'Grade 7', l: 'Level 3' },
      { id: 'ranger', n: 'Ranger', e: '⛺', g: 'Grade 8', l: 'Level 4' },
      { id: 'voyager', n: 'Voyager', e: '⚓', g: 'Grade 9', l: 'Level 5' },
      { id: 'guide', n: 'Guide', e: '🗺', g: 'Grade 10', l: 'Level 6' },
      { id: 'masterguide', n: 'Master Guide', e: '🏅', g: 'Ages 16+', l: 'Leadership' },
    ];

    const HONORS = [
      { name: 'Birds', category: 'Nature', patch: 'https://www.pathfindersonline.org/images/honors/nature/birds.png' },
      { name: 'Camping Skills I', category: 'Recreation', patch: 'https://www.pathfindersonline.org/images/honors/recreation/camping_skills_1.png' },
      { name: 'First Aid - Basic', category: 'Health & Science', patch: 'https://www.pathfindersonline.org/images/honors/health/first_aid_basic.png' },
      { name: 'Knots', category: 'Recreation', patch: 'https://www.pathfindersonline.org/images/honors/recreation/knot_tying.png' },
      { name: 'Bible Marking', category: 'Spiritual', patch: 'https://www.pathfindersonline.org/images/honors/spiritual/bible_marking.png' },
      { name: 'Computer I', category: 'Vocational', patch: 'https://www.pathfindersonline.org/images/honors/vocational/computer_1.png' }
    ];
    
    let classStudents = []; 
    let attLocked = true;
    let scLocked = true;
    let honorPhotoData = null; 
    let pendingUploadType = null;

    // ═══════════════════════════════════════════════════
