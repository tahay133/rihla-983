// Optional on-screen buttons for touch screens (shown only when the primary pointer is coarse).
export function addTouchControls(root, input) {
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!coarse) return null;
  const pad = document.createElement('div');
  pad.className = 'touch';
  const buttons = [
    ['left', '◀', 'tl'], ['right', '▶', 'tr'], ['action', 'X', 'ba'], ['jump', 'Z', 'bj'], ['pause', 'II', 'bp'],
  ];
  for (const [act, label, cls] of buttons) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tbtn ' + cls; b.textContent = label;
    b.setAttribute('aria-label', act);
    const on = e => { e.preventDefault(); input.setVirtual(act, true); if (act === 'jump' || act === 'pause') input.press(act === 'jump' ? 'confirm' : 'pause'); };
    const off = e => { e.preventDefault(); input.setVirtual(act, false); };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('pointerleave', off);
    pad.append(b);
  }
  root.append(pad);
  return pad;
}
