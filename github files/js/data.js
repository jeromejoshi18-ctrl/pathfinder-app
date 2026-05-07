
    // ═══════════════════════════════════════════════════
    // DATA CONSTANTS
    // ═══════════════════════════════════════════════════

    const MG = [
      { a: 'I. Spiritual Growth', e: '✝️', items: ['Read Steps to Christ', 'Devotional journal 4 weeks', 'Bible studies on 28 Beliefs', 'Encounter Series I'] },
      { a: 'II. New Skills', e: '🛠', items: ['Camping Skills', 'Christian Storytelling Honor', 'First Aid Certificate', '2 additional AY Honors'] },
      { a: 'III. Leadership Dev.', e: '🎓', items: ['3 creative worships', 'Conference leadership event', 'Teach 3 Adventurer Awards', 'Field trip leadership'] },
      { a: 'IV. Personal Growth', e: '📖', items: ['Read "Education" (E. White)', 'Child development seminar', '2-page temperament paper', '12 leadership seminars'] },
      { a: 'V. Fitness Lifestyle', e: '🏃', items: ['AY Silver or Gold Award', 'Personal fitness plan', 'Physical fitness documentation'] },
      { a: 'VI. Portfolio & Service', e: '📁', items: ['Document all work', '75% staff meeting attendance', 'Supervise Pathfinder class 1 year', 'Exit interview'] },
    ];



    const CLASS_REQUIREMENTS = {
      friend: [
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' }, { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '🌿 Nature Study' }, { cat: '🌿 Nature Study' },
        { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
      ],
      companion: [
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' }, { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '🌿 Nature Study' }, { cat: '🌿 Nature Study' },
        { cat: '⛺ Outdoor Living' }, { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
      ],
      explorer: [
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' }, { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '🌿 Nature Study' }, { cat: '🌿 Nature Study' },
        { cat: '⛺ Outdoor Living' }, { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
      ],
      ranger: [
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' }, { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '🌿 Nature Study' }, { cat: '🌿 Nature Study' },
        { cat: '⛺ Outdoor Living' }, { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
      ],
      voyager: [
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' }, { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '🌿 Nature Study' }, { cat: '🌿 Nature Study' },
        { cat: '⛺ Outdoor Living' }, { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
      ],
      guide: [
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' }, { cat: '✝️ Spiritual Discovery' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' }, { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '🌿 Nature Study' }, { cat: '🌿 Nature Study' },
        { cat: '⛺ Outdoor Living' }, { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
      ],
      masterguide: [
        { cat: '✝️ Spiritual Discovery' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
        { cat: '🤝 Serving Others' }, { cat: '🤝 Serving Others' },
        { cat: '👫 Making Friends' },
        { cat: '💪 Health & Fitness' }, { cat: '💪 Health & Fitness' },
        { cat: '⛺ Outdoor Living' },
        { cat: '🏅 Honor Enrichment' }, { cat: '🏅 Honor Enrichment' },
        { cat: '🌱 Personal Growth' }, { cat: '🌱 Personal Growth' },
      ],
    };



    const DEVOTION_VERSES = [
      { v: '"For God so loved the world that He gave His one and only Son..."', r: 'John 3:16' },
      { v: '"I can do all things through Christ who strengthens me."', r: 'Philippians 4:13' },
      { v: '"Trust in the LORD with all your heart and lean not on your own understanding."', r: 'Proverbs 3:5' },
      { v: '"The love of Christ compels us..."', r: '2 Corinthians 5:14' },
      { v: '"Be strong and courageous. Do not be afraid; do not be discouraged."', r: 'Joshua 1:9' },
      { v: '"Let your light shine before others, that they may see your good deeds."', r: 'Matthew 5:16' },
      { v: '"Train up a child in the way he should go; even when he is old he will not depart from it."', r: 'Proverbs 22:6' },
    ];

    const AI_TIPS = {
      friend: ["Try to finish your Cooking honor early this quarter!", "Memorize the Law while walking to club meetings."],
      companion: ["Knot tying is easier with a piece of practice rope at home.", "Keep your prayer journal updated daily."],
      explorer: ["First Aid skills are useful for life — pay extra attention!", "Hiking is best done with comfortable shoes."],
      ranger: ["Advanced First Aid is a prerequisite for many Master Guide tasks.", "Try leading a worship session to build confidence."],
      voyager: ["Heritage studies help you understand your club's roots.", "Mentoring younger kids is a great way to show leadership."],
      guide: ["Start your portfolio early; don't wait for the last month!", "Teaching a skill is the best way to master it."],
      masterguide: ["A Master Guide is a leader — always lead by example.", "Your portfolio is a reflection of your commitment."],
    };

    // ═══════════════════════════════════════════════════
    // FIREBASE SDK HELPERS
    // ═══════════════════════════════════════════════════

    // --- FIRESTORE HELPERS ---

    function getRef(path) {
      const parts = path.split('/').filter(p => p);
      let ref = db;
      for (let i = 0; i < parts.length; i++) {
        // Automatically alternate: Collection -> Doc -> Collection -> Doc
        ref = (i % 2 === 0) ? ref.collection(parts[i]) : ref.doc(parts[i]);
      }
      return ref;
    }

    function withTimeout(promise, ms = 12000, msg = 'Request timed out.') {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(msg)), ms);
        promise.then(res => { clearTimeout(timer); resolve(res); })
               .catch(err => { clearTimeout(timer); reject(err); });
      });
    }

    async function dbGet(path) {
      try {
        if (path.includes('/messages/')) {
          const snap = await rtdb.ref(path).once('value');
          return snap.val();
        }
        const ref = getRef(path);
        const snap = await withTimeout(ref.get());
        
        if (!snap.exists && !snap.docs) {
          console.log('dbGet: Nothing found at ' + path);
          return null;
        }
        
        if (snap.exists) {
          return snap.data();
        }
        
        // It's a collection
        const results = snap.docs.reduce((acc, d) => ({ ...acc, [d.id]: d.data() }), {});
        console.log('dbGet: Found ' + Object.keys(results).length + ' items at ' + path);
        return results;
      } catch (e) { 
        console.error('dbGet error:', e); 
        alert('FIREBASE GET ERROR: ' + e.message);
        return null; 
      }
    }

    async function dbSet(path, data) {
      try {
        if (path.includes('/messages/')) {
          await rtdb.ref(path).update(data);
          return true;
        }
        const ref = getRef(path);
        await withTimeout(ref.set(data, { merge: true }));
        return true;
      } catch (e) { console.error('dbSet error:', e); return false; }
    }

    async function dbPush(path, data) {
      try {
        if (path.includes('/messages/')) {
          const ref = rtdb.ref(path);
          const res = await ref.push(data);
          return { name: res.key };
        }
        
        const parts = path.split('/').filter(p => p);
        if (parts.length % 2 === 0) {
          // Even parts = Document path. Use .set()
          const ref = getRef(path);
          await withTimeout(ref.set(data, { merge: true }));
          return { name: parts[parts.length - 1] };
        } else {
          // Odd parts = Collection path. Use .add()
          const ref = getRef(path);
          const res = await withTimeout(ref.add(data));
          return { name: res.id };
        }
      } catch (e) { 
        console.error('dbPush error:', e); 
        alert('FIREBASE PUSH ERROR: ' + e.message);
        return null; 
      }
    }

    async function dbListen(path, cb) {
      if (path.includes('/messages/')) {
        // Listen to Realtime Database
        const ref = rtdb.ref(path);
        ref.on('value', snap => {
          cb(snap.val() || {});
        });
        return () => ref.off();
      } else {
        // Listen to Firestore
        const ref = getRef(path);
        return ref.onSnapshot(snap => {
          if (snap.docs) {
            cb(snap.docs.reduce((acc, d) => ({ ...acc, [d.id]: d.data() }), {}));
          } else {
            cb(snap.data() || {});
          }
        }, e => console.error('dbListen error:', e));
      }
    }

    // --- REALTIME DATABASE HELPERS ---
    async function rtGet(path) {
      try {
        const snap = await rtdb.ref(path).once('value');
        return snap.val();
      } catch (e) { console.error('rtGet error:', e); return null; }
    }

    async function rtSet(path, data) {
      try {
        await rtdb.ref(path).set(data);
        return true;
      } catch (e) { console.error('rtSet error:', e); return false; }
    }

    async function rtPush(path, data) {
      try {
        const ref = rtdb.ref(path).push();
        await ref.set(data);
        return { name: ref.key };
      } catch (e) { console.error('rtPush error:', e); return null; }
    }

    function rtListen(path, cb) {
      const ref = rtdb.ref(path);
      ref.on('value', snap => cb(snap.val()), err => console.error('rtListen error:', err));
      return () => ref.off();
    }

    async function checkConnections() {
      if (demoMode) return { fbOk: true, cldOk: true };
      console.log('Checking connections...');
      let fbOk = false;
      let cldOk = false;
      
      try {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && db) {
          // Check Firestore connectivity with a timeout
          const healthPromise = db.collection('health').doc('ping').get({ source: 'server' });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000));
          await Promise.race([healthPromise, timeoutPromise]);
          fbOk = true;
        }
      } catch (e) { console.warn('Firebase connection check failed:', e); }

      try {
        // Use a more reliable Cloudinary check - fetching a small known image or just the base API
        const res = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/sample.jpg`, { mode: 'no-cors' });
        // mode: 'no-cors' will return an opaque response if reachable, which is enough for a ping
        cldOk = true; 
      } catch (e) { console.warn('Cloudinary connection check failed:', e); }

      return { fbOk, cldOk };
    }
