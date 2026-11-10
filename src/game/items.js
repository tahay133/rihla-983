// End-of-level Met object (bobs 1 px on a 40-frame cycle and sparkles) and tutorial signs.
import { TS } from '../engine/physics.js';
import { blit, getSprite } from '../art/sprites.js';

export function createItem(tx, ty, item) {
  const s = getSprite(item.sprite);
  return { kind: 'item', item, sprite: item.sprite, w: s.w, h: s.h, x: tx * TS + (TS - s.w) / 2, y: (ty + 1) * TS - s.h - 4, t: 0, sparks: [], taken: false };
}

export function updateItem(it) {
  it.t++;
  if (it.t % 9 === 0) it.sparks.push({ x: it.x - 3 + Math.random() * (it.w + 6), y: it.y - 3 + Math.random() * (it.h + 6), life: 24 });
  it.sparks.forEach(s => { s.life--; s.y -= 0.15; });
  it.sparks = it.sparks.filter(s => s.life > 0);
}

export function itemHitbox(it) { return { x: it.x + 2, y: it.y + 2, w: it.w - 4, h: it.h - 2 }; }

export function drawItem(ctx, it, camX, camY) {
  if (it.taken) return;
  const bob = it.t % 40 < 20 ? 0 : -1;
  const x = Math.round(it.x) - camX, y = Math.round(it.y) + bob - camY;
  // soft gold halo
  ctx.fillStyle = 'rgba(232,196,90,0.18)';
  ctx.fillRect(x - 3, y - 2, it.w + 6, it.h + 4);
  ctx.fillRect(x - 1, y - 4, it.w + 2, it.h + 8);
  blit(ctx, it.sprite, x, y);
  for (const s of it.sparks) {
    const sx = Math.round(s.x) - camX, sy = Math.round(s.y) - camY;
    ctx.fillStyle = s.life > 12 ? '#fff6c8' : '#e8c45a';
    ctx.fillRect(sx, sy, 1, 1);
    if (s.life > 16) { ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3); }
  }
}

export function createSign(tx, ty, text) {
  return { kind: 'sign', x: tx * TS + 2, y: (ty + 1) * TS - 14, w: 12, h: 14, text: text || '' };
}

export function drawSign(ctx, s, camX, camY) {
  const x = s.x - camX, y = s.y - camY;
  if (x < -16 || x > 336) return;
  blit(ctx, 'sign', x, y);
}
