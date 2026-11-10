// Decorations drawn in world space, behind the tiles: market stalls, palms, gate faces,
// reeds. Purely visual; collisions come from the tilemap. Coordinates are tile cells.
const TS = 16;

function P(ctx, camX, camY) { return (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x - camX), Math.round(y - camY), w, h); }; }

const DECOR = {
  // A stall counter with goods under an awning row (awning tiles sit at row ty−1).
  stall(R, d) {
    const x = d.tx * TS, y = d.ty * TS, w = (d.w || 3) * TS;
    R(x + 1, y + 6, w - 2, 10, '#7a5232'); R(x + 1, y + 6, w - 2, 2, '#a06c42');
    const goods = ['#d2453a', '#e8c45a', '#3f7a3a', '#c48c54', '#f3ead2', '#7b4fa0'];
    for (let i = 0; i < w - 6; i += 4) R(x + 3 + i, y + 3, 3, 3, goods[(i / 4 + d.tx) % goods.length]);
  },
  palm(R, d) {
    const x = d.tx * TS + 7, by = (d.ty + 1) * TS, h = d.h || 40;
    for (let i = 0; i < h; i++) R(x + Math.round(Math.sin(i / 10) * 2), by - i, 2, 1, i % 4 === 0 ? '#3f2a1a' : '#5c4026');
    const tx = x + Math.round(Math.sin(h / 10) * 2), ty = by - h;
    const leaf = d.leaf || '#3f6b3a';
    [[-12, 4], [-8, 7], [-4, 8], [4, 8], [8, 7], [12, 4], [-9, -3], [9, -3], [0, -5]].forEach(([dx, dy]) => {
      const n = Math.max(1, Math.abs(dx));
      for (let i = 0; i <= n; i++) R(tx + Math.round((dx * i) / n), ty + Math.round((dy * i * i) / (n * n)) - 1, 2, 1, leaf);
    });
    R(tx - 1, ty - 2, 4, 3, leaf); R(tx, ty + 1, 2, 2, '#8a5a24');
  },
  // Round City gate, drawn in front of the wall tiles: towers either side, an arched
  // portal face at each end of the passage, and shadow inside it.
  gate(R, d) {
    const x0 = d.tx0 * TS, x1 = (d.tx1 + 1) * TS, top = d.ty * TS, bot = (d.tyBottom + 1) * TS;
    const stone = d.stone || '#d9b984', trim = d.trim || '#b48d58', dark = '#5a3f24';
    R(x0, top, x1 - x0, bot - top, 'rgba(50,32,18,0.45)');
    for (const cx of [x0 + 10, x1 - 10]) {
      // portal: pilasters + round arch ring rising into the wall
      R(cx - 12, top - 2, 4, bot - top + 2, stone); R(cx + 8, top - 2, 4, bot - top + 2, stone);
      for (let dy = 0; dy <= 20; dy++) {
        const ho = Math.round(Math.sqrt(400 - dy * dy)), hi = Math.round(Math.sqrt(Math.max(0, 256 - dy * dy)));
        R(cx - ho, top - 2 - dy, ho - hi, 1, stone); R(cx + hi, top - 2 - dy, ho - hi, 1, stone);
        if (dy % 4 === 0) { R(cx - ho, top - 2 - dy, 1, 1, trim); R(cx + ho - 1, top - 2 - dy, 1, 1, trim); }
      }
      R(cx - 1, top - 23, 2, 3, trim);
    }
    // towers on the wall face
    for (const tx of [x0 - 6, x0 + (x1 - x0) / 2 - 6, x1 - 6]) {
      R(tx, top - 92, 12, 92, 'rgba(232,206,150,0.55)');
      R(tx + 2, top - 70, 2, 5, dark); R(tx + 8, top - 40, 2, 5, dark);
    }
    R(x0 - 8, top - 4, x1 - x0 + 16, 2, trim);
  },
  // Stepped merlons along the top edge of a wall (row ty is the wall's top row).
  crenels(R, d) {
    const col = d.color || '#e3c893', y = d.ty * TS;
    for (let x = d.tx0 * TS; x < (d.tx1 + 1) * TS - 3; x += 6) { R(x, y - 4, 4, 4, col); R(x + 1, y - 6, 2, 2, col); }
    R(d.tx0 * TS, y, (d.tx1 - d.tx0 + 1) * TS, 1, d.shade || 'rgba(0,0,0,0.12)');
  },
  // A row of arched niches on a wall face. style: 'pointed' (Cairo, Qayrawan) or 'horseshoe' (Córdoba).
  arches(R, d) {
    const step = d.step || 24, w = d.w || 8, h = d.h || 20, y = d.ty * TS + (d.dy || 0);
    for (let x = d.tx0 * TS + 8; x + w < (d.tx1 + 1) * TS - 4; x += step) {
      if (d.style === 'horseshoe') {
        R(x - 2, y - 2, w + 4, h + 2, '#efe0c0');
        for (let i = 0; i < w + 4; i += 2) R(x - 2 + i, y - 4, 2, 2, i % 4 ? '#a33a2a' : '#efe0c0');
        R(x, y, w, h, d.dark || '#4d3529');
        R(x - 1, y + 1, w + 2, 2, d.dark || '#4d3529');
      } else {
        R(x, y + 2, w, h - 2, d.dark || '#7a5934');
        R(x + 1, y + 1, w - 2, 1, d.dark || '#7a5934'); R(x + 2, y, w - 4, 1, d.dark || '#7a5934');
        if (d.trim) R(x - 1, y + h, w + 2, 1, d.trim);
      }
    }
  },
  banner(R, d) {
    const x = d.tx * TS + 6, y = d.ty * TS;
    R(x, y, 1, 14, '#3a2a20'); R(x + 1, y, 8, 5, d.color); R(x + 1, y + 5, 5, 2, d.color);
    if (d.color === '#ffffff') R(x + 1, y + 4, 8, 1, '#cfc8b8');
  },
  reeds(R, d) {
    const x = d.tx * TS, y = (d.ty + 1) * TS;
    for (let i = 0; i < (d.w || 1) * TS; i += 3) R(x + i, y - 6 - ((i * 7) % 5), 1, 6 + ((i * 7) % 5), '#4f6a34');
  },
  // a lamp glow for night levels
  lamp(R, d) {
    const x = d.tx * TS + 7, y = d.ty * TS + 4;
    R(x - 3, y - 3, 8, 8, 'rgba(232,196,90,0.12)'); R(x - 1, y - 1, 4, 4, 'rgba(232,196,90,0.25)'); R(x, y, 2, 3, '#e8c45a');
  },
};

export function drawDecor(ctx, list, camX, camY, t, front = false) {
  if (!list) return;
  const R = P(ctx, camX, camY);
  for (const d of list) {
    if (!!d.front !== front) continue;
    const x = (d.tx ?? d.tx0) * TS - camX;
    const span = ((d.tx1 ?? d.tx) - (d.tx ?? d.tx0) + (d.w || 3)) * TS;
    if (x > 340 || x + span < -60) continue;
    DECOR[d.kind](R, d, t);
  }
}
