// A playable level: world + traveller + entities, camera, checkpoints, pits, fainting.
import { W, H } from '../engine/screen.js';
import { TS, overlap } from '../engine/physics.js';
import { createCamera, followCamera } from '../engine/camera.js';
import { buildWorld } from './world.js';
import { createPlayer, updatePlayer, hurtPlayer, drawPlayer } from './player.js';
import { createPlatform, updatePlatform, drawPlatform, carry, landOnPlatforms } from './platforms.js';
import { createScorpion, updateScorpion, drawScorpion, createGust, updateGust, gustPush, drawGust, createCart, updateCart, updateMelon, drawMelon, drawCart, createGuard, updateGuard, drawGuard, createChaser, updateChaser, drawChaser } from './hazards.js';
import { drawDecor } from '../art/decor.js';
import { drawText, measureText } from '../art/font.js';
import { createItem, updateItem, drawItem, itemHitbox, createSign, drawSign } from './items.js';
import { createTileset } from '../art/tiles.js';
import { buildParallax, drawParallax } from '../art/layers.js';
import { drawHearts, drawBox, drawInventory } from '../ui/hud.js';
import { getSprite, blit } from '../art/sprites.js';
import { wrapText } from '../art/font.js';

const PLATFORM_KIND = { C: 'camel', G: 'guffa', F: 'felucca' };

// def: level file (map, theme, signs, zones…); info: the matching gameData level entry.
export function createLevel(game, def, opts = {}) {
  const info = opts.info || {};
  const flags = { ...(opts.flags || {}) };
  const world = buildWorld(def.map, flags);
  const tiles = createTileset(def.theme);
  const maxHearts = opts.maxHearts || 3;

  const start = world.find('P')[0] || { tx: 2, ty: world.rows - 3 };
  const spawnAt = s => ({ x: s.tx * TS + 4, y: (s.ty + 1) * TS - 14 });
  const player = createPlayer(0, 0, maxHearts);
  const L = {
    def, info, world, tiles, player, flags, t: 0,
    plats: [], checkpoints: [], hazards: [], gusts: [], signs: [], items: [], particles: [],
    respawn: spawnAt(start),
    cam: createCamera(world.pxW, world.pxH),
    toast: null, fade: null, signText: null, windX: 0, done: false,
    sfx: name => game.sfx && game.sfx(name),
  };
  Object.assign(player, L.respawn);
  if (opts.checkpoint) { L.respawn = { ...opts.checkpoint }; Object.assign(player, L.respawn); }

  let pi = 0, si = 0, hi = 0;
  for (const s of world.spawns) {
    if (PLATFORM_KIND[s.ch]) L.plats.push(createPlatform(PLATFORM_KIND[s.ch], s.tx, s.ty, (def.platforms || [])[pi++] || {}));
    else if (s.ch === 'K') L.checkpoints.push({ x: s.tx * TS + 4, y: (s.ty - 1) * TS, w: 8, h: 32, tx: s.tx, ty: s.ty, on: false, raise: 0 });
    else if (s.ch === 'S') L.hazards.push(createScorpion(s.tx, s.ty, (def.hazards || [])[hi++] || {}));
    else if (s.ch === 'M') L.hazards.push(createCart(s.tx, s.ty, (def.carts || [])[L.hazards.filter(h => h.kind === 'cart').length] || {}));
    else if (s.ch === 'W') L.hazards.push(createGuard(s.tx, s.ty, { sprite: def.guardSprite, ...((def.guards || [])[L.hazards.filter(h => h.kind === 'guard').length] || {}) }));
    else if (s.ch === '?') { const t = (def.signs || [])[si++]; L.signs.push(createSign(s.tx, s.ty, t && typeof t === 'object' ? (flags[t.flag] ? t.yes : t.no) : t)); }
    else if (s.ch === 'I' && opts.item) L.items.push(createItem(s.tx, s.ty, opts.item));
  }
  (def.gusts || []).forEach((z, i) => L.gusts.push(createGust(z, i * 97)));

  // Fatimid gates: connected groups of D tiles. They open only for the Robe of Honor.
  L.gates = [];
  const seenD = new Set();
  for (let y = 0; y < world.rows; y++) for (let x = 0; x < world.cols; x++) {
    if (world.grid[y][x] !== 'D' || seenD.has(x + ',' + y)) continue;
    const tiles = [], stack = [[x, y]];
    while (stack.length) {
      const [a, b] = stack.pop(), k = a + ',' + b;
      if (seenD.has(k) || world.tileAt(a, b) !== 'D') continue;
      seenD.add(k); tiles.push([a, b]);
      stack.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
    }
    const xs = tiles.map(t => t[0]), ys = tiles.map(t => t[1]);
    L.gates.push({ tiles: tiles.sort((p, q) => p[1] - q[1]), x0: Math.min(...xs) * TS, x1: (Math.max(...xs) + 1) * TS, y0: Math.min(...ys) * TS, y1: (Math.max(...ys) + 1) * TS, open: false, t: 0, warned: -999 });
  }
  followCamera(L.cam, player, true, true);

  L.burst = (x, y, colors, n = 10) => {
    for (let i = 0; i < n; i++) L.particles.push({ x, y, vx: (Math.random() - 0.5) * 2.4, vy: -Math.random() * 2.2, life: 18 + Math.floor(Math.random() * 12), c: colors[i % colors.length] });
  };

  L.say = (text, frames = 150) => { L.toast = { lines: [].concat(text).flatMap(t => wrapText(t, 280)), t: frames }; };
  L.intro = info.name ? { t: 0, len: 240 } : null;

  L.respawnPlayer = (full) => {
    Object.assign(player, L.respawn, { vx: 0, vy: 0, standingOn: null, knockT: 0, invuln: 60, frozen: false });
    if (L.chase && def.chase && player.x < def.chase.start * TS) { L.chase = null; L.hazards = L.hazards.filter(h => h.kind !== 'chaser'); }
    if (full) player.hearts = player.maxHearts;
    followCamera(L.cam, player, true, true);
  };

  L.damage = (fromX) => {
    if (hurtPlayer(player, fromX)) { L.sfx('hurt'); return true; }
    return false;
  };

  L.update = () => {
    const input = game.input;
    L.t++;
    if (L.toast && --L.toast.t <= 0) L.toast = null;
    if (L.intro && ++L.intro.t > L.intro.len) L.intro = null;
    if (L.done) return;
    if (L.pickup) {
      const pk = L.pickup;
      pk.t++;
      pk.burst.forEach(b => { b.r += Math.max(0.3, 2.4 - pk.t * 0.06); });
      if (pk.t === 45) {
        L.done = true;
        if (opts.onItem) opts.onItem(pk.it.item, L);
        else L.say(['Found: ' + pk.it.item.title], 600);
      }
      return;
    }

    // fainting / respawn fade
    if (L.fade) {
      L.fade.t++;
      if (L.fade.phase === 'out' && L.fade.t >= L.fade.len) {
        L.respawnPlayer(L.fade.full);
        if (L.fade.full) L.say(['The traveller rests, then sets out again.']);
        L.fade = { phase: 'in', t: 0, len: 24 };
      } else if (L.fade.phase === 'in' && L.fade.t >= L.fade.len) L.fade = null;
      if (L.fade && L.fade.phase === 'out') return;
    }

    for (const p of L.plats) updatePlatform(p);
    for (const g of L.gusts) updateGust(g, L.cam.x);
    carry(player, world);
    L.windX = L.gusts.reduce((a, g) => a + gustPush(g, player), 0);
    const bottomBefore = player.y + player.h;
    updatePlayer(player, input, world, { sfx: L.sfx, windX: L.windX, currentX: def.current || 0 });
    player.standingOn = null;
    landOnPlatforms(player, L.plats, bottomBefore);

    for (const h of L.hazards) {
      if (h.kind === 'scorpion') updateScorpion(h, world);
      else if (h.kind === 'guard') updateGuard(h, world);
      else if (h.kind === 'chaser') updateChaser(h, L);
      else if (h.kind === 'cart') { updateCart(h, L); continue; }
      else if (h.kind === 'melon') updateMelon(h, L);
      if (!h.dead && !player.frozen && overlap(player, h)) L.damage(h.x + h.w / 2);
    }
    if (L.hazards.some(h => h.dead)) L.hazards = L.hazards.filter(h => !h.dead);

    for (const g of L.gates) {
      const near = player.x + player.w > g.x0 - 28 && player.x < g.x1 + 28 && player.y + player.h > g.y0 && player.y < g.y1;
      if (!g.open && near) {
        if (flags.robe) { g.open = true; g.t = 0; L.say('The gatekeeper sees the Robe of Honor and opens the Fatimid gate.'); L.sfx('gate'); }
        else if (L.t - g.warned > 240) { g.warned = L.t; L.say('The gate stays shut. Only guests wearing the caliph’s robe of honor may pass.'); L.sfx('deny'); }
      }
      if (g.open && g.t < g.tiles.length * 3) {
        g.t++;
        const n = Math.floor(g.t / 3);
        for (let i = 0; i < n; i++) world.openGates.add(g.tiles[g.tiles.length - 1 - i].join(','));
        if (g.t >= g.tiles.length * 3) g.tiles.forEach(t => world.openGates.add(t.join(',')));
      }
    }

    // Crumbling stones: start shaking when stood on, fall away, come back later.
    if (player.onGround && !player.standingOn) {
      const ty = Math.floor((player.y + player.h + 1) / TS);
      for (const tx of [Math.floor(player.x / TS), Math.floor((player.x + player.w - 0.01) / TS)]) {
        const k = tx + ',' + ty;
        if (world.tileAt(tx, ty) === '%' && !world.crumble.has(k)) { world.crumble.set(k, { state: 'shake', t: 0 }); L.sfx('crack'); }
      }
    }
    for (const [k, c] of world.crumble) {
      c.t++;
      if (c.state === 'shake' && c.t >= 22) {
        c.state = 'gone'; c.t = 0;
        const [tx, ty] = k.split(',').map(Number);
        L.burst(tx * TS + 8, ty * TS + 4, [tiles.theme.brick.fill, tiles.theme.brick.hi, tiles.theme.brick.mortar], 12);
      } else if (c.state === 'gone' && c.t >= 200) {
        const [tx, ty] = k.split(',').map(Number);
        if (!overlap(player, { x: tx * TS, y: ty * TS - 2, w: TS, h: TS + 2 })) world.crumble.delete(k);
      }
    }
    for (const q of L.particles) { q.x += q.vx; q.y += q.vy; q.vy += 0.15; q.life--; }
    if (L.particles.length) L.particles = L.particles.filter(q => q.life > 0);

    for (const k of L.checkpoints) {
      if (k.raise < 20 && k.on) k.raise++;
      if (!k.on && overlap(player, k)) {
        k.on = true;
        L.respawn = { x: k.x, y: (k.ty + 1) * TS - 14 };
        L.say(def.checkpointText && def.checkpointText[k.tx] ? def.checkpointText[k.tx] : 'Checkpoint');
        L.sfx('checkpoint');
        if (opts.onCheckpoint) opts.onCheckpoint(L.respawn);
      }
    }

    // Córdoba: guards recognise the Fatimid Robe of Honor and give chase.
    if (def.chase && flags.robe) {
      const ch = def.chase;
      if (!L.chase && player.x > ch.start * TS && player.x < ch.end * TS) {
        L.chase = { on: true };
        for (let i = 0; i < (ch.count || 2); i++) L.hazards.push(createChaser(L.cam.x - 24 - i * 22, player.y, def.guardSprite));
        L.say('Umayyad guards recognise the Fatimid robe of a rival caliph. Run!', 200);
        L.sfx('alarm');
      } else if (L.chase && L.chase.on && player.x > ch.end * TS) {
        L.chase.on = false;
        L.hazards.forEach(h => { if (h.kind === 'chaser') L.burst(h.x + 4, h.y + 6, ['#b3261e', '#f3ead2'], 6); });
        L.hazards = L.hazards.filter(h => h.kind !== 'chaser');
        L.say('The guards lose sight of you in the dark hall.');
      }
    }

    // Dark halls: without Gold Light the traveller won't go in.
    for (const [c0] of def.dark || []) {
      const x0 = c0 * TS;
      if (!flags.light && player.x + player.w > x0 && player.x < x0 + 12) {
        player.x = x0 - player.w; player.vx = 0;
        if (L.t - (L.darkWarned || -999) > 240) { L.darkWarned = L.t; L.say('Pitch dark inside. You would need a light to find your way.'); }
      }
    }

    L.signText = null;
    for (const s of L.signs) if (s.text && overlap(player, { x: s.x - 6, y: s.y - 8, w: s.w + 12, h: s.h + 8 })) L.signText = s.text;

    for (const it of L.items) {
      updateItem(it);
      if (!it.taken && overlap(player, itemHitbox(it))) {
        // freeze, chime, sparkle burst; the museum card follows (see L.update's pickup branch)
        it.taken = true;
        player.frozen = true;
        L.pickup = { t: 0, it, burst: Array.from({ length: 28 }, (_, i) => ({ a: (i / 28) * Math.PI * 2, r: 0 })) };
        L.sfx('pickup');
      }
    }

    // fell out of the world
    if (player.y > world.pxH + 24 && !L.fade) {
      player.hearts = Math.max(0, player.hearts - 1);
      L.sfx('hurt');
      L.fade = { phase: 'out', t: 0, len: player.hearts > 0 ? 18 : 50, full: player.hearts === 0 };
      player.frozen = true;
    }
    if (player.hearts <= 0 && !L.fade) {
      L.fade = { phase: 'out', t: 0, len: 50, full: true };
      player.frozen = true;
    }

    followCamera(L.cam, player, player.onGround);
  };

  L.drawCheckpoint = (ctx, k) => {
    const x = k.x + 3 - L.cam.x, y = k.y - L.cam.y;
    if (x < -20 || x > W + 20) return;
    ctx.fillStyle = '#7a6a52'; ctx.fillRect(x - 3, y + 29, 8, 3);
    ctx.fillStyle = '#3a2a20'; ctx.fillRect(x, y + 2, 2, 28);
    ctx.fillStyle = '#e8c45a'; ctx.fillRect(x, y + 1, 2, 1);
    const fy = k.on ? y + 3 + Math.round((20 - k.raise) * 1.1) : y + 22;
    const col = info.banner || def.banner || '#141018';
    ctx.fillStyle = col; ctx.fillRect(x + 2, fy, 8, 5); ctx.fillRect(x + 2, fy + 5, 5, 1);
    if (col.toLowerCase() === '#ffffff') { ctx.fillStyle = '#cfc8b8'; ctx.fillRect(x + 2, fy + 4, 8, 1); }
    if (col.toLowerCase() === '#141018') { ctx.fillStyle = '#3a3240'; ctx.fillRect(x + 2, fy, 8, 1); }
  };

  L.setBackdrop = name => { L.parallax = name ? buildParallax(name) : null; };
  L.setBackdrop(info.backdrop || def.backdrop);

  L.drawBackground = (ctx) => {
    if (L.parallax) {
      const baseY = Math.max(0, world.pxH - H);
      const groundRow = def.groundRow ?? world.rows - 2;
      drawParallax(ctx, L.parallax, L.cam.x, L.cam.y, baseY, Math.min(0, groundRow * TS - baseY - 150));
      return;
    }
    ctx.fillStyle = (def.theme && def.theme.sky) || '#2a1f3d';
    ctx.fillRect(0, 0, W, H);
  };

  // Labels pinned to a landmark in the far layer (which repeats every 320 px at 0.2×).
  L.drawFarLabels = (ctx) => {
    for (const lb of def.farLabels || []) {
      const o = Math.floor(L.cam.x * 0.2) % 320;
      for (let k = -1; k <= 1; k++) {
        const x = lb.x - o + k * 320;
        if (x < 30 || x > 290) continue;
        const w = measureText(lb.text) + 4;
        const lx = Math.round(Math.max(2, Math.min(318 - w, x - w / 2)));
        ctx.fillStyle = 'rgba(20,16,24,0.72)'; ctx.fillRect(lx, lb.y, w, 9);
        ctx.fillStyle = 'rgba(243,234,210,0.6)'; ctx.fillRect(Math.round(x), lb.y - 3, 1, 3);
        drawText(ctx, lb.text, lx + 2, lb.y + 2, { color: '#f3ead2' });
      }
    }
  };

  // Darkness over dark-hall zones, drawn at half resolution so the light has chunky pixel rings.
  const darkCv = document.createElement('canvas'); darkCv.width = W / 2; darkCv.height = H / 2;
  const dk = darkCv.getContext('2d');
  L.drawDark = (ctx) => {
    if (!def.dark) return;
    let any = false;
    dk.clearRect(0, 0, W / 2, H / 2);
    for (const [c0, c1] of def.dark) {
      const x0 = c0 * TS - L.cam.x, x1 = (c1 + 1) * TS - L.cam.x;
      if (x1 < 0 || x0 > W) continue;
      any = true;
      dk.fillStyle = 'rgba(4,3,8,0.97)';
      dk.fillRect(Math.floor(x0 / 2), 0, Math.ceil((x1 - x0) / 2), H / 2);
      // soften the doorway edges
      dk.fillStyle = 'rgba(4,3,8,0.5)';
      dk.fillRect(Math.floor(x0 / 2) - 6, 0, 6, H / 2); dk.fillRect(Math.ceil(x1 / 2), 0, 6, H / 2);
    }
    if (!any) return;
    if (flags.light) {
      const px = (player.x + player.w / 2 - L.cam.x) / 2, py = (player.y + 6 - L.cam.y) / 2;
      const flick = Math.round(Math.sin(L.t / 9) * 0.8);
      dk.globalCompositeOperation = 'destination-out';
      [[36, 0.35], [30, 0.6], [24, 0.85], [18, 1]].forEach(([r, a]) => {
        dk.fillStyle = `rgba(0,0,0,${a})`;
        dk.beginPath(); dk.arc(Math.round(px), Math.round(py), r + flick, 0, Math.PI * 2); dk.fill();
      });
      dk.globalCompositeOperation = 'source-over';
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(darkCv, 0, 0, W, H);
    if (flags.light) {
      const px = Math.round(player.x + player.w / 2 - L.cam.x), py = Math.round(player.y + 6 - L.cam.y);
      ctx.fillStyle = 'rgba(232,196,90,0.07)';
      ctx.fillRect(px - 40, py - 30, 80, 60);
    }
  };

  L.drawIntro = (ctx) => {
    const k = L.intro.t, len = L.intro.len;
    const slide = Math.min(1, k / 20, (len - k) / 20);
    const y = Math.round(-40 + slide * 52);
    const lines = [info.name, info.power];
    const box = drawBox(ctx, lines, W / 2, y, { color: '#e8c45a', color2: '#f3ead2', pad: 5 });
    ctx.fillStyle = info.banner || '#141018';
    ctx.fillRect(box.x + 4, box.y + 4, 4, 6);
    ctx.fillStyle = '#3a2a20'; ctx.fillRect(box.x + 3, box.y + 4, 1, 9);
  };

  L.render = (ctx) => {
    const cx = L.cam.x, cy = L.cam.y;
    L.drawBackground(ctx);
    L.drawFarLabels(ctx);
    drawDecor(ctx, def.decor, cx, cy, L.t);
    tiles.drawTiles(ctx, world, cx, cy, L.t);
    drawDecor(ctx, def.decor, cx, cy, L.t, true);
    for (const s of L.signs) drawSign(ctx, s, cx, cy);
    if (def.gatekeepers) for (const g of L.gates) {
      const gx = g.x0 - 18 - cx, gy = g.y1 - 16 - cy;
      if (gx > -20 && gx < W + 20) blit(ctx, 'guardWhite', gx, gy, 1);
    }
    for (const k of L.checkpoints) L.drawCheckpoint(ctx, k);
    for (const it of L.items) drawItem(ctx, it, cx, cy);
    for (const p of L.plats) drawPlatform(ctx, p, cx, cy);
    for (const h of L.hazards) {
      if (h.kind === 'scorpion') drawScorpion(ctx, h, cx, cy);
      else if (h.kind === 'guard') drawGuard(ctx, h, cx, cy);
      else if (h.kind === 'chaser') drawChaser(ctx, h, cx, cy);
      else if (h.kind === 'cart') drawCart(ctx, h, cx, cy);
      else if (h.kind === 'melon') drawMelon(ctx, h, cx, cy);
    }
    for (const q of L.particles) { ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x) - cx, Math.round(q.y) - cy, 1, 1); }
    drawPlayer(ctx, player, cx, cy);
    if (L.pickup) {
      const it = L.pickup.it, ox = it.x + it.w / 2 - cx, oy = it.y + it.h / 2 - cy;
      const lift = Math.min(18, L.pickup.t * 0.8);
      ctx.fillStyle = 'rgba(232,196,90,0.25)';
      ctx.fillRect(Math.round(ox - it.w / 2 - 4), Math.round(oy - it.h / 2 - lift - 4), it.w + 8, it.h + 8);
      ctx.drawImage(getSprite(it.sprite).img, Math.round(ox - it.w / 2), Math.round(oy - it.h / 2 - lift));
      for (const b of L.pickup.burst) {
        ctx.fillStyle = L.pickup.t % 6 < 3 ? '#fff6c8' : '#e8c45a';
        ctx.fillRect(Math.round(ox + Math.cos(b.a) * b.r), Math.round(oy - lift + Math.sin(b.a) * b.r), 1, 1);
      }
    }
    tiles.drawWater(ctx, world, cx, cy, L.t);
    for (const g of L.gusts) drawGust(ctx, g, cx, cy);
    L.drawDark(ctx);
    drawHearts(ctx, player);
    if (opts.inventory) drawInventory(ctx, opts.inventory);
    if (L.signText) {
      const lines = wrapText(L.signText, 230);
      drawBox(ctx, lines, W / 2, 18, { bg: 'rgba(233,215,168,0.95)', border: '#6b4a2b', color: '#2a1f18' });
    }
    if (L.intro) L.drawIntro(ctx);
    if (L.toast) drawBox(ctx, L.toast.lines, W / 2, H - 26);
    if (L.fade) {
      const a = L.fade.phase === 'out' ? L.fade.t / L.fade.len : 1 - L.fade.t / L.fade.len;
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, a)).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
  };

  L.debugLines = () => {
    const p = player;
    return [
      `P ${p.x.toFixed(1)},${p.y.toFixed(1)} T ${Math.floor((p.x + 4) / TS)},${Math.floor((p.y + 13) / TS)} V ${p.vx.toFixed(2)},${p.vy.toFixed(2)} ${p.onGround ? (p.standingOn ? 'RIDING' : 'GROUND') : p.inWater ? 'SWIM' : 'AIR'}`,
      `CAM ${L.cam.x},${L.cam.y} MAP ${world.pxW}X${world.pxH}  HEARTS ${p.hearts}/${p.maxHearts}  WIND ${L.windX}`,
    ];
  };

  return L;
}

