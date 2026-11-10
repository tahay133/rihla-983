// F3 debug overlay: FPS/UPS, scale, input states, plus any lines a scene adds.
import { drawText } from '../art/font.js';
import { ACTIONS } from './input.js';

export function drawDebug(ctx, { stats, input, screen, lines = [] }) {
  const rows = [
    `FPS ${stats.fps}  UPS ${stats.ups}  SCALE ${screen.scale}X  DPR ${(window.devicePixelRatio || 1).toFixed(2)}`,
    'HELD ' + ACTIONS.filter(a => input.held[a]).join(' ').toUpperCase(),
    input.padConnected ? 'GAMEPAD CONNECTED' : 'NO GAMEPAD',
    ...lines,
  ];
  const h = rows.length * 8 + 4;
  ctx.fillStyle = 'rgba(8,6,14,0.78)';
  ctx.fillRect(0, 0, 320, h);
  rows.forEach((r, i) => drawText(ctx, r, 3, 3 + i * 8, { color: i === 0 ? '#e8c45a' : '#cfe8d8' }));
}
