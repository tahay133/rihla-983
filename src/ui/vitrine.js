// Vitrine ending: the five objects together in a museum case, with captions.
// Captions use gameData titles/dates; the short names are just display labels.
import { drawText, wrapText } from '../art/font.js';
import { blit, getSprite } from '../art/sprites.js';

const SHORT = {
  'bowl-samanid': 'Samanid bowl',
  'bowl-camels': 'Luster bowl',
  'tiraz-veil': 'Tiraz veil',
  'blue-quran': 'Blue Qur’an',
  'pyxis': 'Ivory pyxis',
};

export function createVitrineScene(game, { data, onCard, onDone }) {
  let sel = 0, t = 0;
  const items = data.levels.map(l => data.items.find(it => it.id === l.item));
  return {
    update(g) {
      t++;
      const inp = g.input;
      if (inp.pressed.left) sel = (sel + items.length - 1) % items.length;
      if (inp.pressed.right) sel = (sel + 1) % items.length;
      if (t > 40 && (inp.pressed.jump || inp.pressed.action)) onCard(items[sel]);
      if (t > 40 && inp.pressed.confirm) onDone();
    },
    render(c) {
      // gallery wall
      c.fillStyle = '#20202c'; c.fillRect(0, 0, 320, 180);
      for (let x = 0; x < 320; x += 40) { c.fillStyle = '#24242f'; c.fillRect(x, 0, 20, 180); }
      drawText(c, 'Journey complete', 160, 8, { align: 'center', scale: 2, color: '#e8c45a', shadow: '#5a3a12' });
      drawText(c, 'Five objects from five cities, now at The Met', 160, 26, { align: 'center', color: '#cbbd98' });
      // the case
      const cx = 14, cy = 40, cw = 292, ch = 76;
      c.fillStyle = '#3a2a20'; c.fillRect(cx - 3, cy + ch, cw + 6, 8);
      c.fillStyle = '#c9962b'; c.fillRect(cx - 3, cy + ch, cw + 6, 1);
      c.fillStyle = 'rgba(160,200,215,0.10)'; c.fillRect(cx, cy, cw, ch);
      c.fillStyle = 'rgba(220,240,250,0.35)'; c.fillRect(cx, cy, cw, 1); c.fillRect(cx, cy, 1, ch); c.fillRect(cx + cw - 1, cy, 1, ch);
      for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(cx + 20 + i, cy + 4 + i * 2, 1, 2); }
      items.forEach((it, i) => {
        const colW = cw / items.length, mx = Math.round(cx + colW * i + colW / 2);
        const s = getSprite(it.sprite);
        // plinth
        c.fillStyle = i === sel ? '#4a3a30' : '#3a2e28'; c.fillRect(mx - 20, cy + ch - 14, 40, 14);
        c.fillStyle = '#5a4838'; c.fillRect(mx - 20, cy + ch - 14, 40, 1);
        const bob = i === sel ? (t % 40 < 20 ? 0 : -1) : 0;
        blit(c, it.sprite, mx - s.w, cy + ch - 16 - s.h * 2 + bob, 1, 2);
        if (i === sel && t % 24 < 12) { c.fillStyle = '#fff6c8'; c.fillRect(mx + s.w + 2, cy + ch - 20 - s.h * 2, 1, 3); c.fillRect(mx + s.w + 1, cy + ch - 19 - s.h * 2, 3, 1); }
        // caption
        const lines = [SHORT[it.id] || it.title, ...wrapText(it.date, colW - 4).slice(0, 3)];
        lines.forEach((l, k) => drawText(c, l, mx, cy + ch + 11 + k * 8, { align: 'center', color: k === 0 ? (i === sel ? '#e8c45a' : '#f3ead2') : '#b3a991' }));
      });
      const cur = items[sel];
      const tl = wrapText(cur.title, 300), title = tl[0] + (tl.length > 1 ? '...' : '');
      c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(0, 160, 320, 20);
      drawText(c, title, 160, 162, { align: 'center', color: '#e8c45a' });
      drawText(c, '← → choose · Z view its card · Enter credits', 160, 172, { align: 'center', color: '#b3a991' });
    },
  };
}
