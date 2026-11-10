// Title screen: the night sky over Qayrawan, the traveller, and the journey menu.
import { drawText } from '../art/font.js';
import { blit } from '../art/sprites.js';
import { BACKDROPS, BW, BH } from '../art/backdrops.js';

let bg = null;
function backdrop() {
  if (bg) return bg;
  const far = document.createElement('canvas'); far.width = BW; far.height = BH;
  BACKDROPS.qayrawan(far.getContext('2d'));
  bg = far;
  return bg;
}

// items: [{label, act, confirm?}]
export function createTitleScene(game, { items, note }) {
  let sel = 0, t = 0, confirming = null;
  return {
    update(g) {
      t++;
      const inp = g.input;
      if (confirming) {
        if (inp.pressed.confirm) { const c = confirming; confirming = null; c.act(); }
        else if (inp.pressed.pause || inp.pressed.left || inp.pressed.right) confirming = null;
        return;
      }
      if (inp.pressed.up) { sel = (sel + items.length - 1) % items.length; game.sfx && game.sfx('tick'); }
      if (inp.pressed.down) { sel = (sel + 1) % items.length; game.sfx && game.sfx('tick'); }
      if (t > 8 && (inp.pressed.confirm || (inp.pressed.jump && !inp.held.up))) {
        const it = items[sel];
        if (it.confirm) confirming = it; else it.act();
        game.sfx && game.sfx('select');
      }
    },
    render(c) {
      c.imageSmoothingEnabled = false;
      c.drawImage(backdrop(), 0, 0, 320, 180);
      c.fillStyle = 'rgba(8,10,30,0.45)'; c.fillRect(0, 0, 320, 180);
      c.fillStyle = 'rgba(8,10,30,0.6)'; c.fillRect(0, 120, 320, 60);
      drawText(c, 'Riḥla 983', 160, 26, { align: 'center', scale: 4, color: '#e8c45a', shadow: '#5a3a12' });
      drawText(c, 'A traveller crosses the Islamic world in 983 CE', 160, 56, { align: 'center', color: '#f3ead2' });
      drawText(c, 'from Bukhara to Córdoba, one caliph to three', 160, 65, { align: 'center', color: '#cbbd98' });
      blit(c, (t >> 4) % 2 ? 'travellerWalk' : 'traveller', 46, 104, 1, 2);
      items.forEach((it, i) => {
        const y = 92 + i * 11, on = i === sel;
        if (on) { c.fillStyle = 'rgba(232,196,90,0.18)'; c.fillRect(96, y - 3, 128, 11); }
        drawText(c, (on ? '> ' : '  ') + it.label, 104, y, { color: on ? '#e8c45a' : '#f3ead2' });
      });
      if (confirming) {
        c.fillStyle = 'rgba(20,14,24,0.92)'; c.fillRect(60, 70, 200, 40);
        c.fillStyle = '#a33a2a'; c.fillRect(60, 70, 200, 1); c.fillRect(60, 109, 200, 1);
        drawText(c, confirming.confirm, 160, 80, { align: 'center', color: '#f3ead2' });
        drawText(c, 'Enter: yes · Esc: no', 160, 94, { align: 'center', color: '#cbbd98' });
      }
      drawText(c, '← → move · Z / Space / ↑ jump · X action · Esc pause · M mute', 160, 160, { align: 'center', color: '#b3a991' });
      if (note) drawText(c, note, 160, 170, { align: 'center', color: '#8ea6e8' });
    },
  };
}

// Pause overlay drawn over the frozen level.
export function createPauseScene(game, { under, items }) {
  let sel = 0, t = 0;
  return {
    update(g) {
      t++;
      const inp = g.input;
      if (inp.pressed.up) sel = (sel + items.length - 1) % items.length;
      if (inp.pressed.down) sel = (sel + 1) % items.length;
      if (t > 4 && inp.pressed.pause) items[0].act();
      else if (t > 4 && (inp.pressed.confirm || inp.pressed.jump)) items[sel].act();
    },
    render(c) {
      under.render(c);
      c.fillStyle = 'rgba(10,8,16,0.7)'; c.fillRect(0, 0, 320, 180);
      drawText(c, 'Paused', 160, 50, { align: 'center', scale: 2, color: '#e8c45a' });
      items.forEach((it, i) => {
        const on = i === sel, y = 78 + i * 12;
        drawText(c, (on ? '> ' : '  ') + (typeof it.label === 'function' ? it.label() : it.label), 112, y, { color: on ? '#e8c45a' : '#f3ead2' });
      });
    },
  };
}
