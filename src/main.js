// Riḥla 983 — boot + state machine.
import { createScreen } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { drawDebug } from './engine/debug.js';
import { createLevel } from './game/level.js';
import testRoom from './levels/test.js';
import level1 from './levels/level1.js';
import data from './data/gameData.js';

const screen = createScreen(document.getElementById('game'), document.getElementById('screen'));
const input = createInput(window);
const ctx = screen.ctx;

const game = { screen, input, debug: false, scene: null, debugLines: [] };

const LEVELS = [level1];

game.startLevel = (i, extra = {}) => {
  const info = data.levels[i];
  const item = data.items.find(it => it.id === info.item);
  game.levelIndex = i;
  game.scene = createLevel(game, LEVELS[i], { info, item, ...extra });
};

// Dev shortcuts while the F3 overlay is on: 1–5 jump to a level, T opens the engine test room.
const devKeys = [];
window.addEventListener('keydown', e => { if (game.debug) devKeys.push(e.key); });
function runDevKeys() {
  while (devKeys.length) {
    const k = devKeys.shift();
    const n = '12345'.indexOf(k);
    if (n >= 0 && LEVELS[n]) game.startLevel(n);
    if (k === 't' || k === 'T') game.scene = createLevel(game, testRoom, { info: { backdrop: 'bukhara' } });
  }
}

game.startLevel(0);

function update() {
  if (game.hold && !game.stepping) return; // dev: frozen except for __rihla.step()
  input.update();
  if (input.pressed.debug) game.debug = !game.debug;
  runDevKeys();
  game.scene.update(game);
}

function render() {
  ctx.imageSmoothingEnabled = false;
  game.scene.render(ctx, game);
  if (game.debug) drawDebug(ctx, { stats, input, screen, lines: game.scene.debugLines ? game.scene.debugLines() : [] });
}

const stats = startLoop(update, render);
// Dev hook: window.__rihla.step(n) runs n fixed updates synchronously (for tests);
// set __rihla.hold = true to stop the clock in between.
game.step = (n = 1) => { game.stepping = true; for (let i = 0; i < n; i++) update(); game.stepping = false; render(); };
window.__rihla = game;
