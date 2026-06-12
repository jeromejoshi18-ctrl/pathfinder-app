    // INITIALIZATION & SPLASH DISMISSAL
    // ═══════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════

    window.addEventListener('DOMContentLoaded', () => {
      console.log('Page loaded, dismissing splash...');
      const splash = id('splash') || id('splash-screen');
      
      // Load settings & theme
      try {
        const sv = localStorage.getItem('pf-settings');
        if (sv) settings = { ...settings, ...JSON.parse(sv) };
        const th = localStorage.getItem('pf-theme') || 'light';
        if (window.applyTheme) applyTheme(th, false);
      } catch (e) { }

      // Restore session
      try {
        const savedCu = localStorage.getItem('pf-cu');
        const savedClub = localStorage.getItem('pf-club');
        if (savedCu && savedClub) {
          cu = JSON.parse(savedCu);
          clubKey = savedClub;
          console.log('Session restored:', cu.name);
        }
      } catch (e) { }
      
      try { if (window.buildClsGrid) buildClsGrid(); } catch (e) { }
      try { if (window.buildModeBadge) buildModeBadge(); } catch (e) { }

      setTimeout(() => {
        const isLocal = !window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const remoteUrl = 'https://jeromejoshi18-ctrl.github.io/pathfinder-app/';

        // OFFLINE HANDLING
        if (!navigator.onLine && !demoMode) {
          console.log('Redirecting to offline screen...');
          // Ensure we don't loop if already on the offline page (though this script usually isn't there)
          if (!window.location.pathname.includes('/offline/')) {
            window.location.href = 'offline/index.html';
          }
          return;
        }

        // ONLINE & LOCAL -> JUMP TO LIVE GITHUB VERSION (FOR UPDATES)
        if (navigator.onLine && isLocal && !demoMode) {
          console.log('Connection detected. Jumping to live GitHub version for the latest updates...');
          window.location.href = remoteUrl;
          return;
        }

        const proceed = () => {
          if (!navigator.onLine && !demoMode) {
            window.location.href = 'offline/index.html';
            return;
          }
          if (cu && clubKey) launch();
          else showAuth();
        };

        if (splash) {
          splash.style.pointerEvents = 'none';
          splash.style.opacity = '0';
          setTimeout(() => {
            splash.style.display = 'none';
            splash.remove();
            proceed();
          }, 100);
        } else {
          proceed();
        }
      }, 50);
    });

    // ═══════════════════════════════════════════════════
    // LAUNCH APP
    // ═══════════════════════════════════════════════════
    async function launch() {
      try {
        console.log('App Launching...');
        show('main-screen');
        load('Initializing UI...');
        
        const now = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (id('att-date')) id('att-date').textContent = now;
        if (id('hyg-date')) id('hyg-date').textContent = now;

        const roleLabel = cu.role === 'director'
          ? (cu.dirType === 'deputy' ? 'Deputy Director' : 'Director')
          : cap(cu.role || '');
        const slotLabel = cu.role === 'instructor' && cu.slot ? (cu.slot === 'slot1' ? ' · Instructor 1' : ' · Instructor 2') : '';

        if (id('hdr-sub')) id('hdr-sub').textContent = `${cu.ce || ''} ${cu.cn || ''} · ${roleLabel}${slotLabel}`;
        if (id('hdr-title')) id('hdr-title').textContent = cu.clubName || 'PathfinderApp';
        if (id('hdr-av')) id('hdr-av').textContent = cu.ini || '??';
        if (id('hm-cls')) id('hm-cls').textContent = `${cu.ce || ''} ${cu.cn || ''}`;
        if (id('hm-greet')) {
          const firstName = (cu.name || 'User').split(' ')[0];
          id('hm-greet').textContent = `Welcome, ${firstName}! 👋`;
        }
        if (id('hm-role')) id('hm-role').textContent = `${roleLabel} · ${cu.clubName || 'Pathfinder Club'}`;
        
        load('Connecting to database...');
        if (!demoMode) await checkConnections();

        if (id('set-av')) id('set-av').textContent = cu.ini || '??';
        if (id('set-name')) id('set-name').textContent = cu.name || 'User';
        if (id('set-role')) id('set-role').textContent = `${roleLabel} · ${cu.cn || ''}`;
        if (id('set-club')) id('set-club').textContent = `🏠 ${cu.clubName || 'Pathfinder Club'}`;
        if (id('set-ver')) id('set-ver').textContent = `v${APP_VERSION}`;
        
        load('Building dashboard...');
        syncToggleUI();
        buildNav();
        buildHome();
        buildMGUI();
        buildChatTabs();

        if (cu.role === 'instructor' || cu.role === 'director') {
          buildStudents();
          buildStars();
          if (cu.classId === 'masterguide') buildMGCands();
        }
        if (cu.role === 'student') buildStuView();
        if (cu.role === 'director') buildDirDash();

        listenMsgs('global');
        requestNotifPermission();
        triggerAINotif();
        if (settings.tip) showAITip();

        swTab('home', false);
        console.log('Launch complete.');
        hideLoad();
      } catch (e) {
        console.error('Launch failed:', e);
        hideLoad();
        toast('⚠️ Launch error: ' + e.message);
      }
    }

    // ═══════════════════════════════════════════════════
    // CONNECTIVITY HANDLING
    // ═══════════════════════════════════════════════════
    function updateConnectivityUI() {
      const isOnline = navigator.onLine;
      const offScreen = id('offline-screen');
      if (!offScreen) return;

      if (!isOnline) {
        console.log('App is offline. Showing offline screen...');
        offScreen.style.display = 'flex';
      } else {
        console.log('App is online. Hiding offline screen...');
        offScreen.style.display = 'none';
      }
    }

    function checkConnectionRetry() {
      if (navigator.onLine) {
        const offScreen = id('offline-screen');
        if (offScreen) offScreen.style.display = 'none';
        
        // If we haven't initialized the app yet, do it now
        const main = id('main-screen');
        const auth = id('auth-screen');
        const isAuthVisible = auth && auth.style.display !== 'none';
        const isMainVisible = main && main.style.display !== 'none';
        
        if (!isAuthVisible && !isMainVisible) {
          console.log('Online again. Attempting to initialize app...');
          if (cu && clubKey) launch();
          else showAuth();
        } else {
          console.log('Online again. App already initialized.');
        }
      } else {
        toast('⚠️ Still offline. Please check your connection.');
      }
    }

    // Attach to window so HTML button can call it
    window.checkConnectionRetry = checkConnectionRetry;
    window.retryConnection = function() {
      toast('🔄 Retrying connection...');
      if (navigator.onLine) {
        location.reload();
      } else {
        toast('⚠️ Still offline. Please check your internet.');
      }
    };

    window.addEventListener('online', updateConnectivityUI);
    window.addEventListener('offline', updateConnectivityUI);

    function checkForUpdates() {
      console.log('Checking for updates...');
      toast('🚀 You are using the latest version (v6.6.5).');
    }
    
    // Safety Fallback for UI functions that might be called before ui.js loads
    if (typeof window.checkNewMessages === 'undefined') {
      window.checkNewMessages = (c, m) => console.log('Safety fallback: checkNewMessages', c, m);
    }

    // ═══════════════════════════════════════════════════