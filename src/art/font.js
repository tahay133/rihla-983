// Tiny bitmap font for in-canvas text: caps, digits, punctuation, arrows and the
// transliteration marks the game needs (Ḥ Ṣ Ṭ Ā Ī Ū Ó Í É, ʿ ʾ). 5 px cap height.
// Lowercase input is drawn in caps. Accents/dots are combining marks drawn in the
// rows above (−2) and below (+6) the glyph, so lines are 9 px apart.

const G = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.##.', '#..#', '#..#', '#.#.', '.#.#'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '##.'],
  ' ': ['..', '..', '..', '..', '..'],
  '.': ['.', '.', '.', '.', '#'],
  ',': ['.', '.', '.', '#', '#'],
  ':': ['.', '#', '.', '#', '.'],
  ';': ['.', '#', '.', '#', '#'],
  '!': ['#', '#', '#', '.', '#'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  "'": ['#', '#', '.', '.', '.'],
  '’': ['#', '#', '.', '.', '.'],
  '‘': ['#', '#', '.', '.', '.'],
  '"': ['#.#', '#.#', '...', '...', '...'],
  '“': ['#.#', '#.#', '...', '...', '...'],
  '”': ['#.#', '#.#', '...', '...', '...'],
  'ʿ': ['.#', '#.', '..', '..', '..'],
  'ʾ': ['#.', '.#', '..', '..', '..'],
  '-': ['...', '...', '###', '...', '...'],
  '–': ['....', '....', '####', '....', '....'],
  '—': ['.....', '.....', '#####', '.....', '.....'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  '=': ['...', '###', '...', '###', '...'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  '(': ['.#', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '#.'],
  '[': ['##', '#.', '#.', '#.', '##'],
  ']': ['##', '.#', '.#', '.#', '##'],
  '&': ['.#..', '#.#.', '.#.#', '#.#.', '.#.#'],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'],
  '*': ['#.#', '.#.', '#.#', '...', '...'],
  '#': ['#.#', '###', '#.#', '###', '#.#'],
  '×': ['...', '#.#', '.#.', '#.#', '...'],
  '·': ['.', '.', '#', '.', '.'],
  '•': ['..', '##', '##', '..', '..'],
  '←': ['.....', '.#...', '#####', '.#...', '.....'],
  '→': ['.....', '...#.', '#####', '...#.', '.....'],
  '↑': ['.#.', '###', '.#.', '.#.', '.#.'],
  '↓': ['.#.', '.#.', '.#.', '###', '.#.'],
  '♥': ['.#.#.', '#####', '#####', '.###.', '..#..'],
  '↵': ['...#', '...#', '.#.#', '####', '.#..'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'],
};
const UNKNOWN = ['###', '#.#', '#.#', '#.#', '###'];

// Combining marks (after NFD normalisation) → pixels relative to glyph (w = glyph width).
const MARKS = {
  '̣': w => [[w >> 1, 6]],                         // dot below  (Ḥ Ṣ Ṭ)
  '̱': w => Array.from({ length: w }, (_, i) => [i, 6]), // macron below (Ḏ etc.)
  '̄': w => Array.from({ length: w }, (_, i) => [i, -2]), // macron   (Ā Ī Ū)
  '́': w => [[w - 1, -2]],                          // acute    (Ó Í É)
  '̀': w => [[0, -2]],                              // grave
  '̈': w => [[0, -2], [w - 1, -2]],                 // diaeresis
};

export const LINE_H = 9;
export const CAP_H = 5;
const cache = new Map();

function layout(str) {
  // → [{g: rows, marks: [[x,y]...]}...]
  const out = [];
  const s = String(str).normalize('NFD').toUpperCase();
  for (const ch of s) {
    if (MARKS[ch]) {
      const last = out[out.length - 1];
      if (last) last.marks.push(...MARKS[ch](last.g[0].length));
      continue;
    }
    out.push({ ch, g: G[ch] || UNKNOWN, marks: [] });
  }
  return out;
}

export function measureText(str, scale = 1) {
  const gl = layout(str);
  let w = 0;
  gl.forEach((c, i) => { w += c.g[0].length + (i < gl.length - 1 ? 1 : 0); });
  return w * scale;
}

function glyphCanvas(c, color) {
  const key = c.ch + '|' + c.marks.join(';') + '|' + color;
  let cv = cache.get(key);
  if (cv) return cv;
  const w = c.g[0].length;
  cv = document.createElement('canvas');
  cv.width = w; cv.height = 9;          // rows −2..6 → 0..8
  const x = cv.getContext('2d');
  x.fillStyle = color;
  c.g.forEach((row, y) => { for (let i = 0; i < w; i++) if (row[i] === '#') x.fillRect(i, y + 2, 1, 1); });
  c.marks.forEach(([mx, my]) => x.fillRect(mx, my + 2, 1, 1));
  cache.set(key, cv);
  return cv;
}

// y is the top of the capital letters.
export function drawText(ctx, str, x, y, opt = {}) {
  const color = opt.color || '#f3ead2';
  const scale = opt.scale || 1;
  const gl = layout(str);
  let w = 0;
  gl.forEach((c, i) => { w += c.g[0].length + (i < gl.length - 1 ? 1 : 0); });
  let cx = Math.round(x - (opt.align === 'center' ? (w * scale) / 2 : opt.align === 'right' ? w * scale : 0));
  const cy = Math.round(y);
  if (opt.shadow) drawText(ctx, str, x + scale, y + scale, { ...opt, color: opt.shadow, shadow: null });
  for (const c of gl) {
    const cv = glyphCanvas(c, color);
    ctx.drawImage(cv, cx, cy - 2 * scale, cv.width * scale, cv.height * scale);
    cx += (cv.width + 1) * scale;
  }
  return w * scale;
}

// Greedy word wrap to a pixel width; honours '\n'.
export function wrapText(str, maxW, scale = 1) {
  const lines = [];
  String(str).split('\n').forEach(par => {
    let line = '';
    par.split(' ').forEach(word => {
      const t = line ? line + ' ' + word : word;
      if (measureText(t, scale) <= maxW || !line) line = t;
      else { lines.push(line); line = word; }
    });
    lines.push(line);
  });
  return lines;
}

export function drawLines(ctx, lines, x, y, opt = {}) {
  const lh = (opt.lineH || LINE_H) * (opt.scale || 1);
  lines.forEach((l, i) => drawText(ctx, l, x, y + i * lh, opt));
  return lines.length * lh;
}
