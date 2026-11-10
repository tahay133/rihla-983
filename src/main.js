// Riḥla 983 — boot + state machine.
import { createScreen, W, H } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { drawDebug } from './engine/debug.js';
import { drawText } from './art/font.js';

const screen = createScreen(document.getElementById('game'), document.getElementById('screen'));
const input = createInput(window);
const ctx = screen.ctx;

const game = { screen, input, debug: false, scene: null, debugLines: [] };

// Engine test scene: a dot you can move, to check input, scaling and timing.
const testScene = {
  x: 160, y: 120, t: 0,
  update() {
    this.t++;
    if (input.held.left) this.x -= 1;
    if (input.held.right) this.x += 1;
    if (input.held.up) this.y -= 1;
    if (input.held.down) this.y += 1;
    this.x = Math.max(0, Math.min(W - 1, this.x));
    this.y = Math.max(0, Math.min(H - 1, this.y));
  },
  render(c) {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    drawText(c, 'Riḥla 983', W / 2, 70, { align: 'center', scale: 3, color: '#e8c45a', shadow: '#5a3a12' });
    drawText(c, 'ENGINE TEST · ARROWS MOVE · F3 DEBUG', W / 2, 100, { align: 'center', color: '#cbbd98' });
    // 1-px checker strip: any blur from scaling is obvious here
    for (let x = 0; x < W; x++) { c.fillStyle = (x & 1) ? '#f3ead2' : '#1f2a6b'; c.fillRect(x, H - 4, 1, 4); }
    c.fillStyle = '#a33a2a'; c.fillRect(this.x - 1, this.y - 1, 3, 3);
  },
  debugLines() { return [`DOT ${this.x},${this.y}  T ${this.t}`]; },
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
window.__rihla = game;
