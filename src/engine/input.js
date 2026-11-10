// Keyboard + Gamepad (standard mapping) → abstract actions.
// held[a]: down this update; pressed[a]: went down since last update (taps are latched).
export const ACTIONS = ['left', 'right', 'up', 'down', 'jump', 'action', 'confirm', 'pause', 'mute', 'debug'];

const KEYMAP = {
  ArrowLeft: ['left'], KeyA: ['left'],
  ArrowRight: ['right'], KeyD: ['right'],
  ArrowUp: ['up', 'jump'], KeyW: ['up', 'jump'],
  ArrowDown: ['down'], KeyS: ['down'],
  KeyZ: ['jump'], Space: ['jump'],
  KeyX: ['action'],
  Enter: ['confirm'], NumpadEnter: ['confirm'],
  Escape: ['pause'],
  KeyM: ['mute'],
  F3: ['debug'],
};

// Standard gamepad buttons: 0 A, 1 B, 2 X, 3 Y, 8 Back, 9 Start, 12–15 D-pad.
const PADMAP = { 0: ['jump', 'confirm'], 1: ['action'], 2: ['action'], 9: ['pause'], 8: ['mute'], 12: ['up'], 13: ['down'], 14: ['left'], 15: ['right'] };

export function createInput(target = window) {
  const keysDown = new Set();
  const latched = new Set();
  const virtual = new Set();    // held by touch buttons
  const held = {}, pressed = {}, released = {};
  const prev = {};
  const firstInput = [];
  let gotFirstInput = false;
  ACTIONS.forEach(a => { held[a] = pressed[a] = released[a] = prev[a] = false; });

  function first(e) {
    if (gotFirstInput) return;
    gotFirstInput = true;
    for (const fn of firstInput) { try { fn(e); } catch (err) { console.warn(err); } }
  }

  target.addEventListener('keydown', e => {
    // Let focused links/buttons in DOM overlays (museum card, credits) handle their own keys.
    const ui = e.target && e.target.closest && e.target.closest('a,button,input,textarea,select');
    const acts = ui && (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') ? null : KEYMAP[e.code];
    if (acts) {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) e.preventDefault();
      if (!e.repeat) acts.forEach(a => latched.add(a));
      keysDown.add(e.code);
    }
    input.lastKey = e.code;
    first(e);
  });
  target.addEventListener('keyup', e => { keysDown.delete(e.code); });
  window.addEventListener('blur', () => { keysDown.clear(); virtual.clear(); });
  target.addEventListener('pointerdown', first);
  target.addEventListener('touchstart', first, { passive: true });

  function padState() {
    const out = new Set();
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p || !p.connected) continue;
      p.buttons.forEach((b, i) => { if ((b.pressed || b.value > 0.5) && PADMAP[i]) PADMAP[i].forEach(a => out.add(a)); });
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      if (ax < -0.4) out.add('left');
      if (ax > 0.4) out.add('right');
      if (ay < -0.6) out.add('up');
      if (ay > 0.6) out.add('down');
      input.padConnected = true;
    }
    return out;
  }

  const input = {
    held, pressed, released, keysDown, padConnected: false, lastKey: '',
    onFirstInput(fn) { if (gotFirstInput) fn(); else firstInput.push(fn); },
    press(a) { latched.add(a); first(); },
    setVirtual(a, on) { if (on) { virtual.add(a); latched.add(a); first(); } else virtual.delete(a); },
    update() {
      const pad = padState();
      for (const a of ACTIONS) {
        let h = pad.has(a) || virtual.has(a);
        if (!h) for (const code of keysDown) { const m = KEYMAP[code]; if (m && m.includes(a)) { h = true; break; } }
        held[a] = h;
        pressed[a] = latched.has(a) || (h && !prev[a]);
        released[a] = !h && prev[a];
        prev[a] = h;
      }
      latched.clear();
    },
    // Swallow presses so a key that opened a screen doesn't also act on it.
    consume(...acts) { (acts.length ? acts : ACTIONS).forEach(a => { pressed[a] = false; }); },
  };
  return input;
}
