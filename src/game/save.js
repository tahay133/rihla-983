// Journey progress in localStorage. Every access is wrapped: the game must still run
// (without saving) when storage is blocked, e.g. in a private window.
const KEY = 'rihla983.save.v1';

// Which unlock each Met object grants (see the "unlock" text in gameData).
export const UNLOCK_OF = {
  'bowl-samanid': 'blessing', // +1 max heart
  'bowl-camels': 'glint',     // luster platforms
  'tiraz-veil': 'robe',       // Fatimid gates open
  'blue-quran': 'light',      // lights dark halls
  'pyxis': 'complete',        // the vitrine ending
};

export function freshSave() {
  return { v: 1, next: 0, items: [], unlocks: {}, inLevel: null, checkpoint: null, muted: false };
}

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return freshSave();
    const s = JSON.parse(raw);
    if (!s || s.v !== 1) return freshSave();
    return { ...freshSave(), ...s, unlocks: { ...(s.unlocks || {}) }, items: [...(s.items || [])] };
  } catch (e) {
    return freshSave();
  }
}

export function writeSave(s) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
}

export function clearSave() {
  try { window.localStorage.removeItem(KEY); } catch (e) { /* storage blocked: nothing to clear */ }
  return freshSave();
}

export function collect(s, itemId, levelIndex) {
  if (!s.items.includes(itemId)) s.items.push(itemId);
  const u = UNLOCK_OF[itemId];
  if (u) s.unlocks[u] = true;
  s.next = Math.max(s.next, levelIndex + 1);
  s.inLevel = null;
  s.checkpoint = null;
}

export function maxHeartsFor(s, base = 3) { return base + (s.unlocks.blessing ? 1 : 0); }
