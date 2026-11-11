// Museum card: slides in over the frozen level after an object is picked up.
// The sprite is drawn ×6 here (not the handoff page's ×8) so all three facts fit at 8 px
// without scrolling on the 320×180 screen.
// DOM overlay laid out in game pixels (320×180), so text stays crisp and the Met link is real.
// Shows cardText when it is non-empty, otherwise the facts bullets (see the course note in
// docs/handoff.html: cardText is left empty for the student to write).
import { drawSprite, SPRITES } from '../art/sprites.js';

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else e.setAttribute(k, v); }
  kids.flat().forEach(k => { if (k != null) e.append(k.nodeType ? k : document.createTextNode(k)); });
  return e;
}

export function spriteCanvas(name, scale) {
  const rows = SPRITES[name];
  const cv = document.createElement('canvas');
  cv.width = rows[0].length; cv.height = rows.length;
  cv.style.width = cv.width * scale + 'px';
  cv.style.height = cv.height * scale + 'px';
  cv.className = 'px';
  drawSprite(cv.getContext('2d'), name, 0, 0);
  return cv;
}

// Returns a scene-like object: update(game) → 'close' when dismissed; render(ctx) draws the dim.
export function openCard(root, item, { levelLabel, onClose } = {}) {
  const body = item.cardText && item.cardText.trim()
    ? el('p', { class: 'card-own' }, item.cardText.trim())
    : el('ul', { class: 'card-facts' }, item.facts.map(f => el('li', {}, f)));
  const link = el('a', { href: item.url, target: '_blank', rel: 'noopener' }, 'Met object page ↗');
  const text = el('div', { class: 'card-text', tabindex: '0' },
    el('h2', { id: 'card-title' }, item.title),
    el('p', { class: 'card-meta' }, `${item.date} · ${item.place}`),
    el('p', { class: 'card-meta' }, `Accession ${item.accession} · ${item.where} · `, link),
    body);
  const card = el('section', { class: 'card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'card-title', 'aria-description': levelLabel || '', tabindex: '-1' },
    el('div', { class: 'card-art' }, spriteCanvas(item.sprite, 6)),
    text,
    el('div', { class: 'card-unlock' }, el('b', {}, 'Unlocked: '), item.unlock),
    el('div', { class: 'card-hint' }, matchMedia('(pointer: coarse)').matches ? 'Z / tap here to continue' : 'Enter ↵ continue'));
  root.append(card);
  requestAnimationFrame(() => card.classList.add('in'));
  card.focus({ preventScroll: true });

  let t = 0, closing = false;
  const close = () => {
    if (closing) return;
    closing = true;
    card.classList.remove('in');
    setTimeout(() => card.remove(), 260);
    if (onClose) onClose();
  };
  card.addEventListener('click', e => { if (e.target.closest('.card-hint')) close(); });

  return {
    el: card,
    update(game) {
      t++;
      const inp = game.input;
      if (inp.held.down) text.scrollTop += 2;
      if (inp.held.up) text.scrollTop -= 2;
      if (t > 30 && (inp.pressed.confirm || inp.pressed.pause || inp.pressed.jump)) close();
      return closing;
    },
    close,
  };
}
