
    // ═══════════════════════════════════════════════════
    // AUTH SYSTEM
    // ═══════════════════════════════════════════════════
    function showAuth() { show('auth-screen'); buildModeBadge(); }
    function buildModeBadge() {
      const b = id('si-mode-bar'); if (!b) return;
      if (demoMode) {
        b.innerHTML = `<div class="mode-bar demo"><span class="dot" style="background:#f59e0b"></span>Running in Demo Mode (Offline)</div>`;
      } else {
        b.innerHTML = `<div class="mode-bar live"><span class="dot"></span>Connected to PathfinderApp database</div>`;
      }
    }

    // ═══════════════════════════════════════════════════
    // AUTH TABS & ROLE SELECTION
    // ═══════════════════════════════════════════════════
    function authTab(t) {
      id('form-si').style.display = t === 'si' ? 'block' : 'none';
      id('form-su').style.display = t === 'su' ? 'block' : 'none';
      id('at-si').className = 'auth-tab' + (t === 'si' ? ' a' : '');
      id('at-su').className = 'auth-tab' + (t === 'su' ? ' a' : '');
    }
    function pickRole(r) {
      if (r === 'instructor' || r === 'director') {
        const code = prompt('Enter authorized code to select this role:');
        if (code !== '3456') {
          alert('Invalid code. You cannot select this role.');
          return;
        }
      }
      selRole = r;
      ['student', 'instructor', 'director'].forEach(x => { const el = id('rb-' + x); if (el) el.classList.remove('s'); });
      const rb = id('rb-' + r); if (rb) rb.classList.add('s');
      const dirSub = id('dir-subrole'); if (dirSub) dirSub.style.display = r === 'director' ? 'block' : 'none';
      const clsPick = id('cls-picker'); if (clsPick) clsPick.style.display = (r === 'student' || r === 'instructor') ? 'block' : 'none';
      const slotPick = id('slot-picker'); if (slotPick) slotPick.style.display = r === 'instructor' ? 'block' : 'none';
      const instrField = id('instructor-name-field'); if (instrField) instrField.style.display = (r === 'instructor') ? 'block' : 'none';
      const userField = id('username-field'); if (userField) userField.style.display = (r === 'instructor') ? 'none' : 'block';
      const emailField = id('email-field'); if (emailField) emailField.style.display = (r === 'instructor') ? 'none' : 'block';
    }
    function pickDirType(t) {
      selDirType = t;
      ['director-main', 'deputy'].forEach(x => id('rb-' + x)?.classList.remove('s'));
      id('rb-' + t)?.classList.add('s');
    }
    function pickSlot(s) {
      selSlot = s;
      ['slot1', 'slot2'].forEach(x => id('rb-' + x)?.classList.remove('s'));
      id('rb-' + s)?.classList.add('s');
    }
    function buildClsGrid() {
      const g = id('cls-grid'); if (!g) return;
      g.innerHTML = CLASSES.map(c => `<div class="c-btn" id="cb-${c.id}" onclick="pickCls('${c.id}')"><span style="font-size:18px;display:block;margin-bottom:3px">${c.e}</span><strong>${c.n}</strong></div>`).join('');
    }
    function pickCls(cid) {
      selClass = cid;
      document.querySelectorAll('.c-btn').forEach(b => b.classList.remove('s'));
      id('cb-' + cid)?.classList.add('s');
      id('mg-note').style.display = cid === 'masterguide' ? 'flex' : 'none';
    }

    // ═══════════════════════════════════════════════════
    // SIGN IN / SIGN UP
    // ═══════════════════════════════════════════════════
    async function doSignIn() {
      let username = id('si-username').value.trim();
      setErr('si-err', '');
      
      if (!selRole) { setErr('si-err', 'Please select your role.'); return; }
      
      if (selRole === 'instructor') {
        const instr = id('si-instructor').value;
        if (!instr) { setErr('si-err', 'Please select your name.'); return; }
        username = instr;
      }
      
      if (!username) { setErr('si-err', 'Please enter your name or select one from the list.'); return; }
      if (selRole === 'director' && !selDirType) { setErr('si-err', 'Please select Director or Deputy Director.'); return; }
      if ((selRole === 'student' || selRole === 'instructor') && !selClass) { setErr('si-err', 'Please select your class.'); return; }

      load('Signing in...');
      // Look up user by email key in DB
      const usernameKey = san(username);
      let p = await dbGet('accounts/' + usernameKey);
      
      if (!p) {
        // Auto-create account if not found
        p = {
          name: username,
          email: username,
          role: selRole,
          dirType: selRole === 'director' ? selDirType : '',
          classId: selClass || 'all',
          slot: selRole === 'instructor' ? selSlot : '',
          clubName: 'Oasis Pathfinder Club',
          createdAt: Date.now()
        };
        await dbSet('accounts/' + usernameKey, p);
      }

      const cls = CLASSES.find(c => c.id === p.classId) || { n: 'All', e: '👔' };
      const name = p.name || 'User';
      cu = { 
        ...p, 
        uid: usernameKey, 
        cn: cls.n, 
        ce: cls.e, 
        ini: name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() 
      };
      clubKey = san(p.clubName || 'default');
      hideLoad(); launch();
    }

    async function doSignUp() {
      const clubName = id('su-club').value.trim();
      const name = id('su-name').value.trim();
      const email = id('su-email').value.trim();
      const pw = id('su-pw').value;
      setErr('su-err', '');
      if (!clubName) { setErr('su-err', 'Please enter your Pathfinder Club name.'); return; }
      if (!name) { setErr('su-err', 'Please enter your name.'); return; }
      if (!email || !pw) { setErr('su-err', 'Please fill email and password.'); return; }
      if (pw.length < 6) { setErr('su-err', 'Password needs at least 6 characters.'); return; }
      if (!selRole) { setErr('su-err', 'Please select your role.'); return; }
      if (selRole === 'director' && !selDirType) { setErr('su-err', 'Please select Director or Deputy Director.'); return; }
      if ((selRole === 'student' || selRole === 'instructor') && !selClass) { setErr('su-err', 'Please select your class.'); return; }

      load('Creating account...');
      const usernameKey = san(username);
      // Check if account already exists
      const existing = await dbGet('accounts/' + usernameKey);
      if (existing) { hideLoad(); setErr('su-err', 'An account with that email already exists. Please sign in.'); return; }
      // Check instructor slot not already taken
      if (selRole === 'instructor') {
        const allAcc = await dbGet('accounts') || {};
        const slotTaken = Object.values(allAcc).some(a =>
          a.role === 'instructor' &&
          san(a.clubName || '') === san(clubName) &&
          a.classId === selClass &&
          a.slot === selSlot
        );
        if (slotTaken) {
          hideLoad();
          const slotName = selSlot === 'slot1' ? 'Instructor 1' : 'Instructor 2';
          setErr('su-err', `${slotName} for this class is already taken. Please choose the other slot or a different class.`);
          return;
        }
      }
      const prof = { 
        name, 
        email, 
        pw: btoa(pw), 
        role: selRole, 
        dirType: selRole === 'director' ? selDirType : '', 
        classId: selClass || 'all', 
        slot: selRole === 'instructor' ? selSlot : '', 
        clubName, 
        createdAt: Date.now() 
      };
      
      const saved = await dbSet('accounts/' + usernameKey, prof);
      if (saved === false) {
        hideLoad();
        setErr('su-err', 'Could not save account. Ensure Cloud Firestore is enabled in your Firebase Console and Rules are set to public for testing.');
        return;
      }
      
      const cls = CLASSES.find(c => c.id === prof.classId) || { n: 'All', e: '🎖' };
      cu = { 
        ...prof, 
        uid: usernameKey, 
        cn: cls.n, 
        ce: cls.e, 
        ini: name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() 
      };
      clubKey = san(clubName);
      hideLoad(); 
      launch();
    }

    function fErr(code) {
      const s = (code || '').toUpperCase();
      if (s.includes('EMAIL_NOT_FOUND') || s.includes('USER_NOT_FOUND')) return 'No account with that email.';
      if (s.includes('INVALID_PASSWORD') || s.includes('WRONG_PASSWORD')) return 'Incorrect password.';
      if (s.includes('EMAIL_EXISTS')) return 'Email already registered — sign in instead.';
      if (s.includes('INVALID_EMAIL')) return 'Invalid email address.';
      if (s.includes('WEAK_PASSWORD')) return 'Password too weak — use at least 6 characters.';
      if (s.includes('NETWORK')) return 'Network error. Check your internet connection.';
      if (s.includes('INVALID_LOGIN_CREDENTIALS') || s.includes('INVALID_CREDENTIAL') || s.includes('INCORRECT')) return 'Email or password is incorrect.';
      return 'Something went wrong. Try again.';
    }

    async function doSignOut() {
      if (confirm('Sign out of PathfinderApp?')) {
        if (msgOff) { clearInterval(msgOff); msgOff = null; }
        cu = null; show('auth-screen'); id('msg-list').innerHTML = ''; toast('Signed out.');
      }
    }
