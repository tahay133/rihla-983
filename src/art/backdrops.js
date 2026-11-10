// Lines between the VERBATIM markers are copied unchanged from docs/handoff.html (#art-code).
// ---- VERBATIM START ----
/* ---------- backdrops.js ---------- */
// Far-parallax layers, drawn at 160x90. In-game: draw to an offscreen 160x90 canvas, then scale x2.
const BW = 160, BH = 90;
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function bands(c, list) { for (let i = 0; i < list.length; i++) { const y = list[i][0]; const y2 = i + 1 < list.length ? list[i + 1][0] : BH; R(c, 0, y, BW, y2 - y, list[i][1]); } }
function dome(c, cx, by, r, col) { for (let dy = 0; dy <= r; dy++) { const hw = Math.round(Math.sqrt(r * r - dy * dy)); R(c, cx - hw, by - dy - 1, hw * 2, 1, col); } }
function disc(c, cx, cy, r, col) { for (let dy = -r; dy <= r; dy++) { const hw = Math.round(Math.sqrt(r * r - dy * dy)); R(c, cx - hw, cy + dy, hw * 2, 1, col); } }
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function stars(c, n, maxY, col, seed) { const r = rng(seed); for (let i = 0; i < n; i++) R(c, Math.floor(r() * BW), Math.floor(r() * maxY), 1, 1, col); }
function ridge(c, baseY, amp, col, seed, step) { const r = rng(seed); let h = amp * 0.5; for (let x = 0; x < BW; x += step) { h = Math.max(2, Math.min(amp, h + (r() - 0.5) * amp * 0.7)); R(c, x, baseY - h, step, h, col); } }
function water(c, y, h, col, glint, seed) { R(c, 0, y, BW, h, col); const r = rng(seed); for (let i = 0; i < 22; i++) R(c, Math.floor(r() * (BW - 6)), y + 1 + Math.floor(r() * Math.max(1, h - 2)), 2 + Math.floor(r() * 5), 1, glint); }
function palm(c, x, by, h, trunk, leaf) { R(c, x, by - h, 1, h, trunk); R(c, x - 3, by - h, 7, 1, leaf); R(c, x - 5, by - h + 1, 3, 1, leaf); R(c, x + 3, by - h + 1, 3, 1, leaf); R(c, x - 1, by - h - 1, 3, 1, leaf); R(c, x - 6, by - h + 2, 1, 1, leaf); R(c, x + 6, by - h + 2, 1, 1, leaf); }
function crenel(c, x, y, w, col) { for (let i = 0; i < w - 1; i += 3) R(c, x + i, y - 2, 2, 2, col); }
function banner(c, x, y, col) { R(c, x, y, 1, 9, '#3a2a20'); R(c, x + 1, y, 5, 3, col); R(c, x + 1, y + 3, 3, 1, col); }
function camel(c, x, by, col) { R(c, x + 3, by - 7, 8, 3, col); R(c, x + 5, by - 9, 3, 2, col); R(c, x + 1, by - 8, 2, 3, col); R(c, x - 1, by - 9, 3, 2, col); R(c, x + 3, by - 4, 1, 4, col); R(c, x + 5, by - 4, 1, 4, col); R(c, x + 8, by - 4, 1, 4, col); R(c, x + 10, by - 4, 1, 4, col); R(c, x + 11, by - 7, 1, 2, col); }
function pyramid(c, cx, by, h, lit, shade) { for (let i = 0; i < h; i++) { const hw = h - i; R(c, cx - hw, by - i - 1, hw, 1, lit); R(c, cx, by - i - 1, hw, 1, shade); } }

const BACKDROPS = {
  // L1 — Samanid Bukhara at dusk: mausoleum, citadel, caravan
  bukhara(c) {
    bands(c, [[0, '#2a1f3d'], [16, '#45304f'], [30, '#7c4658'], [44, '#bf6a4f'], [56, '#e5a15e']]);
    stars(c, 16, 28, '#f3e6c8', 7);
    ridge(c, 66, 24, '#5b3c50', 3, 4);
    ridge(c, 70, 14, '#71485a', 11, 3);
    R(c, 0, 74, BW, 16, '#7a5232'); R(c, 0, 74, BW, 1, '#a06c42');
    // mud-brick citadel
    R(c, 4, 52, 40, 22, '#93653f'); crenel(c, 4, 52, 40, '#93653f');
    R(c, 6, 44, 9, 30, '#a3714a'); crenel(c, 6, 44, 9, '#a3714a');
    R(c, 33, 46, 9, 28, '#a3714a'); crenel(c, 33, 46, 9, '#a3714a');
    R(c, 21, 63, 7, 11, '#3a2618'); dome(c, 24.5, 63, 3, '#3a2618');
    banner(c, 9, 33, '#141018');
    // Samanid Mausoleum: brick cube, basket-weave, dome + corner cupolas
    const mx = 67, mw = 26, top = 52;
    R(c, mx, top, mw, 74 - top, '#b27b46');
    for (let y = top + 1; y < 74; y += 2) { for (let x = mx + ((y >> 1) & 1); x < mx + mw; x += 2) R(c, x, y, 1, 1, '#8d5b33'); }
    for (let x = mx + 2; x < mx + mw - 2; x += 3) R(c, x, top + 2, 2, 2, '#5e3a22');
    R(c, mx + 10, top + 9, 6, 13, '#4a2c1c'); dome(c, mx + 13, top + 9, 3, '#4a2c1c');
    R(c, mx - 1, top, 2, 74 - top, '#c48c54'); R(c, mx + mw - 1, top, 2, 74 - top, '#c48c54');
    dome(c, mx + mw / 2, top, 11, '#a56d3e');
    dome(c, mx, top, 2, '#a56d3e'); dome(c, mx + mw, top, 2, '#a56d3e');
    // caravan
    camel(c, 110, 74, '#3b2630'); camel(c, 124, 74, '#3b2630'); camel(c, 138, 74, '#3b2630');
  },

  // L2 — Baghdad: Round City wall & gate, Tigris, guffas, palms; distant Samarra minaret (artistic license)
  baghdad(c) {
    bands(c, [[0, '#6aa3c2'], [22, '#89bcd0'], [40, '#b9dcd8'], [52, '#e6e0bf']]);
    disc(c, 26, 16, 5, '#fff3c8');
    R(c, 0, 56, BW, 6, '#cdb98a');
    const sx = 140, tiers = [16, 13, 10, 8, 6, 4];
    let ty = 58;
    tiers.forEach((w, i) => { ty -= 4; R(c, sx - w / 2, ty, w, 4, i % 2 ? '#a58d63' : '#b9a27a'); R(c, sx - w / 2 + ((i * 3) % w), ty, 2, 1, '#8a7350'); });
    R(c, sx - 1, ty - 3, 2, 3, '#a58d63');
    R(c, 6, 50, 104, 12, '#c9a46b'); crenel(c, 6, 50, 104, '#c9a46b');
    for (let x = 10; x < 110; x += 12) { R(c, x - 3, 47, 6, 15, '#d4b27a'); dome(c, x, 47, 3, '#d4b27a'); }
    R(c, 50, 42, 16, 20, '#d9b984'); crenel(c, 50, 42, 16, '#d9b984');
    R(c, 54, 50, 8, 12, '#5a3f24'); dome(c, 58, 50, 4, '#5a3f24');
    banner(c, 50, 30, '#141018'); banner(c, 64, 30, '#141018');
    water(c, 62, 13, '#3d7d8c', '#8cc7cf', 5);
    R(c, 30, 67, 10, 2, '#5a3a22'); R(c, 31, 69, 8, 1, '#4a2e1a'); R(c, 34, 63, 2, 4, '#2e2018');
    R(c, 96, 71, 12, 2, '#5a3a22'); R(c, 97, 73, 10, 1, '#4a2e1a'); R(c, 101, 67, 2, 4, '#2e2018');
    R(c, 0, 75, BW, 15, '#a5874f'); R(c, 0, 75, BW, 1, '#bfa060');
    palm(c, 12, 78, 16, '#5c4026', '#3f6b3a'); palm(c, 124, 78, 18, '#5c4026', '#3f6b3a'); palm(c, 146, 79, 13, '#5c4026', '#4b7a44');
    R(c, 64, 80, 14, 3, '#b3402c'); R(c, 64, 83, 1, 7, '#5c4026'); R(c, 77, 83, 1, 7, '#5c4026');
    R(c, 84, 80, 14, 3, '#2f6f8a'); R(c, 84, 83, 1, 7, '#5c4026'); R(c, 97, 83, 1, 7, '#5c4026');
  },

  // L3 — Fatimid Cairo: pyramids across the Nile, felucca, al-Azhar arcade, white banners
  cairo(c) {
    bands(c, [[0, '#e39a45'], [18, '#ecb75e'], [36, '#f3d189'], [48, '#f7e4b3']]);
    disc(c, 124, 20, 7, '#fff2cc');
    R(c, 0, 50, BW, 6, '#d8b674');
    pyramid(c, 22, 52, 14, '#d6b06a', '#b38a4d');
    pyramid(c, 44, 52, 12, '#d6b06a', '#b38a4d');
    pyramid(c, 60, 52, 6, '#d6b06a', '#b38a4d');
    water(c, 56, 10, '#3a7d84', '#9fd0c8', 13);
    const fx = 34, fy = 62;
    R(c, fx, fy, 16, 2, '#4a2c1c'); R(c, fx + 2, fy + 2, 12, 1, '#3a2214');
    R(c, fx + 8, fy - 14, 1, 14, '#4a2c1c');
    for (let i = 0; i < 13; i++) R(c, fx + 8 - Math.floor(i * 0.55), fy - 14 + i, 1 + Math.floor(i * 0.7), 1, '#f6f0e2');
    R(c, 0, 66, BW, 24, '#c49d63'); R(c, 0, 66, BW, 1, '#d8b47a');
    [[4, 70, 14], [20, 68, 12], [34, 72, 16], [52, 69, 12], [66, 72, 12]].forEach(([x, y, w]) => {
      R(c, x, y, w, BH - y, '#d7b47e'); R(c, x, y, w, 1, '#e6c895'); R(c, x + 3, y + 4, 2, 3, '#6a4a2a'); R(c, x + w - 5, y + 4, 2, 3, '#6a4a2a');
    });
    const ax = 84, aw = 70, at = 62;
    R(c, ax, at, aw, BH - at, '#e3c893'); crenel(c, ax, at, aw, '#e3c893');
    for (let x = ax + 4; x < ax + aw - 4; x += 8) { R(c, x, at + 8, 4, 10, '#7a5934'); R(c, x + 1, at + 7, 2, 1, '#7a5934'); }
    dome(c, ax + aw / 2, at, 7, '#ecd6a6');
    banner(c, ax + 2, at - 13, '#ffffff'); banner(c, ax + aw - 7, at - 13, '#ffffff');
    palm(c, 78, 72, 14, '#5c4026', '#3f6b3a');
  },

  // L4 — Qayrawan at night: three-tier minaret, buttressed walls, Aghlabid basin, gold path
  qayrawan(c) {
    bands(c, [[0, '#0a0f2e'], [28, '#111946'], [48, '#1c2766'], [60, '#283777']]);
    stars(c, 44, 46, '#e8e2c8', 21); stars(c, 12, 40, '#e8c45a', 33);
    disc(c, 132, 15, 6, '#f2e6b8'); disc(c, 135, 13, 6, '#0a0f2e');
    R(c, 0, 66, BW, 24, '#3b3652');
    R(c, 52, 52, 100, 24, '#8d7852'); crenel(c, 52, 52, 100, '#8d7852');
    for (let x = 56; x < 150; x += 10) R(c, x, 55, 3, 21, '#776443');
    R(c, 96, 62, 8, 14, '#2a2440'); dome(c, 100, 62, 4, '#2a2440');
    dome(c, 130, 52, 5, '#a08b62'); dome(c, 114, 52, 4, '#a08b62');
    R(c, 30, 26, 22, 50, '#a8946a'); crenel(c, 30, 26, 22, '#a8946a');
    R(c, 34, 16, 14, 10, '#b4a176'); crenel(c, 34, 16, 14, '#b4a176');
    R(c, 37, 9, 8, 7, '#beac80'); dome(c, 41, 9, 4, '#beac80');
    R(c, 40, 33, 2, 5, '#221d3a'); R(c, 40, 44, 2, 5, '#221d3a'); R(c, 40, 55, 2, 5, '#221d3a'); R(c, 40, 19, 2, 4, '#221d3a');
    for (let dy = -5; dy <= 5; dy++) { const hw = Math.round(30 * Math.sqrt(1 - (dy * dy) / 30.25)); R(c, 28 - hw, 83 + dy, hw * 2, 1, '#776443'); }
    for (let dy = -3; dy <= 3; dy++) { const hw = Math.round(26 * Math.sqrt(1 - (dy * dy) / 12.25)); R(c, 28 - hw, 83 + dy, hw * 2, 1, '#2a3a8a'); }
    R(c, 24, 82, 8, 1, '#f2e6b8');
    for (let x = 62; x < 156; x += 7) R(c, x, 80 + ((x / 7 | 0) % 2), 3, 1, '#e8c45a');
    banner(c, 146, 41, '#ffffff');
  },

  // L5 — Umayyad Córdoba framed by a red-and-white horseshoe arch
  cordoba(c) {
    bands(c, [[0, '#ee9f68'], [20, '#f4bb84'], [38, '#f7d6a6'], [50, '#fae7c4']]);
    ridge(c, 54, 22, '#9a7f6e', 41, 4);
    ridge(c, 56, 12, '#a98d78', 57, 3);
    R(c, 16, 40, 20, 3, '#ecd8b0'); R(c, 12, 43, 28, 3, '#e2cb9e'); R(c, 8, 46, 36, 3, '#d8bd8c');
    R(c, 0, 54, BW, 10, '#c8af78');
    const mx = 72;
    R(c, mx, 44, 80, 20, '#d9b47c');
    for (let x = mx; x < mx + 80; x += 4) { R(c, x, 42, 3, 2, '#d9b47c'); R(c, x + 1, 41, 1, 1, '#d9b47c'); }
    for (let x = mx + 4; x < mx + 80; x += 9) R(c, x, 46, 2, 18, '#c49d66');
    for (let x = mx + 8; x < mx + 76; x += 9) { R(c, x, 52, 5, 8, '#6e4a2c'); dome(c, x + 2.5, 52, 3, '#6e4a2c'); }
    R(c, mx + 6, 21, 12, 23, '#cfa36c'); R(c, mx + 6, 21, 12, 1, '#e0b97f');
    R(c, mx + 10, 26, 4, 5, '#6e4a2c'); dome(c, mx + 12, 26, 2, '#6e4a2c');
    R(c, mx + 10, 35, 4, 5, '#6e4a2c'); dome(c, mx + 12, 35, 2, '#6e4a2c');
    R(c, mx + 9, 16, 6, 5, '#d6ab72');
    R(c, mx + 11, 8, 2, 8, '#8a6a40');
    R(c, mx + 11, 14, 2, 2, '#c9cdd3'); R(c, mx + 11, 11, 2, 2, '#c9cdd3'); R(c, mx + 11, 8, 2, 2, '#e8c45a');
    banner(c, mx + 30, 31, '#b3261e'); banner(c, mx + 66, 31, '#b3261e');
    water(c, 64, 9, '#4c7f8e', '#a9d1d1', 9);
    R(c, 0, 60, 64, 10, '#c7a46d'); R(c, 0, 60, 64, 1, '#dcbb84');
    for (let x = 4; x < 60; x += 12) { R(c, x, 65, 7, 5, '#4c7f8e'); dome(c, x + 3.5, 65, 3, '#4c7f8e'); }
    R(c, 0, 73, BW, 17, '#a88a5a'); R(c, 0, 73, BW, 1, '#c0a06a');
    // horseshoe-arch frame with alternating red/white voussoirs
    const cx = 80, cy = 44, rr = 44, th = 6, sx = 1.75;
    for (let y = 0; y < BH; y++) {
      for (let x = 0; x < BW; x++) {
        const dx = (x + 0.5 - cx) / sx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
        if (y <= cy + 10) {
          if (d > rr) R(c, x, y, 1, 1, '#4d3529');
          else if (d > rr - th) { const a = Math.atan2(dy, dx); const k = Math.floor((a + Math.PI) / (Math.PI / 16)); R(c, x, y, 1, 1, k % 2 ? '#a33a2a' : '#efe0c0'); }
        } else if (x < 8 || x >= BW - 8) {
          R(c, x, y, 1, 1, y <= cy + 13 ? '#d8c8a8' : '#8b7a68');
        }
      }
    }
  }
};
// ---- VERBATIM END ----

export { BW, BH, BACKDROPS, R, bands, dome, disc, rng, stars, ridge, water, palm, crenel, banner, camel, pyramid };
