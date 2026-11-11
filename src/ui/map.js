// Route map: a stylised pixel map from al-Andalus to Transoxania, with the five cities,
// their banners, and the caliphs revealed as the journey goes west.
// Geography is approximate (lon/lat → pixels); borders are deliberately not drawn.
import { drawText, wrapText, measureText } from '../art/font.js';
import { blit, SPRITES, miniRows } from '../art/sprites.js';

const MW = 320, MH = 132;
const px = ([lon, lat]) => [Math.round((lon + 10) * 4), Math.round((46 - lat) * 6)];

// Approximate coastlines and seas (lon, lat).
const SEAS = {
  atlantic: [[-10, 46], [-1.5, 46], [-1.8, 43.4], [-8.9, 43.3], [-9.3, 38.7], [-8.9, 37], [-6.3, 36.5], [-5.6, 36], [-6, 35.5], [-9.8, 30], [-10, 24]],
  med: [[-5.6, 36.0], [-4.4, 36.7], [-2.1, 36.7], [-0.5, 38.3], [0.2, 39.6], [3.2, 41.9], [3.1, 43.1], [4.8, 43.4], [6.5, 43.1], [7.5, 43.8], [8.9, 44.4], [10.2, 43.9], [10.5, 42.9], [12.4, 41.8], [14.3, 40.8], [15.6, 40.1], [16.2, 38.9], [15.7, 38.0], [16.6, 38.4], [17.1, 39.0], [18.5, 40.1], [18.0, 40.6], [16.3, 41.3], [15.2, 41.9], [14.2, 42.9], [13.6, 43.6], [12.3, 44.4], [12.4, 45.4], [13.7, 45.6], [14.5, 45.2], [15.2, 44.4], [16.4, 43.5], [18.1, 42.6], [19.4, 41.8], [19.4, 40.3], [20.2, 39.6], [21.1, 38.3], [21.6, 37.0], [22.9, 36.4], [23.2, 37.4], [22.8, 37.9], [23.9, 38.0], [24.0, 38.9], [22.9, 39.5], [22.9, 40.5], [24.4, 40.9], [26.0, 40.8], [26.7, 40.4], [26.2, 39.4], [26.9, 38.4], [27.3, 37.0], [28.2, 36.7], [29.6, 36.2], [30.6, 36.8], [32.5, 36.1], [34.6, 36.8], [36.0, 36.6], [35.9, 35.4], [35.6, 34.0], [34.9, 32.8], [34.3, 31.3], [32.3, 31.2], [30.9, 31.6], [29.0, 30.9], [25.2, 31.6], [23.0, 32.6], [21.0, 32.8], [20.1, 32.2], [20.0, 31.0], [18.9, 30.4], [16.5, 31.2], [15.3, 32.2], [13.9, 32.8], [11.5, 33.2], [10.3, 33.7], [10.9, 34.8], [10.4, 36.0], [11.0, 37.1], [9.8, 37.3], [8.6, 36.9], [6.0, 37.0], [3.2, 36.8], [1.0, 36.5], [-1.1, 35.6], [-2.2, 35.1], [-4.6, 35.2], [-5.3, 35.9]],
  black: [[27.6, 42.5], [28.6, 44.2], [29.6, 45.3], [30.4, 46], [38.6, 46], [39.7, 44.2], [41.6, 41.5], [39.0, 41.0], [36.0, 41.7], [34.0, 42.0], [31.0, 41.2], [29.0, 41.2]],
  caspian: [[46.7, 46.0], [51.0, 46.0], [53.0, 45.2], [52.5, 42.5], [53.0, 40.5], [54.0, 38.5], [53.9, 37.0], [51.0, 36.7], [49.0, 37.6], [48.9, 38.5], [49.5, 40.0], [48.0, 42.0], [47.4, 43.2], [47.0, 44.5]],
  red: [[32.5, 30.0], [32.4, 29.5], [33.6, 27.3], [35.2, 24.0], [36.9, 24.0], [35.4, 27.0], [34.6, 28.1], [33.1, 28.6]],
  gulf: [[48.0, 30.0], [50.0, 30.2], [51.5, 27.9], [54.0, 26.6], [56.3, 27.0], [56.5, 26.0], [56.2, 24.0], [54.0, 24.0], [51.6, 24.5], [51.0, 26.0], [50.0, 26.2], [49.0, 27.5]],
  aral: [[58.4, 46.0], [61.6, 46.0], [61.0, 44.6], [59.8, 43.6], [58.6, 44.2]],
};
const ISLANDS = [
  [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [12.6, 37.6]],              // Sicily
  [[8.4, 41.1], [9.8, 41.0], [9.6, 39.1], [8.5, 39.0]],                  // Sardinia
  [[8.6, 42.9], [9.5, 42.9], [9.4, 41.4], [8.8, 41.6]],                  // Corsica
  [[23.5, 35.6], [26.3, 35.3], [26.0, 35.0], [23.6, 35.2]],              // Crete
  [[32.3, 35.1], [34.6, 35.7], [34.0, 34.6], [32.6, 34.6]],              // Cyprus
  [[1.4, 39.1], [3.4, 39.9], [3.2, 39.3], [2.4, 39.4]],                  // Mallorca
];
const RIVERS = [
  [[30.9, 31.5], [31.2, 30.0], [31.1, 28.0], [30.8, 27.0], [32.0, 26.0], [32.9, 24.0]],     // Nile
  [[42.0, 37.2], [43.1, 36.3], [44.4, 33.3], [45.8, 32.5], [47.5, 31.0], [48.0, 30.0]],     // Tigris
  [[38.0, 37.0], [39.5, 36.0], [41.0, 34.4], [43.3, 32.5], [46.0, 31.0], [47.5, 31.0]],     // Euphrates
  [[-3.0, 38.0], [-4.78, 37.88], [-6.0, 37.4], [-6.3, 36.8]],                                // Guadalquivir
  [[64.4, 39.8], [67.0, 39.65], [68.5, 39.5]],                                               // Zarafshan
  [[59.6, 43.8], [61.0, 41.5], [62.5, 39.5], [65.0, 37.5], [67.5, 37.2]],                   // Amu Darya
];

// Journey order (east → west) with map positions.
export const CITIES = [
  { lv: 0, name: 'Bukhara', at: [64.42, 39.77], label: 'left' },
  { lv: 1, name: 'Baghdad', at: [44.36, 33.31], label: 'right' },
  { lv: 2, name: 'Cairo', at: [31.24, 30.04], label: 'below' },
  { lv: 3, name: 'Qayrawan', at: [10.1, 35.68], label: 'below' },
  { lv: 4, name: 'Córdoba', at: [-4.78, 37.88], label: 'above' },
];

function fillPoly(c, pts, col) {
  c.fillStyle = col;
  const ys = pts.map(p => p[1]);
  const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(MH - 1, Math.ceil(Math.max(...ys)));
  for (let y = y0; y <= y1; y++) {
    const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) c.fillRect(a, y, b - a, 1); }
  }
}

function line(c, a, b, col, dash = 0, phase = 0) {
  const [x0, y0] = a, [x1, y1] = b;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  c.fillStyle = col;
  for (let i = 0; i <= n; i++) {
    if (dash && Math.floor((i + phase) / dash) % 2) continue;
    c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1);
  }
}

let mapCache = null;
function baseMap() {
  if (mapCache) return mapCache;
  const cv = document.createElement('canvas'); cv.width = MW; cv.height = MH;
  const c = cv.getContext('2d');
  c.fillStyle = '#e9d7a8'; c.fillRect(0, 0, MW, MH);
  for (let i = 0; i < 900; i++) { c.fillStyle = i % 3 ? '#dfc994' : '#f1e3bb'; c.fillRect((i * 97) % MW, (i * 61 + (i >> 3)) % MH, 1, 1); }
  const sea = '#7fa9b3';
  for (const poly of Object.values(SEAS)) fillPoly(c, poly.map(px), sea);
  for (const poly of ISLANDS) fillPoly(c, poly.map(px), '#e9d7a8');
  // coast shading: darken land pixels next to sea
  const img = c.getImageData(0, 0, MW, MH), d = img.data;
  const isSea = (x, y) => { const k = (y * MW + x) * 4; return d[k] === 0x7f && d[k + 1] === 0xa9; };
  const coast = [];
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) if (!isSea(x, y) && (isSea(x + 1, y) || isSea(x - 1, y) || isSea(x, y + 1) || isSea(x, y - 1))) coast.push([x, y]);
  c.fillStyle = '#b89b62'; coast.forEach(([x, y]) => c.fillRect(x, y, 1, 1));
  for (let y = 0; y < MH; y += 3) for (let x = (y * 7) % 5; x < MW; x += 9) if (isSea(x, y)) { c.fillStyle = '#93bac2'; c.fillRect(x, y, 2, 1); }
  for (const r of RIVERS) for (let i = 0; i + 1 < r.length; i++) line(c, px(r[i]), px(r[i + 1]), '#6f9aa6');
  mapCache = cv;
  return cv;
}

const BANNER_NAME = { '#141018': 'black', '#ffffff': 'white', '#b3261e': 'red' };

export function createMapScene(game, { data, save, selected, onTravel, onBack }) {
  const maxLv = Math.min(save.next, data.levels.length - 1);
  let sel = Math.min(selected ?? maxLv, maxLv);
  let t = 0;
  const itemSprite = id => data.items.find(it => it.id === id).sprite;
  return {
    update(g) {
      t++;
      const inp = g.input;
      // The route runs east → west, so ← moves on and → goes back.
      if (inp.pressed.left) { sel = Math.min(maxLv, sel + 1); game.sfx && game.sfx('tick'); }
      if (inp.pressed.right) { sel = Math.max(0, sel - 1); game.sfx && game.sfx('tick'); }
      if (t > 10 && (inp.pressed.confirm || inp.pressed.jump)) onTravel(sel);
      if (t > 10 && inp.pressed.pause) onBack();
    },
    render(c) {
      c.fillStyle = '#1d1a24'; c.fillRect(0, 0, 320, 180);
      c.drawImage(baseMap(), 0, 0);
      c.fillStyle = '#6b4a2b'; c.fillRect(0, MH, 320, 1);
      // route so far (dashed), and the stretch to the selected city pulsing
      for (let i = 0; i < CITIES.length - 1; i++) {
        const a = px(CITIES[i].at), b = px(CITIES[i + 1].at);
        const done = i < save.next;
        line(c, a, b, done ? '#a33a2a' : 'rgba(107,74,43,0.45)', 3, done ? 0 : 0);
      }
      CITIES.forEach((city, i) => {
        const [x, y] = px(city.at);
        const info = data.levels[i];
        const reached = i <= maxLv;
        // banner flag on a pole
        c.fillStyle = '#3a2a20'; c.fillRect(x, y - 11, 1, 11);
        if (reached) {
          c.fillStyle = info.banner; c.fillRect(x + 1, y - 11, 6, 4); c.fillRect(x + 1, y - 7, 4, 1);
          if (info.banner === '#ffffff') { c.fillStyle = '#9c9484'; c.fillRect(x + 1, y - 8, 6, 1); }
        }
        c.fillStyle = i === sel ? '#a33a2a' : reached ? '#3a2a20' : '#8b7a68';
        c.fillRect(x - 2, y - 1, 5, 3); c.fillRect(x - 1, y - 2, 3, 5);
        const lw = measureText(city.name);
        const lx = city.label === 'right' ? x + 5 : city.label === 'left' ? x - lw - 5 : x - Math.round(lw / 2);
        const ly = city.label === 'above' ? y - 20 : city.label === 'below' ? y + 5 : y - 2;
        drawText(c, city.name, Math.max(1, Math.min(319 - lw, lx)), ly, { color: reached ? '#2a1f18' : '#8b7a68' });
        if (save.items.includes(info.item)) {
          const mini = itemSprite(info.item) + 'Mini';
          if (!SPRITES[mini]) SPRITES[mini] = miniRows(itemSprite(info.item));
          blit(c, mini, x - 4, city.label === 'below' ? y - 22 : y + 4);
        }
      });
      // the traveller at the selected city
      const [sx, sy] = px(CITIES[sel].at);
      blit(c, (t >> 4) % 2 ? 'travellerWalk' : 'traveller', sx - 6, sy - (CITIES[sel].label === 'above' ? 46 : 30) + ((t >> 5) % 2));
      // caliphs revealed so far
      const known = [['Abbasid caliph', 'Baghdad', '#141018', 0], ['Fatimid caliph', 'Cairo', '#ffffff', 2], ['Umayyad caliph', 'Córdoba', '#b3261e', 4]].filter(k => maxLv >= k[3]);
      const ly0 = MH - 12 - known.length * 9;
      drawText(c, `983 CE · caliphs met: ${known.length}`, 4, ly0, { color: '#2a1f18' });
      known.forEach(([who, where, col], i) => {
        const y = ly0 + 10 + i * 9;
        c.fillStyle = col; c.fillRect(4, y, 6, 5); c.fillStyle = '#3a2a20'; c.fillRect(4, y + 5, 6, 1);
        drawText(c, `${who} · ${where} (${BANNER_NAME[col]})`, 13, y, { color: '#2a1f18' });
      });
      // panel
      const info = data.levels[sel];
      drawText(c, `Level ${sel + 1} · ${info.name}`, 6, MH + 6, { color: '#e8c45a' });
      wrapText(info.power, 308).slice(0, 2).forEach((l, i) => drawText(c, l, 6, MH + 16 + i * 9, { color: '#f3ead2' }));
      drawText(c, game.touch ? '◀ ▶ choose · Z travel · II title' : '← → choose · Enter travel · Esc title', 314, MH + 36, { align: 'right', color: '#b3a991' });
    },
  };
}
