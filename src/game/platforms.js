// Moving platforms the traveller can ride: camels (caravan), guffa boats (Tigris),
// feluccas (Nile). All are one-way from above and carry whoever stands on them.
import { TS, moveX } from '../engine/physics.js';
import { blit } from '../art/sprites.js';

const KINDS = {
  // surface: offset/width of the walkable top within the sprite (facing right)
  camel:   { w: 32, h: 20, sx: 6, sy: 4, sw: 16, speed: 0.4, range: 96, pause: 40 },
  guffa:   { w: 32, h: 7, sx: 1, sy: 1, sw: 30, speed: 0.5, range: 112, pause: 30, bob: 1 },
  felucca: { w: 44, h: 36, sx: 2, sy: 30, sw: 40, speed: 0.8, back: 0.45, range: 160, pause: 50, bob: 1 },
};

export function createPlatform(kind, tx, ty, opts = {}) {
  const k = { ...KINDS[kind], ...opts };
  const p = { kind, ...k, t: 0, dir: opts.dir || 1, wait: 0, dx: 0, dy: 0, facing: opts.dir || 1 };
  if (kind === 'camel') { p.x = tx * TS; p.y = (ty + 1) * TS - k.h; }
  else if (kind === 'guffa') { p.x = tx * TS; p.y = ty * TS - 2; }
  else { p.x = tx * TS; p.y = ty * TS - 31; }
  p.x0 = p.dir > 0 ? p.x : p.x - k.range;
  p.x1 = p.x0 + k.range;
  p.baseY = p.y;
  p.phase = (tx * 37) % 100;
  return p;
}

export function surface(p) {
  const sx = p.facing > 0 ? p.sx : p.w - p.sx - p.sw;
  return { x: p.x + sx, y: p.y + p.sy, w: p.sw };
}

export function updatePlatform(p) {
  const ox = p.x, oy = p.y;
  p.t++;
  if (p.wait > 0) p.wait--;
  else {
    const sp = p.dir > 0 ? p.speed : (p.back || p.speed);
    p.x += p.dir * sp;
    if (p.x >= p.x1) { p.x = p.x1; p.dir = -1; p.wait = p.pause; }
    else if (p.x <= p.x0) { p.x = p.x0; p.dir = 1; p.wait = p.pause; }
    if (p.kind === 'camel') p.facing = p.dir;
  }
  if (p.bob) p.y = p.baseY + Math.round(Math.sin((p.t + p.phase) / 22) * p.bob);
  p.dx = p.x - ox;
  p.dy = p.y - oy;
}

// Carry a rider that was standing on a platform last frame.
export function carry(body, world) {
  const s = body.standingOn;
  if (!s) return;
  moveX(body, s.dx, world);
  body.y = surface(s).y - body.h;
}

// After the body has moved, land it on any platform it fell onto.
export function landOnPlatforms(body, plats, bottomBefore) {
  if (body.vy < 0 || body.dropT > 0) return null;
  for (const s of plats) {
    const r = surface(s);
    if (body.x + body.w > r.x && body.x < r.x + r.w && bottomBefore <= r.y + 0.5 + Math.max(0, s.dy) && body.y + body.h >= r.y) {
      body.y = r.y - body.h;
      body.vy = 0;
      body.onGround = true;
      body.onOneWay = true;
      body.standingOn = s;
      return s;
    }
  }
  return null;
}

let feluccaCache = null;
function feluccaSprite() {
  if (feluccaCache) return feluccaCache;
  const mk = flip => {
    const c = document.createElement('canvas'); c.width = 44; c.height = 36;
    const x = c.getContext('2d');
    const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    // lateen sail: a long yard slanting from low-front to high-back, sail hanging below it
    for (let i = 0; i < 26; i++) {
      const yy = 2 + i;
      const left = 22 - Math.floor(i * 0.62), right = 22 + Math.floor(i * 0.5);
      R(left, yy, Math.max(1, right - left), 1, i % 7 === 6 ? '#e3dccb' : '#f6f0e2');
    }
    for (let i = 0; i < 30; i++) R(30 - i, 1 + Math.floor(i * 0.9), 1, 1, '#6b4a2b'); // yard
    R(22, 4, 1, 26, '#4a2c1c');                                                       // mast
    // hull
    R(2, 30, 40, 2, '#6b4a2b'); R(0, 29, 3, 2, '#6b4a2b'); R(41, 28, 3, 3, '#6b4a2b');
    R(3, 32, 38, 2, '#4a2c1c'); R(6, 34, 32, 2, '#3a2214');
    R(4, 30, 36, 1, '#8a6238');
    if (flip) { const f = document.createElement('canvas'); f.width = 44; f.height = 36; const g = f.getContext('2d'); g.translate(44, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return f; }
    return c;
  };
  feluccaCache = { r: mk(false), l: mk(true) };
  return feluccaCache;
}

export function drawPlatform(ctx, p, camX, camY) {
  const x = Math.round(p.x) - camX, y = Math.round(p.y) - camY;
  if (x > 340 || x < -60) return;
  if (p.kind === 'camel') {
    const walking = p.wait === 0;
    blit(ctx, walking && (p.t >> 4) % 2 ? 'camelWalk' : 'camel', x, y, p.facing);
  } else if (p.kind === 'guffa') {
    blit(ctx, 'guffa', x, y);
  } else {
    const s = feluccaSprite();
    ctx.drawImage(p.dir > 0 ? s.r : s.l, x, y);
  }
}
