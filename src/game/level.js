// A playable level: world + traveller + entities, camera, checkpoints, pits, fainting.
import { W, H } from '../engine/screen.js';
import { TS, overlap } from '../engine/physics.js';
import { createCamera, followCamera } from '../engine/camera.js';
import { buildWorld } from './world.js';
import { createPlayer, updatePlayer, hurtPlayer, drawPlayer } from './player.js';
import { createPlatform, updatePlatform, drawPlatform, carry, landOnPlatforms } from './platforms.js';
import { createTileset } from '../art/tiles.js';
import { drawHearts, drawBox } from '../ui/hud.js';

const PLATFORM_KIND = { C: 'camel', G: 'guffa', F: 'felucca' };

export function createLevel(game, def, opts = {}) {
  const flags = { ...(opts.flags || {}) };
  const world = buildWorld(def.map, flags);
  const tiles = createTileset(def.theme);
  const maxHearts = opts.maxHearts || 3;

  const start = world.find('P')[0] || { tx: 2, ty: world.rows - 3 };
  const spawnAt = s => ({ x: s.tx * TS + 4, y: (s.ty + 1) * TS - 14 });
  const player = createPlayer(0, 0, maxHearts);
  const L = {
    def, world, tiles, player, flags, t: 0,
    plats: [], checkpoints: [],
    respawn: spawnAt(start),
    cam: createCamera(world.pxW, world.pxH),
    toast: null, fade: null,
    sfx: name => game.sfx && game.sfx(name),
  };
  Object.assign(player, L.respawn);
  if (opts.checkpoint) { L.respawn = { ...opts.checkpoint }; Object.assign(player, L.respawn); }

  let pi = 0;
  for (const s of world.spawns) {
    if (PLATFORM_KIND[s.ch]) L.plats.push(createPlatform(PLATFORM_KIND[s.ch], s.tx, s.ty, (def.platforms || [])[pi++] || {}));
    else if (s.ch === 'K') L.checkpoints.push({ x: s.tx * TS + 4, y: (s.ty - 1) * TS, w: 8, h: 32, tx: s.tx, ty: s.ty, on: false, raise: 0 });
  }
  followCamera(L.cam, player, true, true);

  L.say = (text, frames = 150) => { L.toast = { lines: Array.isArray(text) ? text : [text], t: frames }; };

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
    carry(player, world);
    const bottomBefore = player.y + player.h;
    updatePlayer(player, input, world, { sfx: L.sfx, windX: L.windX || 0, currentX: def.current || 0 });
    player.standingOn = null;
    landOnPlatforms(player, L.plats, bottomBefore);

    for (const k of L.checkpoints) {
      if (k.raise < 20 && k.on) k.raise++;
      if (!k.on && overlap(player, k)) {
        k.on = true;
        L.respawn = { x: k.x, y: (k.ty + 1) * TS - 14 };
        L.say(def.checkpointText && def.checkpointText[k.tx] ? def.checkpointText[k.tx] : 'Checkpoint');
        L.sfx('checkpoint');
        if (game.onCheckpoint) game.onCheckpoint(L.respawn);
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
    const col = def.banner || '#141018';
    ctx.fillStyle = col; ctx.fillRect(x + 2, fy, 8, 5); ctx.fillRect(x + 2, fy + 5, 5, 1);
    if (col.toLowerCase() === '#ffffff' || col.toLowerCase() === '#141018') { ctx.fillStyle = col === '#ffffff' ? '#cfc8b8' : '#3a3240'; ctx.fillRect(x + 2, fy + 4, 8, 1); }
  };

  L.drawBackground = (ctx) => {
    ctx.fillStyle = (def.theme && def.theme.sky) || '#2a1f3d';
    ctx.fillRect(0, 0, W, H);
  };

  L.render = (ctx) => {
    const cx = L.cam.x, cy = L.cam.y;
    L.drawBackground(ctx);
    tiles.drawTiles(ctx, world, cx, cy, L.t);
    for (const k of L.checkpoints) L.drawCheckpoint(ctx, k);
    for (const p of L.plats) drawPlatform(ctx, p, cx, cy);
    drawPlayer(ctx, player, cx, cy);
    tiles.drawWater(ctx, world, cx, cy, L.t);
    drawHearts(ctx, player);
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
      `CAM ${L.cam.x},${L.cam.y} MAP ${world.pxW}X${world.pxH}  HEARTS ${p.hearts}/${p.maxHearts}`,
    ];
  };

  return L;
}
