// Hazards: scorpions (patrol the sand) and dust gusts (zones that push the traveller back).
// Touching a hazard costs one heart with knockback; nothing here can kill permanently.
import { TS } from '../engine/physics.js';
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
