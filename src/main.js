// Riḥla 983 — boot + state machine:
// Title → Route Map → Level n → Museum Card → Route Map → … → Vitrine ending → Credits.
import { createScreen } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { drawDebug } from './engine/debug.js';
import { createLevel } from './game/level.js';
import { loadSave, writeSave, clearSave, collect, maxHeartsFor } from './game/save.js';
import { openCard } from './ui/card.js';
import { createTitleScene, createPauseScene } from './ui/title.js';
import { createMapScene } from './ui/map.js';
import { createVitrineScene } from './ui/vitrine.js';
import { createCreditsScene } from './ui/credits.js';
import data from './data/gameData.js';
import testRoom from './levels/test.js';
import level1 from './levels/level1.js';
import level2 from './levels/level2.js';
import level3 from './levels/level3.js';
import level4 from './levels/level4.js';
import level5 from './levels/level5.js';

const LEVELS = [level1, level2, level3, level4, level5];
const screen = createScreen(document.getElementById('game'), document.getElementById('screen'));
const input = createInput(window);
const ctx = screen.ctx;
const ui = document.getElementById('ui');

const game = { screen, input, debug: false, scene: null, save: loadSave(), sfx: null };
const itemById = id => data.items.find(it => it.id === id);
const persist = () => writeSave(game.save);

// ---------- scenes ----------
function goTitle() {
  const sv = game.save;
  const started = sv.next > 0 || sv.inLevel != null;
  const items = [];
  if (sv.unlocks.complete) items.push({ label: 'Visit the vitrine', act: goVitrine });
  if (started && !sv.unlocks.complete) {
    const lv = sv.inLevel ?? sv.next;
    items.push({ label: `Continue · ${data.levels[lv].name.split(/[,&]/)[0].trim()}`, act: () => (sv.inLevel != null ? goLevel(sv.inLevel, { resume: true }) : goMap()) });
  }
  items.push({ label: started ? 'Route map' : 'Begin the journey', act: () => (started ? goMap() : goLevel(0)) });
  if (started) items.push({ label: 'Reset journey', confirm: 'Forget all progress and start again?', act: () => { game.save = clearSave(); persist(); goTitle(); } });
  items.push({ label: 'Credits', act: () => goCredits(goTitle) });
  const saved = (() => { try { localStorage.setItem('rihla983.probe', '1'); localStorage.removeItem('rihla983.probe'); return true; } catch (e) { return false; } })();
  game.scene = createTitleScene(game, { items, note: saved ? '' : 'Saving is off in this browser (storage blocked); progress lasts until you close the tab.' });
}

function goMap(selected) {
  game.save.inLevel = null; game.save.checkpoint = null; persist();
  game.scene = createMapScene(game, { data, save: game.save, selected, onTravel: i => goLevel(i), onBack: goTitle });
}

function goLevel(i, { resume = false } = {}) {
  const info = data.levels[i];
  const sv = game.save;
  sv.inLevel = i;
  if (!resume) sv.checkpoint = null;
  persist();
  let level;
  level = createLevel(game, LEVELS[i], {
    info, item: itemById(info.item),
    flags: { ...sv.unlocks },
    maxHearts: maxHeartsFor(sv),
    inventory: sv.items.map(id => itemById(id).sprite),
    checkpoint: resume && sv.checkpoint ? sv.checkpoint : null,
    onCheckpoint: cp => { sv.checkpoint = cp; persist(); },
    onItem: it => openMuseumCard(level, it, i),
  });
  game.levelIndex = i;
  game.scene = withPause(level, i);
}

// Esc in a level opens the pause menu.
function withPause(level, i) {
  const wrapped = {
    level,
    update(g) {
      if (g.input.pressed.pause && !level.done && !level.pickup) {
        g.input.consume('pause');
        game.scene = createPauseScene(game, {
          under: level,
          items: [
            { label: 'Resume', act: () => { game.scene = wrapped; } },
            { label: 'Restart from checkpoint', act: () => { level.respawnPlayer(true); game.scene = wrapped; } },
            { label: () => (game.muted ? 'Sound: off (M)' : 'Sound: on (M)'), act: () => { game.toggleMute && game.toggleMute(); } },
            { label: 'Route map', act: () => goMap(i) },
            { label: 'Title screen', act: goTitle },
          ],
        });
        return;
      }
      level.update(g);
    },
    render(c) { level.render(c); },
    debugLines() { return level.debugLines(); },
  };
  return wrapped;
}

// Object picked up: record it, then slide in the museum card over the frozen level.
function openMuseumCard(level, item, i) {
  collect(game.save, item.id, i);
  persist();
  game.sfx && game.sfx('card');
  showCard(level, item, `Level ${i + 1} · ${data.levels[i].name}`, () => {
    if (game.save.unlocks.complete && item.id === 'pyxis') goVitrine();
    else goMap(Math.min(i + 1, LEVELS.length - 1));
  });
}

function showCard(under, item, label, after) {
  let closedAt = -1, t = 0;
  const card = openCard(ui, item, { levelLabel: label, onClose: () => { closedAt = t; } });
  game.scene = {
    update(g) { t++; card.update(g); if (closedAt >= 0 && t - closedAt > 16) after(); },
    render(c) { under.render(c); c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(0, 0, 320, 180); },
  };
}

function goVitrine() {
  game.save.inLevel = null; persist();
  const v = createVitrineScene(game, {
    data,
    onCard: it => showCard(v, it, 'In the vitrine', () => { game.scene = v; }),
    onDone: () => goCredits(goTitle),
  });
  game.scene = v;
}

function goCredits(back) {
  game.scene = createCreditsScene(game, { root: ui, data, onBack: back });
}

// ---------- dev shortcuts (only while the F3 overlay is on) ----------
// 1–5 start a level (granting earlier unlocks), T opens the engine test room, G grants everything.
const devKeys = [];
window.addEventListener('keydown', e => { if (game.debug) devKeys.push(e.key); });
function runDevKeys() {
  while (devKeys.length) {
    const k = devKeys.shift();
    const n = '12345'.indexOf(k);
    if (n >= 0) {
      ['bowl-samanid', 'bowl-camels', 'tiraz-veil', 'blue-quran'].slice(0, n).forEach((id, j) => collect(game.save, id, j));
      goLevel(n);
    }
    if (k === 't' || k === 'T') game.scene = createLevel(game, testRoom, { info: { backdrop: 'bukhara' } });
    if (k === 'g' || k === 'G') { data.items.forEach((it, j) => collect(game.save, it.id, j)); persist(); goTitle(); }
  }
}

// ---------- loop ----------
function update() {
  if (game.hold && !game.stepping) return; // dev: frozen except for __rihla.step()
  input.update();
  if (input.pressed.debug) game.debug = !game.debug;
  if (input.pressed.mute && game.toggleMute) game.toggleMute();
  runDevKeys();
  game.scene.update(game);
}

function render() {
  ctx.imageSmoothingEnabled = false;
  game.scene.render(ctx, game);
  if (game.debug) drawDebug(ctx, { stats, input, screen, lines: game.scene.debugLines ? game.scene.debugLines() : [] });
}

goTitle();
const stats = startLoop(update, render);
// Dev hook: window.__rihla.step(n) runs n fixed updates synchronously (for tests);
// set __rihla.hold = true to stop the clock in between.
game.step = (n = 1) => { game.stepping = true; for (let i = 0; i < n; i++) update(); game.stepping = false; render(); };
game.go = { title: goTitle, map: goMap, level: goLevel, vitrine: goVitrine, credits: goCredits };
window.__rihla = game;
