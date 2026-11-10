// Hazards: scorpions (patrol the sand) and dust gusts (zones that push the traveller back).
// Touching a hazard costs one heart with knockback; nothing here can kill permanently.
import { TS, moveX, moveY } from '../engine/physics.js';
import { blit } from '../art/sprites.js';

export function createScorpion(tx, ty, opts = {}) {
  const x = tx * TS + 2, y = (ty + 1) * TS - 7;
  const range = opts.range ?? 48;
  return { kind: 'scorpion', x, y, w: 12, h: 7, dir: opts.dir || -1, speed: opts.speed || 0.35, x0: x - range, x1: x + range, t: (tx * 13) % 40 };
}

export function updateScorpion(s, world) {
  s.t++;
  const nx = s.x + s.dir * s.speed;
  const aheadX = s.dir > 0 ? nx + s.w + 1 : nx - 1;
  const footTy = Math.floor((s.y + s.h + 2) / TS), bodyTy = Math.floor((s.y + 2) / TS);
  const ax = Math.floor(aheadX / TS);
  const blocked = world.solidAt(ax, bodyTy) === 1 || !world.solidAt(ax, footTy);
  if (blocked || nx < s.x0 || nx > s.x1) s.dir = -s.dir;
  else s.x = nx;
}

export function drawScorpion(ctx, s, camX, camY) {
  const x = Math.round(s.x) - 2 - camX, y = Math.round(s.y) - 1 - camY;
  if (x < -20 || x > 340) return;
  blit(ctx, (s.t >> 3) % 2 ? 'scorpionWalk' : 'scorpion', x, y, s.dir > 0 ? 1 : -1);
}

// ---- dust gusts ----
// Each zone cycles calm → warning (dust rising) → gust. During a gust, anyone in the zone
// who isn't riding a camel is pushed back (−x).
export const GUST = { calm: 170, warn: 45, gust: 95, push: 1.0 };

export function createGust([c0, c1], phase = 0) {
  return { x0: c0 * TS, x1: (c1 + 1) * TS, t: phase, state: 'calm', parts: [] };
}

export function updateGust(g, camX) {
  g.t++;
  const period = GUST.calm + GUST.warn + GUST.gust;
  const k = g.t % period;
  g.state = k < GUST.calm ? 'calm' : k < GUST.calm + GUST.warn ? 'warn' : 'gust';
  // particles (screen-relative streaks), only when the zone is on screen
  const visible = g.x1 > camX && g.x0 < camX + 320;
  if (visible && g.state !== 'calm') {
    const n = g.state === 'gust' ? 3 : 1;
    for (let i = 0; i < n; i++) {
      g.parts.push({ x: camX + 330 + Math.random() * 40, y: 40 + Math.random() * 150, v: g.state === 'gust' ? 3 + Math.random() * 2 : 1 + Math.random(), len: g.state === 'gust' ? 6 + Math.floor(Math.random() * 8) : 2, life: 160 });
    }
  }
  for (const p of g.parts) { p.x -= p.v; p.life--; }
  g.parts = g.parts.filter(p => p.life > 0 && p.x > camX - 20);
}

export function gustPush(g, body) {
  if (g.state !== 'gust' || body.standingOn) return 0;
  const cx = body.x + body.w / 2;
  return cx >= g.x0 && cx <= g.x1 ? -GUST.push : 0;
}

export function drawGust(ctx, g, camX, camY) {
  if (!g.parts.length) return;
  ctx.fillStyle = g.state === 'gust' ? 'rgba(229,190,130,0.75)' : 'rgba(229,190,130,0.45)';
  for (const p of g.parts) {
    if (p.x < g.x0 - 40 || p.x > g.x1 + 60) continue;
    ctx.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.len, 1);
  }
  if (g.state === 'gust' && g.x1 > camX && g.x0 < camX + 320) {
    ctx.fillStyle = 'rgba(214,170,110,0.16)';
    ctx.fillRect(Math.max(0, g.x0 - camX), 0, Math.min(320, g.x1 - camX) - Math.max(0, g.x0 - camX), 180);
  }
}

// ---- melon carts (Baghdad) ----
// An upset cart rolls a melon toward the traveller every `period` frames while on screen.

export function createCart(tx, ty, opts = {}) {
  return { kind: 'cart', x: tx * TS, y: (ty + 1) * TS - 14, w: 16, h: 14, t: opts.phase ?? 40, period: opts.period || 140, dir: opts.dir || -1, speed: opts.speed || 1.15, solid: false };
}

export function updateCart(c, level) {
  c.t++;
  const onScreen = c.x > level.cam.x - 40 && c.x < level.cam.x + 360;
  if (onScreen && c.t % c.period === 0) {
    level.hazards.push({ kind: 'melon', x: c.x + (c.dir < 0 ? -6 : 14), y: c.y + 2, w: 8, h: 8, vx: c.dir * c.speed, vy: -1, rot: 0, dead: false });
    level.sfx('roll');
  }
}

export function updateMelon(m, level) {
  const world = level.world;
  m.vy = Math.min(m.vy + 0.25, 4);
  moveX(m, m.vx, world);
  if (m.hitWall) { m.dead = true; level.burst(m.x + 4, m.y + 4, ['#3f7a3a', '#7fb069', '#d2453a', '#f6a393']); level.sfx('splat'); return; }
  moveY(m, m.vy, world);
  if (m.landed) m.vy = 0;
  m.rot += m.vx * 0.18;
  if (world.waterAt(m.x + 4, m.y + 6)) { m.dead = true; level.burst(m.x + 4, m.y + 2, ['#9fd0c8', '#f3ead2']); }
  if (m.y > world.pxH || m.x < -20 || m.x > world.pxW + 20) m.dead = true;
}

export function drawMelon(ctx, m, camX, camY) {
  const x = Math.round(m.x) - camX, y = Math.round(m.y) - camY;
  if (x < -10 || x > 330) return;
  const q = ((Math.floor(-m.rot / (Math.PI / 2)) % 4) + 4) % 4;
  ctx.save();
  ctx.translate(x + 4, y + 4);
  ctx.rotate(q * Math.PI / 2);
  blit(ctx, 'melon', -4, -4);
  ctx.restore();
}

export function drawCart(ctx, c, camX, camY) {
  const x = Math.round(c.x) - camX, y = Math.round(c.y) - camY;
  if (x < -24 || x > 340) return;
  const R = (a, b, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x + a, y + b, w, h); };
  // tipped cart: sloping bed, one wheel, a heap of melons
  R(1, 7, 15, 2, '#7a5232'); R(0, 6, 3, 2, '#7a5232'); R(2, 9, 12, 1, '#4a2e1a');
  R(11, 9, 5, 5, '#4a2e1a'); R(12, 10, 3, 3, '#a06c42'); R(13, 11, 1, 1, '#4a2e1a');
  R(-2, 8, 4, 1, '#5c4026');
  R(3, 2, 5, 5, '#3f7a3a'); R(8, 1, 5, 6, '#3f7a3a'); R(5, 0, 4, 3, '#2a5a2a'); R(4, 3, 1, 1, '#7fb069'); R(9, 2, 1, 1, '#7fb069');
}

// ---- palace guards (Cairo, Qayrawan, Córdoba) ----
// Patrol back and forth; touching one means knockback and a heart, never death.
export function createGuard(tx, ty, opts = {}) {
  const x = tx * TS + 4, y = (ty + 1) * TS - 14;
  const range = opts.range ?? 56;
  return { kind: 'guard', sprite: opts.sprite || 'guardWhite', x, y, w: 8, h: 14, dir: opts.dir || -1, speed: opts.speed || 0.45, x0: x - range, x1: x + range, t: (tx * 7) % 30 };
}

export function updateGuard(g, world) {
  g.t++;
  const nx = g.x + g.dir * g.speed;
  const ax = Math.floor((g.dir > 0 ? nx + g.w + 1 : nx - 1) / TS);
  const footTy = Math.floor((g.y + g.h + 2) / TS), bodyTy = Math.floor((g.y + 4) / TS);
  const blocked = world.solidAt(ax, bodyTy) === 1 || !world.solidAt(ax, footTy);
  if (blocked || nx < g.x0 || nx > g.x1) g.dir = -g.dir;
  else g.x = nx;
}

export function drawGuard(ctx, g, camX, camY) {
  const x = Math.round(g.x) - 2 - camX, y = Math.round(g.y) - 2 - camY;
  if (x < -20 || x > 340) return;
  blit(ctx, (g.t >> 4) % 2 ? g.sprite + 'Walk' : g.sprite, x, y, g.dir > 0 ? 1 : -1);
}

// ---- chasers (Córdoba): Umayyad guards who recognise the Fatimid robe ----
// Slightly slower than the traveller; they hop walls and gaps and never fall far behind.
export function createChaser(x, y, sprite) {
  return { kind: 'chaser', sprite: sprite || 'guardRed', x, y, w: 8, h: 14, vx: 0, vy: 0, onGround: false, dir: 1, t: 0 };
}

export function updateChaser(c, level) {
  const p = level.player, world = level.world;
  c.t++;
  const dir = p.x > c.x ? 1 : -1;
  c.dir = dir;
  c.vx = Math.max(-1.3, Math.min(1.3, c.vx + dir * 0.08));
  c.vy = Math.min(c.vy + 0.24, 4.2);
  moveX(c, c.vx, world);
  if (c.hitWall && c.onGround) { c.vy = -4.6; c.onGround = false; }
  moveY(c, c.vy, world);
  if (c.landed) { c.vy = 0; c.onGround = true; } else c.onGround = false;
  if (c.onGround) {
    const ahead = Math.floor((c.x + (dir > 0 ? c.w + 6 : -6)) / TS), foot = Math.floor((c.y + c.h + 2) / TS);
    if (!world.solidAt(ahead, foot)) { c.vy = -4.6; c.onGround = false; }
  }
  if (c.x < p.x - 220) { c.x = p.x - 220; c.y = Math.min(c.y, p.y); }
  if (c.y > world.pxH) { c.x = p.x - 200; c.y = p.y - 40; c.vy = 0; }
}

export function drawChaser(ctx, c, camX, camY) {
  const x = Math.round(c.x) - 2 - camX, y = Math.round(c.y) - 2 - camY;
  if (x < -20 || x > 340) return;
  const run = c.onGround && (c.t >> 3) % 2;
  blit(ctx, run || !c.onGround ? c.sprite + 'Walk' : c.sprite, x, y, c.dir);
}
