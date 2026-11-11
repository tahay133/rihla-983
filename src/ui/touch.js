// Phones and tablets: on-screen controls, the "turn sideways" screen, fullscreen + landscape lock.
// Buttons are real CSS pixels anchored to the screen edges, so in landscape they sit in the side
// margins that integer scaling leaves around the 16:9 game. Labels match the keyboard keys the
// in-game signs mention (◀ ▶ ▼ Z X).
const params = new URLSearchParams(location.search);
export const isTouch = params.has('touch') || !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
const uprightMQ = window.matchMedia ? window.matchMedia('(pointer: coarse) and (orientation: portrait) and (max-width: 600px)') : null;

// True while an upright phone is showing the "turn sideways" screen (the game pauses).
export function rotatePrompting() {
  return !!(uprightMQ && uprightMQ.matches && !document.documentElement.classList.contains('upright'));
}

const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
const fsOK = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

function toggleFullscreen() {
  const root = document.documentElement;
  if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
  const req = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!req) return;
  Promise.resolve(req.call(root, { navigationUI: 'hide' }))
    .then(() => screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null)
    .catch(() => { /* not allowed here (e.g. iPhone Safari): the rotate screen still guides the player */ });
}

export function addTouchControls(input) {
  const skip = document.getElementById('rotate-skip');
  if (skip) skip.addEventListener('click', () => document.documentElement.classList.add('upright'));
  if (!isTouch) return null;

  const layer = document.createElement('div');
  layer.className = 'touch';
  const pad = (cls, buttons) => {
    const p = document.createElement('div');
    p.className = 'tpad ' + cls;
    for (const [act, label, aria] of buttons) {
      const b = document.createElement('div');
      b.className = 'tbtn'; b.dataset.act = act; b.textContent = label;
      b.setAttribute('role', 'button'); b.setAttribute('aria-label', aria);
      p.append(b);
    }
    layer.append(p);
    return p;
  };
  const moves = pad('l', [['down', '▼', 'down / drop'], ['left', '◀', 'left'], ['right', '▶', 'right']]);
  const acts = pad('r', [['action', 'X', 'action'], ['jump', 'Z', 'jump']]);
  const top = pad('t', fsOK() ? [['fullscreen', '⛶', 'fullscreen'], ['pause', 'II', 'pause']] : [['pause', 'II', 'pause']]);

  // Each finger holds at most one button; sliding a finger across buttons switches between them.
  const fingers = new Map(); // pointerId → action
  const counts = {};
  const btnFor = act => layer.querySelector(`[data-act="${act}"]`);
  function set(id, act) {
    const prev = fingers.get(id);
    if (prev === act) return;
    if (prev) {
      counts[prev]--;
      if (!counts[prev]) { input.setVirtual(prev, false); btnFor(prev).classList.remove('on'); }
    }
    if (act) {
      fingers.set(id, act);
      counts[act] = (counts[act] || 0) + 1;
      if (counts[act] === 1) { input.setVirtual(act, true); btnFor(act).classList.add('on'); }
    } else fingers.delete(id);
  }
  const hit = e => { const t = document.elementFromPoint(e.clientX, e.clientY); const b = t && t.closest && t.closest('.tpad .tbtn'); return b ? b.dataset.act : null; };
  for (const p of [moves, acts, top]) {
    p.addEventListener('pointerdown', e => {
      e.preventDefault();
      const act = hit(e);
      if (act === 'fullscreen') { toggleFullscreen(); return; }
      if (!act) return;
      try { p.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already-released pointer */ }
      set(e.pointerId, act);
    });
    p.addEventListener('pointermove', e => {
      if (!fingers.has(e.pointerId)) return;
      const act = hit(e);
      if (act && act !== 'fullscreen' && act !== 'pause') set(e.pointerId, act);
    });
    const up = e => set(e.pointerId, null);
    p.addEventListener('pointerup', up);
    p.addEventListener('pointercancel', up);
    p.addEventListener('lostpointercapture', up);
    p.addEventListener('contextmenu', e => e.preventDefault());
  }
  document.body.append(layer);
  return layer;
}
