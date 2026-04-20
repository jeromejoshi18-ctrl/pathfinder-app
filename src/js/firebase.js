/**
 * Firebase helper functions for the Pathfinder App (Firestore Version)
 */

export function initFirebase() {
    if (!window.firebase.apps.length) {
        console.warn('Firebase not initialized. Check index.html for SDK inclusion.');
    }
    const db = window.firebase.firestore();
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence disabled.');
        } else if (err.code == 'unimplemented') {
            console.warn('Browser does not support persistence.');
        }
    });
    
    return db;
}

export const db = initFirebase();

/**
 * Normalizes a path string to a Firestore Reference (Doc or Collection)
 */
function getRef(path) {
    const parts = path.split('/').filter(p => p.length > 0);
    let ref = db;
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            ref = ref.collection(parts[i]);
        } else {
            ref = ref.doc(parts[i]);
        }
    }
    return ref;
}

export async function dbGet(path) { 
    try { 
        const ref = getRef(path);
        if (path.split('/').filter(p => p.length > 0).length % 2 === 0) {
            const snap = await ref.get(); 
            return snap.exists ? snap.data() : null; 
        } else {
            const snap = await ref.get();
            const results = {};
            snap.forEach(doc => { results[doc.id] = doc.data(); });
            return results;
        }
    } catch (e) { 
        console.error('dbGet Error:', e);
        return null; 
    } 
}

export async function dbSet(path, data, merge = true) { 
    try { 
        const ref = getRef(path);
        // If it's a collection path, we can't 'set'. We must use a doc path.
        if (path.split('/').filter(p => p.length > 0).length % 2 !== 0) {
            throw new Error('dbSet requires a document path (even number of parts).');
        }
        await ref.set(data, { merge }); 
        return true; 
    } catch (e) { 
        console.error('dbSet Error:', e);
        return false; 
    } 
}

export async function dbPush(path, data) { 
    try { 
        const ref = getRef(path);
        // If it's a doc path, we 'add' to its subcollection? No, we expect a collection path.
        if (path.split('/').filter(p => p.length > 0).length % 2 === 0) {
            // If user passed a doc path, they probably want a subcollection named 'entries'
            const r = await ref.collection('entries').add({ ...data, ts: Date.now() });
            return { name: r.id };
        }
        const r = await ref.add({ ...data, ts: Date.now() }); 
        return { name: r.id }; 
    } catch (e) { 
        console.error('dbPush Error:', e);
        return null; 
    } 
}

export function dbListen(path, cb) { 
    try {
        const ref = getRef(path);
        const partsCount = path.split('/').filter(p => p.length > 0).length;
        
        if (partsCount % 2 === 0) {
            // Listen to a Document
            return ref.onSnapshot(s => cb(s.exists ? s.data() : null));
        } else {
            // Listen to a Collection
            return ref.orderBy('ts', 'asc').onSnapshot(s => {
                const results = {};
                s.forEach(doc => { results[doc.id] = doc.data(); });
                cb(results);
            }, err => {
                // If orderBy fails (e.g. index needed), fallback to unordered
                console.warn('Firestore OrderBy failed, falling back to unordered listen.', err);
                ref.onSnapshot(s => {
                    const results = {};
                    s.forEach(doc => { results[doc.id] = doc.data(); });
                    cb(results);
                });
            });
        }
    } catch (e) {
        console.error('dbListen Error:', e);
        return () => {};
    }
}
