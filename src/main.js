// Riḥla 983 — boot + state machine.
import { createScreen, W, H } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { drawDebug } from './engine/debug.js';
import { drawText } from './art/font.js';
import { createLevel } from './game/level.js';
import testRoom from './levels/test.js';

const screen = createScreen(document.getElementById('game'), document.getElementById('screen'));
const input = createInput(window);
const ctx = screen.ctx;

const game = { screen, input, debug: false, scene: null, debugLines: [] };

// Engine test room (camera, collision, one-way ledges, camel platform, checkpoint).
const testScene = createLevel(game, { ...testRoom, backdrop: 'bukhara' });
const CITIES = ['bukhara', 'baghdad', 'cairo', 'qayrawan', 'cordoba'];
window.addEventListener('keydown', e => { const n = '12345'.indexOf(e.key); if (n >= 0) testScene.setBackdrop(CITIES[n]); });

game.scene = testScene;

function update() {
  input.update();
  if (input.pressed.debug) game.debug = !game.debug;
  game.scene.update(game);
}

function render() {
  ctx.imageSmoothingEnabled = false;
  game.scene.render(ctx, game);
  if (game.debug) drawDebug(ctx, { stats, input, screen, lines: game.scene.debugLines ? game.scene.debugLines() : [] });
}

const stats = startLoop(update, render);
// Dev hook: window.__rihla.step(n) runs n fixed updates synchronously (for tests).
game.step = (n = 1) => { for (let i = 0; i < n; i++) update(); render(); };
window.__rihla = game;
