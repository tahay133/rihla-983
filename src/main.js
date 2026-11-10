// Riḥla 983 — boot + state machine.
import { createScreen, W, H } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { drawDebug } from './engine/debug.js';
import { drawText } from './art/font.js';
import { createPlayer, updatePlayer, hurtPlayer, drawPlayer } from './game/player.js';
import { drawHearts } from './ui/hud.js';

const screen = createScreen(document.getElementById('game'), document.getElementById('screen'));
const input = createInput(window);
const ctx = screen.ctx;

const game = { screen, input, debug: false, scene: null, debugLines: [] };

// Movement test: a flat 20×12-tile room. X simulates taking a hit.
const flatWorld = {
  cols: 20, rows: 12,
  solidAt(tx, ty) { return tx < 0 || tx >= 20 || ty >= 10 ? 1 : 0; },
  tileAt(tx, ty) { return this.solidAt(tx, ty) ? '#' : '.'; },
  waterAt() { return false; },
};
const testScene = {
  p: createPlayer(40, 146),
  update(g) {
    if (g.input.pressed.action) hurtPlayer(this.p, this.p.x + this.p.w / 2 + this.p.facing * 4);
    if (this.p.hearts === 0) this.p.hearts = this.p.maxHearts;
    updatePlayer(this.p, g.input, flatWorld);
  },
  render(c) {
    c.fillStyle = '#2a1f3d'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#7a5232'; c.fillRect(0, 160, W, 20);
    c.fillStyle = '#a06c42'; c.fillRect(0, 160, W, 1);
    drawText(c, 'MOVEMENT TEST · ← → MOVE · Z/SPACE/↑ JUMP · X TAKE A HIT', W / 2, 20, { align: 'center', color: '#cbbd98' });
    drawPlayer(c, this.p, 0, 0);
    drawHearts(c, this.p);
  },
  debugLines() {
    const p = this.p;
    return [`P ${p.x.toFixed(1)},${p.y.toFixed(1)} V ${p.vx.toFixed(2)},${p.vy.toFixed(2)} ${p.onGround ? 'GROUND' : 'AIR'} COYOTE ${p.coyote} BUF ${p.jumpBuf}`];
  },
};

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
