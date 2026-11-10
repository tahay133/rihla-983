// The traveller: run accel/decel, variable-height jump, coyote time, jump buffer,
// swimming, knockback + hearts. Hitbox 8×14 inside the 12×16 sprite.
import { moveX, moveY, TS } from '../engine/physics.js';
import { blit } from '../art/sprites.js';

export const PHYS = {
  runMax: 1.5, accel: 0.15, turn: 0.12, decel: 0.2,
  airAccel: 0.11, airDecel: 0.04,
  gravity: 0.24, maxFall: 4.2,
  jumpV: 4.5, jumpCut: 0.6,        // apex ≈ 42 px (2.6 tiles); gap ≈ 3.5 tiles at full run
  coyote: 6, buffer: 6,
  bounceV: 6.2,                    // market awnings
  swimRun: 0.85, swimGravity: 0.06, swimMaxFall: 0.8, swimStroke: 1.5, swimLeap: 3.7,
  knockVX: 2.2, knockVY: 2.6, knockFrames: 14, invuln: 75,
};

export function createPlayer(x, y, hearts = 3) {
  return {
    x, y, w: 8, h: 14, vx: 0, vy: 0, facing: 1,
    onGround: false, onOneWay: false, coyote: 0, jumpBuf: 0, jumping: false, dropT: 0,
    standingOn: null, inWater: false, wasInWater: false,
    hearts, maxHearts: hearts, invuln: 0, knockT: 0,
    animT: 0, bounced: false, frozen: false,
  };
}

export function updatePlayer(p, input, world, env = {}) {
  const held = input.held;
  const sfx = env.sfx || (() => {});
  if (p.frozen) return;

  const cx = p.x + p.w / 2;
  p.inWater = !!(world.waterAt && world.waterAt(cx, p.y + p.h * 0.6));
  if (p.inWater && !p.wasInWater) { p.vy *= 0.35; sfx('splash'); }
  p.wasInWater = p.inWater;
  const wet = p.inWater;

  // --- horizontal ---
  const ax = (held.right ? 1 : 0) - (held.left ? 1 : 0);
  const maxRun = wet ? PHYS.swimRun : PHYS.runMax;
  if (p.knockT > 0) {
    p.knockT--;
    p.vx *= 0.92;
  } else if (ax) {
    let acc = p.onGround ? PHYS.accel : PHYS.airAccel;
    if (p.vx && Math.sign(p.vx) !== ax) acc += PHYS.turn;
    const before = Math.abs(p.vx);
    p.vx += ax * acc;
    // Cap at run speed; if we were already faster (knockback, current), ease down instead of snapping.
    if (Math.abs(p.vx) > maxRun) p.vx = Math.sign(p.vx) * (before > maxRun ? Math.max(maxRun, before - 0.1) : maxRun);
    p.facing = ax;
  } else {
    const d = p.onGround ? PHYS.decel : PHYS.airDecel;
    p.vx = Math.abs(p.vx) <= d ? 0 : p.vx - Math.sign(p.vx) * d;
  }

  // --- jump buffer / coyote / drop-through ---
  if (input.pressed.jump) p.jumpBuf = PHYS.buffer; else if (p.jumpBuf > 0) p.jumpBuf--;
  if (p.onGround) p.coyote = PHYS.coyote; else if (p.coyote > 0) p.coyote--;
  if (p.dropT > 0) p.dropT--;

  if (wet) {
    if (input.pressed.jump) {
      const nearSurface = !world.waterAt(cx, p.y - 2);
      p.vy = nearSurface ? -PHYS.swimLeap : Math.min(p.vy, 0) - PHYS.swimStroke;
      if (p.vy < -PHYS.swimLeap) p.vy = -PHYS.swimLeap;
      p.jumpBuf = 0;
      sfx(nearSurface ? 'jump' : 'swim');
    }
  } else if (p.jumpBuf > 0 && held.down && p.onGround && p.onOneWay) {
    p.dropT = 12; p.jumpBuf = 0; p.coyote = 0; p.onGround = false; p.standingOn = null; p.y += 1;
  } else if (p.jumpBuf > 0 && p.coyote > 0 && p.knockT === 0) {
    p.vy = -PHYS.jumpV; p.jumpBuf = 0; p.coyote = 0; p.onGround = false; p.jumping = true; p.standingOn = null;
    sfx('jump');
  }
  if (p.jumping && !held.jump && p.vy < -1) { p.vy *= PHYS.jumpCut; p.jumping = false; }
  if (p.vy >= 0) p.jumping = false;

  // --- gravity ---
  if (wet) {
    p.vy = Math.min(p.vy + PHYS.swimGravity + (held.down ? 0.05 : 0), PHYS.swimMaxFall + (held.down ? 0.6 : 0));
    p.vy *= 0.97;
  } else {
    p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall);
  }

  // --- move (external pushes: wind, water current) ---
  const ext = (env.windX || 0) + (wet ? env.currentX || 0 : 0);
  moveX(p, p.vx + ext, world);
  if (p.hitWall) p.vx = 0;
  moveY(p, p.vy, world);
  p.bounced = false;
  if (p.landed) {
    const t = world.tileAt ? world.tileAt(p.landed.tx, p.landed.ty) : '#';
    if (t === 'A' && !held.down) {
      p.vy = -PHYS.bounceV; p.onGround = false; p.jumping = false; p.bounced = true;
      sfx('bounce');
    } else {
      if (!p.onGround && p.vy > 2) sfx('land');
      p.vy = 0; p.onGround = true;
      p.onOneWay = world.solidAt(p.landed.tx, p.landed.ty) === 2;
    }
  } else {
    if (p.bonked && p.vy < 0) { p.vy = 0; p.jumping = false; }
    p.onGround = false;
    p.onOneWay = false;
  }

  if (p.invuln > 0) p.invuln--;
  p.animT++;
}

// Knock the traveller away from a hazard at x = fromX. Returns true if damage was taken.
export function hurtPlayer(p, fromX) {
  if (p.invuln > 0) return false;
  p.hearts = Math.max(0, p.hearts - 1);
  p.invuln = PHYS.invuln;
  p.knockT = PHYS.knockFrames;
  const dir = p.x + p.w / 2 < fromX ? -1 : 1;
  p.vx = dir * PHYS.knockVX;
  p.vy = -PHYS.knockVY;
  p.onGround = false; p.standingOn = null; p.jumping = false;
  return true;
}

export function drawPlayer(ctx, p, camX, camY) {
  if (p.invuln > 0 && p.knockT === 0 && (p.invuln >> 2) % 2 === 0) return; // blink while invulnerable
  const moving = Math.abs(p.vx) > 0.25;
  let name = 'traveller';
  if (!p.onGround) name = 'travellerWalk';
  else if (moving && (p.animT >> 3) % 2 === 1) name = 'travellerWalk';
  if (p.knockT > 0) name += 'Flash';
  blit(ctx, name, Math.round(p.x) - 2 - camX, Math.round(p.y) - 2 - camY, p.facing);
}

export function tileOf(p) { return { tx: Math.floor((p.x + p.w / 2) / TS), ty: Math.floor((p.y + p.h - 1) / TS) }; }
