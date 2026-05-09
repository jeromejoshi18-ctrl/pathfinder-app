    // FIREBASE INITIALIZATION
    // ═══════════════════════════════════════════════════
    function initFirebase() {
      if (typeof firebase === 'undefined' || !firebase.firestore || !firebase.database) {
        console.error('Firebase SDK or modules (Firestore/Database) not found!');
        demoMode = true;
        // Use a toast instead of an alert for a smoother experience
        setTimeout(() => { if (window.toast) toast('⚠️ Running in Offline/Demo Mode (Firebase unreachable)'); }, 1000);
        return;
      }

      const firebaseConfig = {
        apiKey: "AIzaSyA4uF8SNp4D5MSUuHM6CP47cX62s5HNd8M",
        authDomain: "pathfinder-club-app-2b367.firebaseapp.com",
        databaseURL: "https://pathfinder-club-app-2b367-default-rtdb.firebaseio.com",
        projectId: "pathfinder-club-app-2b367",
        storageBucket: "pathfinder-club-app-2b367.firebasestorage.app",
        messagingSenderId: "851740917912",
        appId: "1:851740917912:web:83f05a3d4227ed7a7390ed",
        measurementId: "G-2JPKFDTPR6"
      };

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      rtdb = firebase.database();
      
      // Disable persistence on local file protocol to prevent "Internal Assertion Failed" errors
      if (location.protocol !== 'file:') {
        db.enablePersistence({ synchronizeTabs: true }).catch(e => console.warn('Persistence failed', e));
      } else {
        console.log('Running on local file — Firestore persistence disabled.');
      }
    }

    initFirebase();

    // ═══════════════════════════════════════════════════