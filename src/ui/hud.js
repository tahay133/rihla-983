// Heads-up display: hearts, unlock icons, level name banner, toasts.
import { blit, SPRITES, miniRows } from '../art/sprites.js';
import { drawText, measureText } from '../art/font.js';

export function drawHearts(ctx, p) {
  for (let i = 0; i < p.maxHearts; i++) blit(ctx, i < p.hearts ? 'heart' : 'heartEmpty', 4 + i * 9, 4);
}

// A small dark box with centred text lines.
export function drawBox(ctx, lines, cx, y, opt = {}) {
  const pad = opt.pad ?? 4;
  const w = Math.max(...lines.map(l => measureText(l))) + pad * 2;
  const h = lines.length * 9 - 4 + pad * 2;
  const x = Math.round(cx - w / 2);
  ctx.fillStyle = opt.bg || 'rgba(14,10,20,0.85)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = opt.border || '#c9962b';
  ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  lines.forEach((l, i) => drawText(ctx, l, cx, y + pad + i * 9, { align: 'center', color: i === 0 ? opt.color || '#f3ead2' : opt.color2 || opt.color || '#f3ead2' }));
  return { x, y, w, h };
}

// Collected objects as half-size icons, top right.
export function drawInventory(ctx, spriteNames) {
  let x = 316;
  for (let i = spriteNames.length - 1; i >= 0; i--) {
    const mini = spriteNames[i] + 'Mini';
    if (!SPRITES[mini]) SPRITES[mini] = miniRows(spriteNames[i]);
    const w = SPRITES[mini][0].length;
    x -= w + 2;
    blit(ctx, mini, x, 4);
  }
}
