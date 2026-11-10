// AABB vs tilemap. A world exposes solidAt(tx, ty) → 0 empty, 1 solid, 2 one-way (solid from above only).
// Speeds stay well under a tile per frame, so checking the leading edge's tile row/column can't tunnel.
export const TS = 16;
const EPS = 0.01;

export function moveX(b, dx, world) {
  b.hitWall = 0;
  if (!dx) return;
  b.x += dx;
  const y0 = Math.floor(b.y / TS), y1 = Math.floor((b.y + b.h - EPS) / TS);
  if (dx > 0) {
    const tx = Math.floor((b.x + b.w - EPS) / TS);
    for (let ty = y0; ty <= y1; ty++) if (world.solidAt(tx, ty) === 1) { b.x = tx * TS - b.w; b.hitWall = 1; return; }
  } else {
    const tx = Math.floor(b.x / TS);
    for (let ty = y0; ty <= y1; ty++) if (world.solidAt(tx, ty) === 1) { b.x = (tx + 1) * TS; b.hitWall = -1; return; }
  }
}

export function moveY(b, dy, world) {
  b.landed = null;
  b.bonked = false;
  if (!dy) return;
  const prevBottom = b.y + b.h;
  b.y += dy;
  const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w - EPS) / TS);
  if (dy > 0) {
    const ty = Math.floor((b.y + b.h - EPS) / TS);
    const top = ty * TS;
    for (let tx = x0; tx <= x1; tx++) {
      const s = world.solidAt(tx, ty);
      if (s === 1 || (s === 2 && prevBottom <= top + EPS && !(b.dropT > 0))) {
        b.y = top - b.h;
        b.landed = { tx, ty };
        return;
      }
    }
  } else {
    const ty = Math.floor(b.y / TS);
    for (let tx = x0; tx <= x1; tx++) {
      if (world.solidAt(tx, ty) === 1) { b.y = (ty + 1) * TS; b.bonked = true; return; }
    }
  }
}

// Is there solid (or one-way) ground directly under the box?
export function groundBelow(b, world) {
  const ty = Math.floor((b.y + b.h + 0.5) / TS);
  const x0 = Math.floor(b.x / TS), x1 = Math.floor((b.x + b.w - EPS) / TS);
  for (let tx = x0; tx <= x1; tx++) if (world.solidAt(tx, ty)) return true;
  return false;
}

export function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
