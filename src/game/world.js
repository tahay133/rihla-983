// Tilemap world built from string rows (legend in docs/handoff.html §3):
//   #  solid ground          =  one-way ledge           ~  water (slow, swimmable)
//   L  luster platform (solid only after Glint)         D  Fatimid gate (opens with Robe)
//   C  camel platform spawn   G  guffa boat spawn       F  felucca spawn
//   S  scorpion   M  melon cart   W  guard patrol       K  checkpoint
//   P  player start           I  end-of-level item      .  empty
// Extra tiles used by this game:
//   B  built stone/brick (solid)   A  market awning (one-way, bounces)
//   $  gold-lettered stone (solid) %  crumbling stone (solid until stood on)
//   ?  sign (text from level.signs, left to right)
import { TS } from '../engine/physics.js';

export const SPAWN_CHARS = new Set(['C', 'G', 'F', 'S', 'M', 'W', 'K', 'P', 'I', '?']);

// Join equal-height segments side by side into one map.
export function hjoin(...segments) {
  const h = segments[0].length;
  segments.forEach((seg, i) => {
    if (seg.length !== h) throw new Error(`segment ${i} has ${seg.length} rows, expected ${h}`);
    const w = seg[0].length;
    seg.forEach((row, y) => { if (row.length !== w) throw new Error(`segment ${i} row ${y} is ${row.length} wide, expected ${w}`); });
  });
  return Array.from({ length: h }, (_, y) => segments.map(s => s[y]).join(''));
}

export function buildWorld(map, flags = {}) {
  const rows = map.length, cols = map[0].length;
  map.forEach((r, y) => { if (r.length !== cols) throw new Error(`map row ${y} is ${r.length} wide, expected ${cols}`); });
  const grid = map.map(r => r.split(''));
  const spawns = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = grid[y][x];
      if (!SPAWN_CHARS.has(ch)) continue;
      spawns.push({ ch, tx: x, ty: y });
      const wet = (grid[y][x - 1] === '~' || grid[y][x + 1] === '~');
      grid[y][x] = wet ? '~' : '.';
    }
  }
  spawns.sort((a, b) => a.tx - b.tx || a.ty - b.ty);

  const world = {
    rows, cols, grid, spawns, flags,
    pxW: cols * TS, pxH: rows * TS,
    openGates: new Set(),     // "tx,ty"
    crumble: new Map(),       // "tx,ty" → {t, state: 'shake'|'gone'}
    tileAt(tx, ty) {
      if (tx < 0 || tx >= cols) return '#';
      if (ty < 0 || ty >= rows) return '.';
      return grid[ty][tx];
    },
    solidAt(tx, ty) {
      switch (world.tileAt(tx, ty)) {
        case '#': case 'B': case '$': return 1;
        case '=': case 'A': return 2;
        case 'L': return flags.glint ? 2 : 0;
        case 'D': return world.openGates.has(tx + ',' + ty) ? 0 : 1;
        case '%': { const c = world.crumble.get(tx + ',' + ty); return c && c.state === 'gone' ? 0 : 1; }
        default: return 0;
      }
    },
    waterAt(px, py) { return world.tileAt(Math.floor(px / TS), Math.floor(py / TS)) === '~'; },
    find(ch) { return spawns.filter(s => s.ch === ch); },
  };
  return world;
}
