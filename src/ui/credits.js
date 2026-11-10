// Credits: Met objects (with links), sources, and the artistic-license notes. DOM overlay
// so links work and long text stays readable; ↑/↓ scroll, Enter/Esc go back.
import { ARTISTIC_LICENSE, SOURCES, NOT_DRAWN } from '../data/credits.js';

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else e.setAttribute(k, v); }
  kids.flat().forEach(k => { if (k != null) e.append(k.nodeType ? k : document.createTextNode(k)); });
  return e;
}
const a = (href, text) => el('a', { href, target: '_blank', rel: 'noopener' }, text);

export function createCreditsScene(game, { root, data, onBack }) {
  const panel = el('section', { class: 'credits', tabindex: '-1', role: 'dialog', 'aria-label': 'Credits' },
    el('h2', {}, 'Riḥla 983 · Credits'),
    el('p', {}, 'A pixel-art platformer for MEIS-UA 640 / HIST-UA 542, Fall 2026. The pixel art, code and music are original. Object facts are paraphrased from The Met\u2019s collection pages.'),
    el('h3', {}, 'The five objects (The Met)'),
    el('ul', {}, data.items.map(it => el('li', {}, a(it.url, it.title), ` · ${it.date} · ${it.place} · Accession ${it.accession}`))),
    el('h3', {}, 'Artistic license'),
    el('ul', {}, ARTISTIC_LICENSE.map(t => el('li', {}, t))),
    el('h3', {}, 'Not drawn: the year is 983'),
    el('ul', {}, NOT_DRAWN.map(t => el('li', {}, t))),
    el('h3', {}, 'Sources for landmarks and banners'),
    el('ul', {}, SOURCES.map(([t, u]) => el('li', {}, a(u, t)))),
    el('p', { class: 'credits-small' }, 'Banner colours: Abbasid black and Fatimid white are well attested; the Córdoba red follows Maribel Fierro, as cited in a MESA abstract on Fatimid colour symbolism. No Met photographs are used; the sprites are simplified homages.'),
    el('p', { class: 'credits-small' }, 'Made with vanilla JavaScript and Canvas 2D. Sound is synthesised in the browser with WebAudio.'),
    el('p', { class: 'credits-hint' }, '↑ ↓ scroll · Enter or Esc: back'));
  root.append(panel);
  requestAnimationFrame(() => panel.classList.add('in'));
  panel.focus({ preventScroll: true });
  let t = 0, gone = false;
  const close = () => { if (gone) return; gone = true; panel.remove(); onBack(); };
  return {
    update(g) {
      t++;
      const inp = g.input;
      if (inp.held.down) panel.scrollTop += 2;
      if (inp.held.up) panel.scrollTop -= 2;
      if (t > 15 && (inp.pressed.confirm || inp.pressed.pause)) close();
    },
    render(c) {
      c.fillStyle = '#14121b'; c.fillRect(0, 0, 320, 180);
    },
    close,
  };
}
