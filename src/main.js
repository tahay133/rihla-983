// Riḥla 983 — boot + state machine.
import { createScreen, W, H } from './engine/screen.js';
import { startLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { drawDebug } from './engine/debug.js';
import { drawText } from './art/font.js';
import { blit, getSprite } from './art/sprites.js';
import './art/backdrops.js';

const screen = createScreen(document.getElementById('game'), document.getElementById('screen'));
const input = createInput(window);
const ctx = screen.ctx;

const game = { screen, input, debug: false, scene: null, debugLines: [] };

// Sprite test scene: all 7 handoff sprites, pre-rendered and drawn crisp at integer scales.
const ORIGINAL = ['traveller', 'travellerWalk', 'bowlSamanid', 'bowlCamels', 'tiraz', 'blueQuran', 'pyxis'];
const testScene = {
  t: 0,
  update() { this.t++; },
  render(c) {
    c.fillStyle = '#14121b'; c.fillRect(0, 0, W, H);
    drawText(c, 'Riḥla 983 · sprite test', W / 2, 6, { align: 'center', color: '#e8c45a' });
    // row 1: traveller, walk frame, animated + flipped, at ×4
    const walk = (this.t >> 4) & 1 ? 'travellerWalk' : 'traveller';
    [['traveller', 1], ['travellerWalk', 1], [walk, 1], [walk, -1]].forEach(([n, f], i) => {
      const x = 28 + i * 70;
      c.fillStyle = '#1f1c29'; c.fillRect(x - 4, 18, 56, 72);
      blit(c, n, x + 4, 22, f, 4);
      drawText(c, i < 2 ? n : i === 2 ? 'walk →' : '← flipped', x + 24, 92, { align: 'center', color: '#b3a991' });
    });
    // row 2: the five Met objects at ×3
    ORIGINAL.slice(2).forEach((n, i) => {
      const s = getSprite(n);
      const x = 12 + i * 61;
      c.fillStyle = '#20202c'; c.fillRect(x, 104, 56, 56);
      c.fillStyle = '#c9962b'; c.fillRect(x, 104, 56, 1); c.fillRect(x, 159, 56, 1); c.fillRect(x, 104, 1, 56); c.fillRect(x + 55, 104, 1, 56);
      blit(c, n, x + 28 - (s.w * 3) / 2, 132 - (s.h * 3) / 2, 1, 3);
      drawText(c, n, x + 28, 164, { align: 'center', color: '#b3a991' });
    });
  },
  debugLines() { return ['SPRITES ' + ORIGINAL.join(' ')]; },
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
