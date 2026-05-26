
    // ═══════════════════════════════════════════════════
    // CAMERA / FILE UPLOAD SYSTEM
    // ═══════════════════════════════════════════════════
    function closeSheet() { id('image-action-sheet').style.display = 'none'; }

    function handleSheetAction(source) {
      const type = pendingUploadType || 'journal';
      closeSheet();

      window.uploadRequest = type;

      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      if (source === 'camera') {
        inp.setAttribute('capture', 'environment');
      } else {
        inp.multiple = true;
      }
      inp.style.cssText = 'position:fixed;top:-100px;left:-100px;width:1px;height:1px;opacity:0;';
      document.body.appendChild(inp);

      inp.addEventListener('change', function handler(e) {
        inp.removeEventListener('change', handler);
        document.body.removeChild(inp);
        const files = Array.from(e.target.files || []);
        if (files.length === 0) { pendingUploadType = null; return; }
        
        // Reset storage for these types so we don't keep appending from previous sessions
        if (type === 'honor' || type === 'honors') window.honorPhotoData = [];
        if (type === 'requirement' || type === 'requirement') window.requirementPhotoData = [];

        files.forEach(file => {
          if (!file.type.startsWith('image/')) return;
          if (file.size > 10 * 1024 * 1024) { toast('⚠️ One image too large (<10MB).'); return; }

          const reader = new FileReader();
          reader.onload = ev => receiveImageFromApp(ev.target.result, type);
          reader.onerror = () => toast('⚠️ Could not read image.');
          reader.readAsDataURL(file);
        });
      });

      setTimeout(() => inp.click(), 50);
    }

    function requestImageFromApp(type) {
      pendingUploadType = type;
      id('image-action-sheet').style.display = 'flex';
    }

    window.triggerPhoto = (type) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.multiple = true; // Allow multiple even from camera if OS supports it
      input.onchange = (e) => {
        const files = Array.from(e.target.files || []);
        
        // Reset storage
        if (type === 'honors' || type === 'honor') window.honorPhotoData = [];
        if (type === 'requirement' || type === 'requirement') window.requirementPhotoData = [];

        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (re) => {
            if (type === 'honors' || type === 'honor') {
              if (!Array.isArray(window.honorPhotoData)) window.honorPhotoData = [];
              window.honorPhotoData.push(re.target.result);
              const el = id('hon-photo-preview');
              if (el) {
                el.style.display = 'block';
                id('hon-img-prev').src = re.target.result; // Show last one as preview
                id('hon-photo-name').textContent = `📸 ${window.honorPhotoData.length} images selected!`;
              }
            } else if (type === 'requirement') {
              if (!Array.isArray(window.requirementPhotoData)) window.requirementPhotoData = [];
              window.requirementPhotoData.push(re.target.result);
              if (id('req-photo-preview')) {
                id('req-photo-preview').style.display = 'block';
                id('req-img-prev').src = re.target.result; // Show last one as preview
                toast(`📸 ${window.requirementPhotoData.length} images ready!`);
              }
            } else {
              handleFileUploadData(re.target.result, type);
            }
          };
          reader.readAsDataURL(file);
        });
      };
      input.click();
    };

    function receiveImageFromApp(base64Data, uploadType) {
      if (!base64Data) { toast('No image received. Try again.'); return; }
      const data = (typeof base64Data === 'string' && base64Data.startsWith('data:'))
        ? base64Data
        : 'data:image/jpeg;base64,' + base64Data;

      const type = uploadType || pendingUploadType || 'journal';

      if (type === 'devotion') {
        handleDevotionUploadData(data);
      } else if (type === 'honor' || type === 'honors') {
        if (!Array.isArray(window.honorPhotoData)) window.honorPhotoData = [];
        window.honorPhotoData.push(data);
        const el = id('hon-photo-preview');
        if (el) {
          el.style.display = 'block';
          if (id('hon-img-prev')) id('hon-img-prev').src = data;
          id('hon-photo-name').textContent = `📸 ${window.honorPhotoData.length} images ready!`;
        }
        toast('📸 Photo added!');
      } else if (type === 'requirement') {
        if (!Array.isArray(window.requirementPhotoData)) window.requirementPhotoData = [];
        window.requirementPhotoData.push(data);
        const el = id('req-photo-preview');
        if (el) {
          el.style.display = 'block';
          if (id('req-img-prev')) id('req-img-prev').src = data;
        }
        toast('📸 Photo added!');
      } else {
        handleFileUploadData(data, type);
      }
      // Note: We don't null pendingUploadType here because we might be in a loop
    }

    async function uploadToCloudinary(base64Data, filename) {
      try {
        console.log('Starting Cloudinary upload...');
        const formData = new FormData();
        
        // Ensure we handle both prefixed and raw base64
        const hasPrefix = base64Data.indexOf(',') !== -1;
        const mime = hasPrefix ? (base64Data.match(/:(.*?);/) || ['', 'image/jpeg'])[1] : 'image/jpeg';
        const b64Only = hasPrefix ? base64Data.split(',')[1] : base64Data;
        
        const bstr = atob(b64Only);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8arr], { type: mime });
    
        formData.append('file', blob, filename || 'upload.jpg');
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `pathfinderapp/${clubKey || 'default'}`);
    
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
    
        if (!r.ok) {
          const err = await r.json();
          console.error('Cloudinary upload failed:', err);
          alert('Cloudinary Error: ' + (err.error?.message || 'Unknown error'));
          return null;
        }
        const data = await r.json();
        console.log('Upload successful:', data.secure_url);
        return data.secure_url || null;
      } catch (e) { 
        console.error('Cloudinary upload exception:', e); 
        alert('Upload Exception: ' + e.message);
        return null; 
      }
    }

    // ═══════════════════════════════════════════════════
    // FEATURE UPLOAD HANDLERS
    // ═══════════════════════════════════════════════════
    async function handleFileUploadData(data, type) {
      if (!cu) { alert('DEBUG: No user found'); return; }
      
      // Ensure type is always plural for the database path
      const dbType = type.endsWith('s') ? type : type + 's';
      const path = `clubs/${clubKey}/uploads/${dbType}/${cu.classId}/${san(cu.name)}/history`;
      
      toast('Uploading...');
      const url = await uploadToCloudinary(data, `${dbType}_${san(cu.name)}_${Date.now()}`);
      
      if (!url) {
        toast('Upload failed');
        return;
      }
      
      const obj = {
        name: type.toUpperCase(),
        url,
        ts: Date.now(),
        date: today(),
        by: cu.name,
        type: type,
        status: 'pending'
      };

      const res = await dbPush(path, obj);
      
      // Ensure the student document exists so it shows up in collection-wide queries
      const stuPath = `clubs/${clubKey}/uploads/${dbType}/${cu.classId}/${san(cu.name)}`;
      await dbSet(stuPath, { lastUpload: Date.now() });

      toast('✅ File uploaded successfully!');
      
    // Small delay to let Firestore index the new document
    setTimeout(() => {
      if (type === 'requirements' && typeof loadStudentHistory === 'function') {
        loadStudentHistory('requirements', 'req-history-list');
      }
      if (type === 'mgport' && typeof loadStudentHistory === 'function') {
        loadStudentHistory('mgport', 'mgp-files');
      }
      if (window.buildStuView) window.buildStuView();
    }, 1000);
    }

    async function handleDevotionUploadData(base64) {
      if (!base64) return;
      window.currentDevotionPhoto = base64;
      const img = id('dev-preview-img');
      if (img) {
        img.src = base64;
        id('dev-photo-preview').style.display = 'block';
        id('dev-submit-btn').style.display = 'block';
        id('dev-submit-btn').scrollIntoView({ behavior: 'smooth' });
      }
    }

    async function submitDevotionJournal() {
      if (!cu || !window.currentDevotionPhoto) return;
      const pid = window.currentDevotionPostId;
      if (!pid) { toast('⚠️ Please select a post to upload your journal to.'); return; }

      load('Uploading Journal...');
      const url = await uploadToCloudinary(window.currentDevotionPhoto, `devotion_${san(cu.name)}_${Date.now()}`);
      if (!url) { hideLoad(); toast('❌ Upload failed'); return; }

      const obj = { 
        url, 
        ts: Date.now(), 
        name: cu.name, 
        uploaded: true 
      };
      
      const ok = await dbSet(`clubs/${clubKey}/devotionJournals/${cu.classId}/${pid}/${san(cu.name)}`, obj);
      hideLoad();
      
      if (ok) {
        toast('📖 Journal submitted!');
        closeDevotionModal();
        if (window.loadDevotionHistory) window.loadDevotionHistory();
      } else {
        toast('❌ Failed to save to database');
      }
    }

    window.submitDevotionJournal = submitDevotionJournal;

    // ═══════════════════════════════════════════════════
    // BACK BUTTON NAVIGATION
    // ═══════════════════════════════════════════════════
    let _exitToastShown = false;
    function goBack() {
      if (id('student-modal')?.style.display === 'flex') { closeStudentModal(); return; }
      if (id('class-modal')?.style.display === 'flex') { closeClassModal(); return; }

      const authActive = id('auth-screen')?.classList.contains('active');
      const splashVisible = id('splash-screen')?.style.display !== 'none';
      if (authActive || splashVisible || !cu) return;

      if (navHistory.length > 0) {
        const prev = navHistory.pop();
        if (prev.startsWith('sub:')) {
          const parts = prev.split(':');
          if (parts[2]) subTab(parts[1], parts[2], false);
        } else {
          swTab(prev, false);
        }
        return;
      }

      if (currentTab === 'home') {
        if (_exitToastShown) {
          window._shouldExit = true;
          if (typeof Android !== 'undefined' && Android.exitApp) Android.exitApp();
          else if (window.close) window.close();
        } else {
          _exitToastShown = true;
          toast('Press back again to exit');
          setTimeout(() => { _exitToastShown = false; }, 2500);
        }
        return;
      }
      swTab('home', false);
    }
    window.addEventListener('popstate', () => goBack());

    // ═══════════════════════════════════════════════════
    // NOTIFICATIONS
    // ═══════════════════════════════════════════════════
    async function requestNotifPermission() {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') { notifPermission = true; return; }
      if (Notification.permission !== 'denied') {
        const p = await Notification.requestPermission();
        notifPermission = p === 'granted';
      }
    }

    function showNotification(title, body, channel) {
      if (notifPermission && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '', tag: channel, renotify: true });
      } else {
        const banner = document.createElement('div');
        banner.style.cssText = `position:fixed;top:70px;left:12px;right:12px;background:var(--accent);color:#fff;border-radius:12px;padding:12px 14px;font-size:13px;font-weight:600;z-index:9998;box-shadow:0 4px 16px rgba(0,0,0,.3);cursor:pointer;animation:fadeUp .3s ease`;
        banner.innerHTML = `<div style="font-size:11px;opacity:.8;margin-bottom:2px">${title}</div>${body}`;
        banner.onclick = () => { document.body.removeChild(banner); swTab('messages'); };
        document.body.appendChild(banner);
        setTimeout(() => { if (banner.parentNode) document.body.removeChild(banner); }, 5000);
      }
    }
