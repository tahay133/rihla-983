// A playable level: world + traveller + entities, camera, checkpoints, pits, fainting.
import { W, H } from '../engine/screen.js';
import { TS, overlap } from '../engine/physics.js';
import { createCamera, followCamera } from '../engine/camera.js';
import { buildWorld } from './world.js';
import { createPlayer, updatePlayer, hurtPlayer, drawPlayer } from './player.js';
import { createPlatform, updatePlatform, drawPlatform, carry, landOnPlatforms } from './platforms.js';
import { createScorpion, updateScorpion, drawScorpion, createGust, updateGust, gustPush, drawGust } from './hazards.js';
import { createItem, updateItem, drawItem, itemHitbox, createSign, drawSign } from './items.js';
import { createTileset } from '../art/tiles.js';
import { buildParallax, drawParallax } from '../art/layers.js';
import { drawHearts, drawBox } from '../ui/hud.js';
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
    plats: [], checkpoints: [], hazards: [], gusts: [], signs: [], items: [],
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
    else if (s.ch === '?') L.signs.push(createSign(s.tx, s.ty, (def.signs || [])[si++]));
    else if (s.ch === 'I' && opts.item) L.items.push(createItem(s.tx, s.ty, opts.item));
  }
  (def.gusts || []).forEach((z, i) => L.gusts.push(createGust(z, i * 97)));
  followCamera(L.cam, player, true, true);

  L.say = (text, frames = 150) => { L.toast = { lines: [].concat(text).flatMap(t => wrapText(t, 280)), t: frames }; };
  L.intro = info.name ? { t: 0, len: 240 } : null;

  L.respawnPlayer = (full) => {
    Object.assign(player, L.respawn, { vx: 0, vy: 0, standingOn: null, knockT: 0, invuln: 60, frozen: false });
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
      if (!player.frozen && overlap(player, h)) L.damage(h.x + h.w / 2);
    }

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

    L.signText = null;
    for (const s of L.signs) if (s.text && overlap(player, { x: s.x - 6, y: s.y - 8, w: s.w + 12, h: s.h + 8 })) L.signText = s.text;

    for (const it of L.items) {
      updateItem(it);
      if (!it.taken && overlap(player, itemHitbox(it))) {
        it.taken = true;
        L.done = true;
        player.frozen = true;
        if (opts.onItem) opts.onItem(it.item, L);
        else L.say(['Found: ' + it.item.title], 600);
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
    tiles.drawTiles(ctx, world, cx, cy, L.t);
    for (const s of L.signs) drawSign(ctx, s, cx, cy);
    for (const k of L.checkpoints) L.drawCheckpoint(ctx, k);
    for (const it of L.items) drawItem(ctx, it, cx, cy);
    for (const p of L.plats) drawPlatform(ctx, p, cx, cy);
    for (const h of L.hazards) if (h.kind === 'scorpion') drawScorpion(ctx, h, cx, cy);
    drawPlayer(ctx, player, cx, cy);
    tiles.drawWater(ctx, world, cx, cy, L.t);
    for (const g of L.gusts) drawGust(ctx, g, cx, cy);
    drawHearts(ctx, player);
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

