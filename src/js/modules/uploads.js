/**
 * Uploads and Image Handling module for the Pathfinder App
 */

import { id, toast, load, hideLoad, today, san } from '../utils.js';
import { state, updateState } from '../state.js';
import { dbPush, dbSet } from '../firebase.js';
import { CLD_CLOUD, CLD_PRESET } from '../config.js';

export async function uploadToCloudinary(base64, filename) {
    if (state.demoMode) {
        return 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
    }
    
    try {
        const formData = new FormData();
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1] || arr[0]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8arr], { type: mime });

        formData.append('file', blob, filename || 'upload.jpg');
        formData.append('upload_preset', CLD_PRESET);
        formData.append('folder', `pathfinderapp/${state.clubKey || 'default'}`);

        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!r.ok) {
            const errText = await r.text();
            console.error('Cloudinary HTTP error:', r.status, errText);
            return null;
        }

        const data = await r.json();
        return data.secure_url || null;
    } catch (e) {
        console.error('Cloudinary exception:', e);
        return null;
    }
}

export function requestImageFromApp(type, source) {
    updateState({ pendingUploadType: type });
    
    if (window.AppInventor && window.AppInventor.setWebViewString) {
        window.AppInventor.setWebViewString('PICK_IMAGE:' + type + (source ? ':' + source : ''));
    }
    
    window.uploadRequest = type;
    
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    if (source === 'camera') inp.setAttribute('capture', 'environment');
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;width:1px;height:1px;opacity:0;';
    document.body.appendChild(inp);
    
    inp.addEventListener('change', function handler(e) {
        inp.removeEventListener('change', handler);
        document.body.removeChild(inp);
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                receiveImageFromApp(ev.target.result, type);
            };
            reader.readAsDataURL(file);
        }
    });
    inp.click();
}

export function receiveImageFromApp(base64Data, uploadType) {
    if (!base64Data) { 
        toast('No image received. Try again.'); 
        return; 
    }
    
    const data = (typeof base64Data === 'string' && base64Data.startsWith('data:'))
        ? base64Data
        : 'data:image/jpeg;base64,' + base64Data;

    const type = uploadType || state.pendingUploadType || 'journal';

    if (type === 'honor') {
        updateState({ honorPhotoData: data });
        const pi = id('honor-preview-img');
        const pb = id('honor-photo-preview');
        const uz = id('honor-photo-zone');
        const pn = id('honor-photo-name');
        
        if (pi) { pi.src = data; pi.style.display = 'block'; }
        if (pb) pb.style.display = 'block';
        if (uz) uz.style.display = 'none';
        if (pn) pn.textContent = '✓ Photo selected — tap Send to submit';
        toast('📸 Photo attached!');
    } else if (type === 'devotion') {
        handleDevotionUploadData(data);
    } else {
        handleFileUploadData(data, type);
    }
    
    updateState({ pendingUploadType: null });
}

export async function handleFileUploadData(base64, type) {
    if (!state.cu) return;
    load('Uploading...');
    const url = await uploadToCloudinary(base64, `journal_${state.cu.uid}_${Date.now()}`);
    hideLoad();
    if (!url) { toast('Upload failed'); return; }

    const obj = {
        url,
        type,
        ts: Date.now(),
        date: today(),
        by: state.cu.name,
        status: 'pending'
    };
    await dbPush(`clubs/${state.clubKey}/uploads/${state.cu.uid}/${type}`, obj);
    toast('✅ Submitted successfully!');
    if (window.buildStuView) window.buildStuView();
}

export async function handleDevotionUploadData(base64) {
    if (!state.cu) return;
    load('Uploading Devotion...');
    const url = await uploadToCloudinary(base64, `devotion_${state.cu.uid}_${Date.now()}`);
    hideLoad();
    if (!url) { toast('Upload failed'); return; }

    const obj = {
        url,
        ts: Date.now(),
        date: today(),
        uploaded: true
    };
    await dbSet(`clubs/${state.clubKey}/devotionJournals/${state.cu.classId}/${today()}/${san(state.cu.name)}`, obj);
    toast('📖 Devotion submitted!');
    if (window.buildStuView) window.buildStuView();
}
