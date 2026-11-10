// Parallax: far layer = handoff BACKDROPS[name] (160×90 drawn ×2, repeated, 0.2×);
// mid (0.5×) and near (0.8×) = 640×180 strips painted here from each level's landmark list.
// Strips are painted three times (x−640, x, x+640) so they tile seamlessly.
// Nothing from a level's "Do not draw" list appears: no turquoise/ribbed domes, no pencil
// minarets, no Green Dome, no minarets at all in Cairo, no Alhambra or cathedral.
import { BACKDROPS, BW, BH, R, dome, crenel, banner, palm, rng } from './backdrops.js';

const SW = 640, SH = 180;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function strip(painter) {
  const cv = mk(SW, SH), c = cv.getContext('2d');
  for (const off of [-SW, 0, SW]) { c.save(); c.translate(off, 0); painter(c); c.restore(); }
  return cv;
}

// ---- shared shapes ----
function pointedArch(c, x, top, w, h, col) {           // a dark pointed-arch opening
  R(c, x, top + 2, w, h - 2, col);
  for (let i = 0; i < Math.ceil(w / 2); i++) R(c, x + i, top + 2 - Math.min(2, Math.floor(i / 1.5)), w - i * 2, 1, col);
}
function horseshoeArch(c, cx, spring, r, red, white, inner) {   // red/white voussoirs (Córdoba)
  for (let y = -r - 2; y <= r * 0.5; y++) {
    for (let x = -r - 2; x <= r + 2; x++) {
      const d = Math.hypot(x, y);
      if (y > 0 && Math.abs(x) > r * 0.86 + 2) continue;
      if (d <= r - 0.5) { if (y <= r * 0.5) R(c, cx + x, spring + y, 1, 1, inner); }
      else if (d <= r + 2.2) { const a = Math.atan2(y, x); const k = Math.floor((a + Math.PI) / (Math.PI / 9)); R(c, cx + x, spring + y, 1, 1, k % 2 ? red : white); }
    }
  }
  R(c, cx - Math.round(r * 0.86), spring + Math.round(r * 0.5), Math.round(r * 1.72) + 1, 40, inner);
}
function bigPalm(c, x, by, h, trunk, leaf) {
  for (let i = 0; i < h; i++) R(c, x + Math.round(Math.sin(i / 9) * 1.5), by - i, 2, 1, i % 4 === 0 ? leaf : trunk);
  const tx = x + Math.round(Math.sin(h / 9) * 1.5), ty = by - h;
  const fr = [[-10, 3], [-7, 5], [-4, 6], [4, 6], [7, 5], [10, 3], [-8, -2], [8, -2]];
  fr.forEach(([dx, dy]) => { const n = Math.abs(dx); for (let i = 0; i <= n; i++) R(c, tx + Math.round((dx * i) / n), ty + Math.round((dy * i * i) / (n * n)) - 1, 2, 1, leaf); });
  R(c, tx - 1, ty - 2, 4, 3, leaf);
}
function poplar(c, x, by, h, col) {
  for (let i = 0; i < h; i++) { const w = i < 4 ? 1 : Math.max(1, Math.round(3.5 - Math.abs(i - h * 0.55) / (h * 0.2))); R(c, x - w, by - i, w * 2 + 1, 1, col); }
}
function cypress(c, x, by, h, col) {
  for (let i = 0; i < h; i++) { const w = Math.max(0, Math.round(Math.min(3, (h - i) / 4))); R(c, x - w, by - i, w * 2 + 2, 1, col); }
}
function olive(c, x, by, col, trunk) {
  R(c, x, by - 8, 2, 8, trunk); R(c, x - 2, by - 6, 2, 1, trunk);
  [[-7, -14, 8, 5], [-2, -17, 10, 6], [3, -13, 8, 5], [-5, -11, 14, 4]].forEach(([a, b, w, h]) => R(c, x + a, by + b, w, h, col));
}
function house(c, x, by, w, h, wall, dark, win, opt = {}) {
  R(c, x, by - h, w, h, wall);
  if (opt.parapet) R(c, x - 1, by - h - 2, w + 2, 2, opt.parapet);
  for (let i = 4; i < w - 4; i += 7) R(c, x + i, by - h + 5, 2, 3, win);
  R(c, x + Math.floor(w / 2) - 2, by - 8, 4, 8, dark);
}

// ---- per-city strips ----
const CITY = {
  // L1 Bukhara & the Samarkand road: mud-brick citadel, brick houses, Arab-Ata Mausoleum
  // (portal + dome, brand new in 983), poplars. Plain brick only: no tiles, no blue.
  bukhara: {
    mid(c) {
      const wall = '#6e4656', lit = '#80525e', dk = '#4a2f3e';
      // citadel: sloping mud-brick walls with round towers
      for (let i = 0; i < 10; i++) R(c, 10 + i, 128 + i * 2, 190 - i * 2, 2, wall);
      R(c, 20, 146, 170, 34, wall); crenel(c, 20, 128, 170, wall); R(c, 20, 126, 170, 2, wall);
      for (let x = 24; x < 196; x += 44) { R(c, x - 5, 118, 11, 62, lit); dome(c, x + 0.5, 118, 5, lit); R(c, x - 1, 128, 2, 4, dk); }
      R(c, 96, 148, 12, 32, dk); dome(c, 102, 148, 6, dk);
      banner(c, 112, 102, '#141018');
      // houses
      const r = rng(41);
      for (let x = 222; x < 410; x += 18 + Math.floor(r() * 8)) house(c, x, 158, 16 + Math.floor(r() * 6), 14 + Math.floor(r() * 14), r() > 0.5 ? wall : lit, dk, '#a86a52', { parapet: dk });
      // Arab-Ata Mausoleum (977–78): tall brick portal in front of a domed square hall
      const mx = 440;
      R(c, mx - 4, 116, 58, 42, '#7a4e52');
      dome(c, mx + 25, 116, 16, '#7a4e52');
      R(c, mx + 6, 96, 38, 62, '#8d5c5c');
      for (let y = 98; y < 158; y += 3) for (let x = mx + 7 + ((y / 3) & 1); x < mx + 43; x += 3) R(c, x, y, 1, 1, '#6e4646');
      R(c, mx + 6, 96, 38, 2, '#a06c62'); R(c, mx + 8, 100, 34, 1, '#a06c62');
      R(c, mx + 15, 112, 20, 46, '#3a2430'); dome(c, mx + 25, 112, 10, '#3a2430');
      R(c, mx + 20, 132, 10, 26, '#2a1824'); dome(c, mx + 25, 132, 5, '#2a1824');
      R(c, mx + 3, 158, 44, 2, dk);
      // poplars
      for (let x = 520; x < 630; x += 14) poplar(c, x, 160, 40 + ((x * 7) % 16), x % 28 ? '#5b3c50' : '#4f3446');
      R(c, 0, 158, SW, 22, dk);
    },
    near(c) {
      const col = '#3b2630', hi = '#4a3038';
      R(c, 0, 168, SW, 12, col);
      const r = rng(9);
      for (let x = 0; x < SW; x += 60 + Math.floor(r() * 50)) {
        if (r() > 0.5) { R(c, x, 150, 36, 18, hi); crenel(c, x, 150, 36, hi); R(c, x + 14, 158, 6, 10, col); }
        else for (let i = 0; i < 3; i++) R(c, x + i * 4 - 4, 160 - i * 3, 14 - i * 2, 9, col); // tamarisk
      }
    },
  },

  // L2 Baghdad: Round City wall with towers and a gate, black banners, the markets of
  // al-Karkh with cloth awnings, date palms. No Green Dome, no minarets.
  baghdad: {
    mid(c) {
      const wall = '#b49a6c', lit = '#c4ab7c', dk = '#8a7350';
      R(c, 0, 120, 300, 40, wall); crenel(c, 0, 120, 300, wall);
      for (let x = 12; x < 300; x += 36) { R(c, x - 5, 112, 11, 48, lit); dome(c, x + 0.5, 112, 5, lit); }
      // gate with its domed chamber
      R(c, 132, 100, 40, 60, lit); crenel(c, 132, 100, 40, lit);
      R(c, 142, 124, 20, 36, '#5a3f24'); dome(c, 152, 124, 10, '#5a3f24');
      dome(c, 152, 100, 9, '#c9b085');
      banner(c, 134, 86, '#141018'); banner(c, 164, 86, '#141018');
      // al-Karkh markets
      const r = rng(77);
      const aw = [['#a33a2a', '#efe0c0'], ['#2f4f8a', '#efe0c0'], ['#a8791f', '#f3ead2']];
      for (let x = 316; x < 620; x += 26 + Math.floor(r() * 10)) {
        const h = 16 + Math.floor(r() * 16);
        house(c, x, 160, 22, h, r() > 0.5 ? '#c9ad7d' : '#b8996a', '#6a5034', '#5a4630', { parapet: dk });
        const [a, b] = aw[Math.floor(r() * 3)];
        for (let i = 0; i < 26; i += 4) { R(c, x - 2 + i, 146, 2, 4, a); R(c, x + i, 146, 2, 4, b); }
      }
      for (let x = 300; x < 640; x += 90) palm(c, x, 150, 26, '#6a5034', '#4f7a44');
      R(c, 0, 158, SW, 22, dk);
    },
    near(c) {
      const r = rng(5);
      for (let x = 10; x < SW; x += 70 + Math.floor(r() * 60)) bigPalm(c, x, 180, 44 + Math.floor(r() * 18), '#4a3826', '#2f5a30');
      for (let x = 0; x < SW; x += 6) R(c, x, 172 - ((x * 13) % 5), 2, 8, '#3f5a2f');
    },
  },

  // L3 Fatimid Cairo: al-Azhar's arcades and stepped crenellations, the walls of Ibn Ṭūlūn
  // (no minaret: its spiral is a 1296 rebuild), white banners on palace walls, palms.
  cairo: {
    mid(c) {
      const wall = '#e3c893', lit = '#ecd6a6', dk = '#7a5934';
      // al-Azhar
      R(c, 10, 118, 220, 42, wall);
      for (let x = 10; x < 230; x += 5) { R(c, x, 114, 3, 4, wall); R(c, x + 1, 112, 1, 2, wall); }
      for (let x = 18; x < 222; x += 10) pointedArch(c, x, 128, 6, 18, dk);
      dome(c, 120, 118, 10, lit); R(c, 110, 118, 21, 2, lit);
      banner(c, 12, 100, '#ffffff'); banner(c, 222, 100, '#ffffff');
      // palace wall with white banners
      R(c, 240, 126, 60, 34, '#d7b47e'); crenel(c, 240, 126, 60, '#d7b47e');
      banner(c, 252, 110, '#ffffff'); banner(c, 280, 110, '#ffffff');
      // Ibn Ṭūlūn: long arcaded wall, small pointed windows high up, openwork cresting
      R(c, 330, 112, 200, 48, '#d6b27a');
      for (let x = 332; x < 528; x += 6) { R(c, x, 106, 4, 6, '#d6b27a'); R(c, x + 1, 104, 2, 2, '#d6b27a'); R(c, x + 1, 108, 2, 2, '#b48d58'); }
      for (let x = 340; x < 524; x += 12) pointedArch(c, x, 118, 5, 10, '#8a6a40');
      for (let x = 346; x < 520; x += 24) pointedArch(c, x, 136, 9, 24, dk);
      // houses and palms
      const r = rng(23);
      for (let x = 540; x < 630; x += 22) house(c, x, 160, 20, 16 + Math.floor(r() * 12), '#d7b47e', '#6a4a2a', '#8a6a40');
      for (let x = 236; x < 330; x += 30) palm(c, x, 152, 24, '#6a4a2a', '#4f7a44');
      R(c, 0, 158, SW, 22, '#b38a4d');
    },
    near(c) {
      const r = rng(31);
      for (let x = 20; x < SW; x += 80 + Math.floor(r() * 50)) bigPalm(c, x, 180, 46 + Math.floor(r() * 16), '#5c4026', '#2f6a3a');
      for (let x = 0; x < SW; x += 90) { R(c, x + 40, 162, 30, 18, '#a8824f'); R(c, x + 50, 168, 6, 12, '#5c4026'); }
    },
  },

  // L4 Qayrawan by night: moonlit flat-roofed houses with lamplit windows, the mosque's
  // buttressed walls, an Aghlabid basin's round rim, al-Manṣūriyya's round walls far off,
  // olive trees and palms. No pencil minarets, no white-domed zawiyas.
  qayrawan: {
    mid(c) {
      const wall = '#3a4274', lit = '#4a5488', dk = '#232a52', lamp = '#e8c45a';
      // al-Manṣūriyya: a low ring of walls and towers on the horizon
      R(c, 300, 128, 120, 10, '#2e3666');
      for (let x = 304; x < 420; x += 12) R(c, x, 124, 5, 14, '#343c6e');
      // houses
      const r = rng(13);
      for (let x = 0; x < 280; x += 20 + Math.floor(r() * 8)) {
        const h = 16 + Math.floor(r() * 18);
        R(c, x, 160 - h, 20, h, r() > 0.4 ? lit : wall);
        if (r() > 0.4) R(c, x + 6, 160 - h + 6, 2, 3, lamp);
        if (r() > 0.6) R(c, x + 13, 160 - h + 10, 2, 3, lamp);
      }
      // the Great Mosque's buttressed wall
      R(c, 430, 120, 150, 40, '#5e5848'); crenel(c, 430, 120, 150, '#5e5848');
      for (let x = 434; x < 580; x += 12) R(c, x, 124, 4, 36, '#4e4a3c');
      R(c, 498, 136, 10, 24, '#1c2040'); dome(c, 503, 136, 5, '#1c2040');
      banner(c, 572, 104, '#ffffff');
      // Aghlabid basin rim
      for (let x = 586; x < 640; x += 9) dome(c, x, 156, 4, '#4e4a3c');
      R(c, 584, 152, 56, 8, '#4e4a3c');
      R(c, 0, 158, SW, 22, dk);
    },
    near(c) {
      const r = rng(3);
      for (let x = 10; x < SW; x += 50 + Math.floor(r() * 60)) {
        if (r() > 0.45) olive(c, x, 178, '#1c2a3a', '#14141f');
        else bigPalm(c, x, 180, 40 + Math.floor(r() * 12), '#14141f', '#16263a');
      }
      R(c, 0, 176, SW, 4, '#10121f');
    },
  },

  // L5 Umayyad Córdoba: the Great Mosque's buttressed wall with horseshoe-arched doors in
  // red-and-white voussoirs, stepped merlons, red banners, houses, cypresses and palms.
  // No Alhambra, no cathedral, no 987 extension; the single minaret stays in the far layer.
  cordoba: {
    mid(c) {
      const wall = '#d9b47c', but = '#c49d66', dk = '#6e4a2c';
      R(c, 0, 116, 380, 44, wall);
      for (let x = 0; x < 380; x += 6) { R(c, x + 1, 112, 4, 4, wall); R(c, x + 2, 110, 2, 2, wall); }
      for (let x = 4; x < 380; x += 38) R(c, x, 116, 6, 44, but);
      for (let x = 30; x < 370; x += 76) horseshoeArch(c, x + 6, 136, 9, '#a33a2a', '#efe0c0', '#4d3529');
      banner(c, 60, 96, '#b3261e'); banner(c, 212, 96, '#b3261e'); banner(c, 340, 96, '#b3261e');
      // houses
      const r = rng(61);
      for (let x = 392; x < 600; x += 24 + Math.floor(r() * 6)) {
        const h = 16 + Math.floor(r() * 14);
        house(c, x, 160, 22, h, r() > 0.5 ? '#efe0c0' : '#e2cb9e', dk, '#8a6a40');
        if (r() > 0.5) for (let i = 0; i < 4; i++) R(c, x - 1 + i, 160 - h - 4 + i, 24 - i * 2, 1, '#a35a3a');
      }
      for (let x = 600; x < 640; x += 14) cypress(c, x, 158, 34, '#4a5a34');
      R(c, 0, 158, SW, 22, '#a88a5a');
    },
    near(c) {
      const r = rng(17);
      for (let x = 10; x < SW; x += 60 + Math.floor(r() * 50)) {
        if (r() > 0.4) cypress(c, x, 180, 50 + Math.floor(r() * 14), '#2f3d24');
        else bigPalm(c, x, 180, 48, '#4a3826', '#2f5a30');
      }
      for (let x = 0; x < SW; x += 120) { R(c, x + 30, 166, 50, 14, '#8b7a68'); for (let i = 0; i < 50; i += 5) R(c, x + 31 + i, 163, 3, 3, '#8b7a68'); }
    },
  },
};

export function buildParallax(name) {
  const far = mk(BW, BH);
  BACKDROPS[name](far.getContext('2d'));
  // Far strip: the backdrop ×2, repeated every 320 px. (Mirroring would put a landmark's
  // reflection right next to it at the seam, e.g. two Samarra minarets side by side.)
  const farStrip = mk(BW * 2, BH * 2), f = farStrip.getContext('2d');
  f.imageSmoothingEnabled = false;
  f.drawImage(far, 0, 0, BW * 2, BH * 2);
  const city = CITY[name];
  return {
    name,
    far: farStrip,
    farColor: (() => { const d = far.getContext('2d').getImageData(0, 0, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; })(),
    mid: strip(city.mid),
    near: strip(city.near),
  };
}

function tile(ctx, img, ox, y) {
  const w = img.width;
  const o = ((ox % w) + w) % w;
  for (let x = -o; x < 320; x += w) ctx.drawImage(img, x, y);
}

// baseY: the camera y at which layers sit at rest (the lowest camera position).
// shift: moves mid/near so their ground line sits behind the level's ground at rest.
export function drawParallax(ctx, px, camX, camY, baseY, shift = 0) {
  ctx.fillStyle = px.farColor;
  ctx.fillRect(0, 0, 320, 180);
  const lift = Math.max(0, baseY - camY);
  tile(ctx, px.far, Math.floor(camX * 0.2), Math.round(lift * 0.05));
  tile(ctx, px.mid, Math.floor(camX * 0.5), shift + Math.round(lift * 0.5));
  tile(ctx, px.near, Math.floor(camX * 0.8), shift + Math.round(lift * 0.8));
}
