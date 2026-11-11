// Builds one self-contained HTML file (all JS + CSS inlined) for itch.io or offline play.
//   node tools/build-itch.mjs            → dist/rihla-983-itch.html and dist/index.html
// No dependencies. Each ES module is wrapped in its own function scope and its imports are
// rewritten to read from the modules evaluated before it, so names never collide.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'src/main.js');

const IMPORT = /^import\s+(?:(\{[^}]*\}|\w+)\s+from\s+)?'([^']+)';\s*$/;
const order = [], seen = new Set(), ids = new Map();

function visit(file) {
  if (seen.has(file)) return;
  seen.add(file);
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(IMPORT);
    if (m) visit(resolve(dirname(file), m[2]));
  }
  ids.set(file, order.length);
  order.push(file);
}
visit(entry);

// Names declared by `export const a = …, b = …;` (top-level commas only).
function constNames(stmt) {
  const names = [];
  let depth = 0, start = 0;
  const parts = [];
  for (let i = 0; i < stmt.length; i++) {
    const c = stmt[i];
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { parts.push(stmt.slice(start, i)); start = i + 1; }
  }
  parts.push(stmt.slice(start));
  for (const p of parts) { const m = p.trim().match(/^(\w+)\s*=/); if (m) names.push(m[1]); }
  return names;
}

function wrap(file) {
  const id = ids.get(file);
  const exports = [];
  let hasDefault = false;
  const out = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const im = line.match(IMPORT);
    if (im) {
      const dep = ids.get(resolve(dirname(file), im[2]));
      if (!im[1]) continue;                                   // side-effect import: already evaluated
      if (im[1].startsWith('{')) out.push(`const ${im[1].replace(/\s+as\s+/g, ': ')} = __M[${dep}];`);
      else out.push(`const ${im[1]} = __M[${dep}].default;`);
      continue;
    }
    let m;
    if ((m = line.match(/^export\s+\{([^}]*)\};?\s*$/))) { exports.push(...m[1].split(',').map(s => s.trim()).filter(Boolean)); continue; }
    if ((m = line.match(/^export\s+function\s+(\w+)/))) { exports.push(m[1]); out.push(line.replace(/^export\s+/, '')); continue; }
    if ((m = line.match(/^export\s+(const|let)\s+(.*)$/))) {
      const rest = m[2];
      exports.push(...(rest.trim().endsWith(';') ? constNames(rest.trim().slice(0, -1)) : [rest.match(/^(\w+)/)[1]]));
      out.push(line.replace(/^export\s+/, ''));
      continue;
    }
    if (/^export\s+default\s+/.test(line)) { hasDefault = true; out.push(line.replace(/^export\s+default\s+/, 'const __default = ')); continue; }
    if (/^\s*(import|export)\b/.test(line)) throw new Error(`${relative(root, file)}: unsupported statement: ${line}`);
    out.push(line);
  }
  const ret = [...exports, ...(hasDefault ? ['default: __default'] : [])].join(', ');
  return `// ---- ${relative(root, file)} ----\n__M[${id}] = (() => {\n${out.join('\n')}\nreturn { ${ret} };\n})();\n`;
}

const js = `'use strict';\nconst __M = [];\n${order.map(wrap).join('\n')}`;
const css = readFileSync(join(root, 'style.css'), 'utf8');
const html = readFileSync(join(root, 'index.html'), 'utf8')
  .replace(/<link rel="stylesheet" href="style.css">/, () => `<style>\n${css}</style>`)
  .replace(/<script type="module" src="src\/main.js"><\/script>/, () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}</script>`);
if (html.includes('<script type="module"') || html.includes('<link rel="stylesheet"')) throw new Error('index.html did not match the expected tags');

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/rihla-983-itch.html'), html);
writeFileSync(join(root, 'dist/index.html'), html);
console.log(`bundled ${order.length} modules → dist/rihla-983-itch.html (${(html.length / 1024).toFixed(0)} KB)`);
