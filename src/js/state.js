/**
 * App State Management for the Pathfinder App
 */

export const state = {
    cu: null, // Current User
    clubKey: '',
    demoMode: false,
    selRole: '',
    selClass: '',
    selDirType: 'director',
    selSlot: 'slot1',
    sc: { p: 0, n: 0, c: 0 }, // Counters or Scores?
    upCtrs: {},
    msgOff: null,
    activeChat: 'global',
    settings: { 
        devot: true, 
        att: true, 
        scores: true, 
        tip: true 
    },
    stuFromClass: false,
    navHistory: [],
    lastMsgTimestamps: {},
    notifPermission: false,
    classStudents: [],
    honorPhotoData: null,
    pendingUploadType: null,
    currentTab: 'home',
    _exitToastShown: false
};

export function updateState(newProps) {
    Object.assign(state, newProps);
}
