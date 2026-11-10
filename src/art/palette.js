// Shared item & character palette.
// Lines between the VERBATIM markers are copied unchanged from docs/handoff.html (#art-code).
// ---- VERBATIM START ----
/* ---------- palette.js ---------- */
const PALETTE = {
  K: '#1b1a1f', // ink black (kufic strokes)
  W: '#f3ead2', // white slip / silk
  w: '#cbbd98', // cream shadow
  G: '#c9962b', // luster gold
  g: '#8f6420', // dark luster
  Y: '#e8c45a', // gold leaf
  B: '#1f2a6b', // indigo parchment
  b: '#34449a', // indigo edge
  S: '#b9c0c9', // silver
  R: '#a33a2a', // brick red
  n: '#6b4a2b', // brown: embroidery, wood, boots
  I: '#efe3c3', // ivory
  i: '#c8b48a', // ivory shadow
  T: '#b07a52', // skin
  U: '#f5f2ea', // turban
  u: '#cfc8b8'  // turban shade
};
// ---- VERBATIM END ----

// ---- Extensions for the game (new keys only; the originals above are unchanged) ----
Object.assign(PALETTE, {
  H: '#d2453a', // heart red
  h: '#7a1f1f', // heart dark / empty outline
  P: '#f6a393', // heart highlight
  X: '#5a3b22', // scorpion shell
  x: '#8a5f36', // scorpion light
  C: '#b98a55', // camel
  c: '#8d6438', // camel shade
  M: '#3f7a3a', // melon rind
  m: '#2a5a2a', // melon stripe
  E: '#7fb069', // melon light
  F: '#f4f1ea', // Fatimid white tunic
  r: '#b3261e', // Umayyad red tunic
  k: '#3a3240', // dark trousers
  V: '#4a3a2a', // bitumen-coated basket (guffa)
  v: '#2e2418', // dark wood / bitumen shade
  o: '#e9d7a8', // parchment sign
  Q: '#6b5a7a'  // guard tunic placeholder (dynasty variants swap it)
});

export { PALETTE };
