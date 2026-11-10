import { PALETTE } from './palette.js';

// Lines between the VERBATIM markers are copied unchanged from docs/handoff.html (#art-code).
// ---- VERBATIM START ----
/* ---------- sprites.js ---------- */
// '.' = transparent. Every row in a sprite has the same length.
const SPRITES = {
  traveller: [
    '....UUUU....',
    '...UUUUUU...',
    '...uUUUUUu..',
    '....TTTTT...',
    '....TTTKT...',
    '....nTTTT...',
    '....nnnn....',
    '...BBBBBB...',
    '..BBBBBBBB..',
    '..BYYYYYYB..',
    '..BBBBBBBBTn',
    '...BBBBBB..n',
    '...BBBBBB..n',
    '...BB..BB..n',
    '...nn..nn..n',
    '..nnn..nnn.n'
  ],
  travellerWalk: [
    '....UUUU....',
    '...UUUUUU...',
    '...uUUUUUu..',
    '....TTTTT...',
    '....TTTKT...',
    '....nTTTT...',
    '....nnnn....',
    '...BBBBBB...',
    '..BBBBBBBB..',
    '..BYYYYYYB..',
    '..BBBBBBBBTn',
    '...BBBBBB..n',
    '...BBBBBB..n',
    '..BB....BB.n',
    '.nn......nnn',
    'nnn......nnn'
  ],
  bowlSamanid: [
    '.....wwwwww.....',
    '...wwWWWWWWww...',
    '..wWWKWKKWKWWw..',
    '.wWKWKWWWWKWKWw.',
    '.wWKWWWWWWWWKWw.',
    'wWKKWWWWWWWWKKWw',
    'wWWWWWWWWWWWWWWw',
    'wWKWWWWKKWWWWKWw',
    'wWKWWWWKKWWWWKWw',
    'wWWWWWWWWWWWWWWw',
    'wWKKWWWWWWWWKKWw',
    '.wWKWWWWWWWWKWw.',
    '.wWKWKWWWWKWKWw.',
    '..wWWKWKKWKWWw..',
    '...wwWWWWWWww...',
    '.....wwwwww.....'
  ],
  bowlCamels: [
    '.....gggggg.....',
    '...ggGGGGGGgg...',
    '..gGGWWWWWWGGg..',
    '.gGGWWWWWWWWGGg.',
    '.gGWWWWWWWWWWGg.',
    'gGWWWWWWWWWGGWGg',
    'gGWWWWGGWWWGWWGg',
    'gGWWWGGGGWWGWWGg',
    'gGWWGGGGGGGGWWGg',
    'gGWWGGGGGGGWWWGg',
    'gGWWGWGWWGWGWWGg',
    '.gGWGWGWWGWGWGg.',
    '.gGGWWWWWWWWGGg.',
    '..gGGWWWWWWGGg..',
    '...ggGGGGGGgg...',
    '.....gggggg.....'
  ],
  tiraz: [
    '.wwwwwwwwwwwwww.',
    'wWWWWWWWWWWWWWWw',
    'wWnWWnWnWWnWWnWw',
    'wWnnnnnnnnnnnnWw',
    'wWWWWWWWWWWWWWWw',
    'wWWRWWWRWWWRWWWw',
    'wWWWWWWWWWWWWWWw',
    'wWnnnnnnnnnnnnWw',
    'wWnWWnWnWWnWWnWw',
    'wWWWWWWWWWWWWWWw',
    'wwwwwwwwwwwwwwww',
    'w.w.w.w.w.w.w.w.'
  ],
  blueQuran: [
    'bbbbbbbbbbbbbbbb',
    'bBBBBBBBBBBBBBBb',
    'bBYYYBYYYYBYYYBb',
    'bBBBBBBBBBBBBBBb',
    'bBYYBYYYSBYYYYBb',
    'bBBBBBBBBBBBBBBb',
    'bBYYYYBYYBYYYBBb',
    'bBBBBBBBBBBBBBBb',
    'bBYYBYYYYBYYYYBb',
    'bBBBBBBBBBBBBBBb',
    'bBYYYBYYBYYYYYBb',
    'bbbbbbbbbbbbbbbb'
  ],
  pyxis: [
    '.....nn.....',
    '.....ii.....',
    '...iiIIii...',
    '..iIIIIIIi..',
    '.iIInIInIIi.',
    '.iIIIIIIIIi.',
    'innnnnnnnnni',
    'iIInIIInIIIi',
    'iInIIInIInIi',
    'iIInnIInnIIi',
    'iIIIInIIIIIi',
    'iInIIInIInIi',
    'iIInIIInIIIi',
    'iIIIIIIIIIIi',
    'innnnnnnnnni',
    '.iiiiiiiiii.'
  ]
};

function drawSprite(ctx, name, ox, oy) {
  const rows = SPRITES[name];
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      ctx.fillStyle = PALETTE[ch];
      ctx.fillRect((ox || 0) + x, (oy || 0) + y, 1, 1);
    }
  }
}
// ---- VERBATIM END ----

// ---- Extensions for the game (new sprites; the originals above are unchanged) ----
Object.assign(SPRITES, {
  heart: [
    '.HH.HH.',
    'HPHHHHH',
    'HHHHHHH',
    '.HHHHH.',
    '..HHH..',
    '...H...'
  ],
  heartEmpty: [
    '.hh.hh.',
    'h..h..h',
    'h.....h',
    '.h...h.',
    '..h.h..',
    '...h...'
  ],
  scorpion: [
    '...XXX..........',
    '..X...X.........',
    '..X....K........',
    '...X............',
    '....XXxxxxX..X.X',
    '.....XxxxxxXXXX.',
    '....X.X.X.X.....',
    '...X.X.X.X......'
  ],
  scorpionWalk: [
    '...XXX..........',
    '..X...X.........',
    '..X....K........',
    '...X............',
    '....XXxxxxX..X.X',
    '.....XxxxxxXXXX.',
    '.....X.X.X.X....',
    '.....X.X.X.X....'
  ],
  guard: [
    '.....SS.....',
    '....SSSS...S',
    '...SSSSSS..S',
    '....TTTT...n',
    '....TTKT...n',
    '....TTTT...n',
    '...QQQQQQ..n',
    '..QQQQQQQQTn',
    '..QQQQQQQQ.n',
    '..QQnnnnQQ.n',
    '...QQQQQQ..n',
    '...QQQQQQ..n',
    '...kk..kk..n',
    '...kk..kk..n',
    '...nn..nn..n',
    '..nnn..nnn.n'
  ],
  guardWalk: [
    '.....SS.....',
    '....SSSS...S',
    '...SSSSSS..S',
    '....TTTT...n',
    '....TTKT...n',
    '....TTTT...n',
    '...QQQQQQ..n',
    '..QQQQQQQQTn',
    '..QQQQQQQQ.n',
    '..QQnnnnQQ.n',
    '...QQQQQQ..n',
    '...QQQQQQ..n',
    '..kk....kk.n',
    '..kk....kk.n',
    '.nn......nnn',
    'nnn......nn.'
  ],
  melon: [
    '..MMMM..',
    '.MEMmMM.',
    'MEMmMMmM',
    'MMmMMmMM',
    'MmMMmMMm',
    'MMMmMMmM',
    '.MmMMmM.',
    '..MMMM..'
  ],
  camel: [
    '...........................CC...',
    '..........................CCCC..',
    '..........................CCCKCC',
    '.......RRRRRRRRRRRRR......CCCCCC',
    '......RBYBBYBBYBBYBBR....CCCC...',
    '......RRRRRRRRRRRRRRR...CCCC....',
    '.....CCCCCCCCCCCCCCCCCCCCCC.....',
    '....cCCCCCCCCCCCCCCCCCCCCC......',
    '...c.CCCCCCCCCCCCCCCCCCCC.......',
    '...c.CCCCCCCCCCCCCCCCCCCc.......',
    '.....cCCCCCCCCCCCCCCCCCc........',
    '......ccCCCCCCCCCCCCCcc.........',
    '.......cC..cC.....cC..cC........',
    '.......cC..cC.....cC..cC........',
    '.......cC..cC.....cC..cC........',
    '.......cC..cC.....cC..cC........',
    '.......cC..cC.....cC..cC........',
    '.......cC..cC.....cC..cC........',
    '.......cC..cC.....cC..cC........',
    '......ccc.ccc....ccc.ccc........'
  ],
  camelWalk: [
    '...........................CC...',
    '..........................CCCC..',
    '..........................CCCKCC',
    '.......RRRRRRRRRRRRR......CCCCCC',
    '......RBYBBYBBYBBYBBR....CCCC...',
    '......RRRRRRRRRRRRRRR...CCCC....',
    '.....CCCCCCCCCCCCCCCCCCCCCC.....',
    '....cCCCCCCCCCCCCCCCCCCCCC......',
    '...c.CCCCCCCCCCCCCCCCCCCC.......',
    '...c.CCCCCCCCCCCCCCCCCCCc.......',
    '.....cCCCCCCCCCCCCCCCCCc........',
    '......ccCCCCCCCCCCCCCcc.........',
    '.......cC..cC.....cC..cC........',
    '......cC....cC...cC....cC.......',
    '......cC....cC...cC....cC.......',
    '.....cC......cC.cC......cC......',
    '.....cC......cC.cC......cC......',
    '.....cC......cC.cC......cC......',
    '....cC........cCC........cC.....',
    '...ccc.......ccc.ccc.....ccc....'
  ],
  guffa: [
    '..vvvvvvvvvvvvvvvvvvvvvvvvvvvv..',
    '.vVvVvVvVvVvVvVvVvVvVvVvVvVvVvv.',
    'vVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVv',
    'vVnVVnVVnVVnVVnVVnVVnVVnVVnVVnVv',
    '.vVVVVVVVVVVVVVVVVVVVVVVVVVVVVv.',
    '..vVVVVVVVVVVVVVVVVVVVVVVVVVVv..',
    '....vvvvvvvvvvvvvvvvvvvvvvvv....'
  ],
  sign: [
    'nnnnnnnnnnnn',
    'noooooooooon',
    'noKKoKKKoKon',
    'noooooooooon',
    'noKKKoKKoKon',
    'noooooooooon',
    'nnnnnnnnnnnn',
    '.....nn.....',
    '.....nn.....',
    '.....nn.....',
    '.....nn.....',
    '.....nn.....',
    '.....nn.....',
    '....nnnn....'
  ]
});

// Dynasty tunic colours for the guard (Q is a placeholder key).
for (const [suffix, key] of [['White', 'F'], ['Red', 'r']]) {
  SPRITES['guard' + suffix] = SPRITES.guard.map(row => row.split('Q').join(key));
  SPRITES['guard' + suffix + 'Walk'] = SPRITES.guardWalk.map(row => row.split('Q').join(key));
}

// White hurt-flash silhouettes of the traveller.
for (const n of ['traveller', 'travellerWalk']) {
  SPRITES[n + 'Flash'] = SPRITES[n].map(row => row.replace(/[^.]/g, 'W'));
}

// Pre-render each sprite (via drawSprite) to an offscreen canvas once, plus a
// horizontally flipped copy for facing left. Lazy, so importing needs no DOM.
const spriteCache = new Map();
function getSprite(name) {
  let s = spriteCache.get(name);
  if (s) return s;
  const rows = SPRITES[name];
  if (!rows) throw new Error('Unknown sprite: ' + name);
  const w = rows[0].length, h = rows.length;
  const img = document.createElement('canvas');
  img.width = w; img.height = h;
  drawSprite(img.getContext('2d'), name, 0, 0);
  const flip = document.createElement('canvas');
  flip.width = w; flip.height = h;
  const f = flip.getContext('2d');
  f.translate(w, 0); f.scale(-1, 1); f.drawImage(img, 0, 0);
  s = { img, flip, w, h };
  spriteCache.set(name, s);
  return s;
}

// Draw a pre-rendered sprite at integer coordinates; facing < 0 uses the flipped copy.
function blit(ctx, name, x, y, facing = 1, scale = 1) {
  const s = getSprite(name);
  ctx.drawImage(facing < 0 ? s.flip : s.img, Math.round(x), Math.round(y), s.w * scale, s.h * scale);
}

// Half-size icon (every other pixel) for the HUD.
function miniRows(name) {
  return SPRITES[name].filter((_, y) => y % 2 === 0).map(r => r.split('').filter((_, x) => x % 2 === 0).join(''));
}

export { SPRITES, drawSprite, getSprite, blit, miniRows };
