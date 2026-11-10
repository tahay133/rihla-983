// 16×16 tiles, pre-rendered per level theme. Water is drawn in a later pass (over the player).
const TS = 16;

export const DEFAULT_THEME = {
  ground: { top: '#c49d63', hi: '#e0bd7f', fill: '#8f6a3e', dark: '#71512c', speck: '#a8824f' },
  brick: { fill: '#b27b46', mortar: '#8d5b33', hi: '#c48c54', weave: false },
  ledge: { wood: '#7a5232', hi: '#a06c42', dark: '#4a2e1a' },
  awning: ['#a33a2a', '#efe0c0'],
  water: { body: 'rgba(58,125,132,0.62)', surf: '#9fd0c8', deep: 'rgba(30,70,80,0.5)' },
  gold: '#e8c45a',
  gate: { wood: '#6b4a2b', dark: '#3a2618', stud: '#b9c0c9', frame: '#cdb98a' },
};

function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }

export function createTileset(themeIn = {}) {
  const th = {
    ...DEFAULT_THEME, ...themeIn,
    ground: { ...DEFAULT_THEME.ground, ...(themeIn.ground || {}) },
    brick: { ...DEFAULT_THEME.brick, ...(themeIn.brick || {}) },
    ledge: { ...DEFAULT_THEME.ledge, ...(themeIn.ledge || {}) },
    water: { ...DEFAULT_THEME.water, ...(themeIn.water || {}) },
    gate: { ...DEFAULT_THEME.gate, ...(themeIn.gate || {}) },
  };
  const cache = new Map();
  function make(key, draw) {
    let c = cache.get(key);
    if (c) return c;
    c = document.createElement('canvas'); c.width = TS; c.height = TS;
    const x = c.getContext('2d');
    draw((a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); });
    cache.set(key, c);
    return c;
  }

  const ground = (top, v) => make(`g${top}${v}`, R => {
    const g = th.ground;
    R(0, 0, 16, 16, g.fill);
    for (let i = 0; i < 7; i++) {
      const a = Math.floor(hash(v * 11 + i, 3) * 15), b = Math.floor(hash(i, v * 7 + 1) * 15);
      R(a, b, i % 3 ? 1 : 2, 1, i % 2 ? g.speck : g.dark);
    }
    if (top) { R(0, 0, 16, 3, g.top); R(0, 0, 16, 1, g.hi); R(3 + v * 3, 3, 3, 1, g.top); R(11 - v, 3, 2, 1, g.top); }
  });

  const brick = (top, v) => make(`b${top}${v}`, R => {
    const b = th.brick;
    R(0, 0, 16, 16, b.mortar);
    for (let row = 0; row < 4; row++) {
      const off = (row + v) % 2 ? 4 : 0;
      for (let col = -1; col < 3; col++) {
        const bx = col * 8 + off;
        if (b.weave && (row + col + v) % 2) { R(bx + 1, row * 4 + 1, 3, 2, b.fill); R(bx + 4, row * 4 + 1, 3, 2, b.fill); }
        else R(bx + 1, row * 4 + 1, 6, 3, b.fill);
      }
    }
    if (top) { R(0, 0, 16, 2, b.hi); }
  });

  const gold = top => make(`$${top}`, R => {
    const b = th.brick;
    R(0, 0, 16, 16, b.fill); R(0, 15, 16, 1, b.mortar); R(15, 0, 1, 16, b.mortar);
    if (top) {
      R(0, 0, 16, 2, b.hi);
      // gold kufic-like strokes on the walking surface
      const G = th.gold;
      R(1, 3, 1, 4, G); R(1, 6, 4, 1, G); R(6, 3, 1, 4, G); R(8, 4, 3, 1, G); R(8, 4, 1, 3, G); R(8, 6, 4, 1, G); R(13, 2, 1, 5, G); R(13, 6, 2, 1, G);
    }
  });

  const crumble = (top, shake) => make(`%${top}${shake}`, R => {
    const b = th.brick;
    R(0, 0, 16, 16, b.fill); R(0, 15, 16, 1, b.mortar); R(15, 0, 1, 16, b.mortar);
    if (top) R(0, 0, 16, 2, b.hi);
    R(4, 5, 1, 3, b.mortar); R(5, 8, 2, 1, b.mortar); R(7, 9, 1, 3, b.mortar); R(11, 3, 1, 2, b.mortar); R(12, 5, 1, 2, b.mortar);
    if (shake) { R(2, 11, 3, 1, b.mortar); R(9, 12, 1, 3, b.mortar); }
  });

  const ledge = (l, r) => make(`=${l}${r}`, R => {
    const e = th.ledge;
    R(0, 0, 16, 4, e.wood); R(0, 0, 16, 1, e.hi); R(0, 4, 16, 1, e.dark);
    if (l) R(1, 5, 2, 4, e.dark);
    if (r) R(13, 5, 2, 4, e.dark);
    R(5, 2, 1, 1, e.dark); R(11, 1, 1, 1, e.dark);
  });

  const awning = (l, r) => make(`A${l}${r}`, R => {
    const [a, b] = th.awning;
    for (let i = 0; i < 16; i += 4) { R(i, 0, 2, 6, a); R(i + 2, 0, 2, 6, b); }
    R(0, 0, 16, 1, '#3a2618');
    for (let i = 0; i < 16; i += 4) R(i + 1, 6, 2, 1, i % 8 ? b : a);
    if (l) R(0, 0, 1, 12, '#5c4026');
    if (r) R(15, 0, 1, 12, '#5c4026');
  });

  const luster = t => make(`L${t}`, R => {
    R(0, 0, 16, 5, '#c9962b'); R(0, 0, 16, 1, '#f5e08a'); R(0, 4, 16, 1, '#8f6420');
    const s = t % 16;
    R(s, 1, 2, 1, '#fff6c8'); R((s + 9) % 16, 2, 1, 1, '#fff6c8');
  });

  const gate = (top, open) => make(`D${top}${open}`, R => {
    const g = th.gate;
    if (open) { R(0, 0, 2, 16, g.frame); R(14, 0, 2, 16, g.frame); if (top) R(0, 0, 16, 3, g.frame); return; }
    R(0, 0, 16, 16, g.wood); R(7, 0, 2, 16, g.dark); R(0, 0, 2, 16, g.frame); R(14, 0, 2, 16, g.frame);
    for (let y = 3; y < 16; y += 5) { R(3, y, 1, 1, g.stud); R(5, y, 1, 1, g.stud); R(10, y, 1, 1, g.stud); R(12, y, 1, 1, g.stud); }
    if (top) { R(0, 0, 16, 3, g.frame); R(2, 3, 12, 1, g.dark); }
  });

  // Draw all non-water tiles in view.
  function drawTiles(ctx, world, camX, camY, t) {
    const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + 320) / TS);
    const ty0 = Math.max(0, Math.floor(camY / TS)), ty1 = Math.min(world.rows - 1, Math.floor((camY + 180) / TS));
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const ch = world.tileAt(tx, ty);
        if (ch === '.' || ch === '~') continue;
        const above = world.tileAt(tx, ty - 1);
        const top = !(above === ch || above === '#' || above === 'B' || above === '$' || above === '%' || above === 'D');
        const x = tx * TS - camX, y = ty * TS - camY;
        const v = Math.floor(hash(tx, ty) * 3);
        let img = null;
        switch (ch) {
          case '#': img = ground(top, v); break;
          case 'B': img = brick(top, v % 2); break;
          case '$': img = gold(top); break;
          case '%': {
            const c = world.crumble.get(tx + ',' + ty);
            if (c && c.state === 'gone') break;
            const shake = c && c.state === 'shake';
            img = crumble(top, shake ? 1 : 0);
            if (shake) { ctx.drawImage(img, x + ((t >> 1) % 2 ? 1 : -1), y); img = null; }
            break;
          }
          case '=': img = ledge(world.tileAt(tx - 1, ty) !== '=', world.tileAt(tx + 1, ty) !== '='); break;
          case 'A': img = awning(world.tileAt(tx - 1, ty) !== 'A', world.tileAt(tx + 1, ty) !== 'A'); break;
          case 'L': if (world.flags.glint) img = luster(((t >> 2) + tx * 5) % 16); break;
          case 'D': img = gate(world.tileAt(tx, ty - 1) !== 'D', world.openGates.has(tx + ',' + ty) ? 1 : 0); break;
        }
        if (img) ctx.drawImage(img, x, y);
      }
    }
  }

  // Water goes on top of the player so swimming reads as "in" the water.
  function drawWater(ctx, world, camX, camY, t) {
    const w = th.water;
    const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + 320) / TS);
    const ty0 = Math.max(0, Math.floor(camY / TS)), ty1 = Math.min(world.rows - 1, Math.floor((camY + 180) / TS));
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        if (world.tileAt(tx, ty) !== '~') continue;
        const x = tx * TS - camX, y = ty * TS - camY;
        const surf = world.tileAt(tx, ty - 1) !== '~';
        ctx.fillStyle = w.body; ctx.fillRect(x, y + (surf ? 2 : 0), TS, TS - (surf ? 2 : 0));
        if (surf) {
          ctx.fillStyle = w.surf;
          const o = ((t >> 3) + tx * 3) % 8;
          ctx.fillRect(x, y + 2, TS, 1);
          ctx.fillRect(x + o, y + 1, 4, 1);
          ctx.fillRect(x + ((o + 9) % 14), y + 4, 2, 1);
        } else if (world.tileAt(tx, ty + 1) !== '~') {
          ctx.fillStyle = w.deep; ctx.fillRect(x, y + 10, TS, 6);
        }
      }
    }
  }

  return { theme: th, drawTiles, drawWater };
}
