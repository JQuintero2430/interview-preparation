// Checks the guide: every relative Markdown link (and #anchor) resolves, and every fenced
// code block whose first line is `// file: <path>` (path relative to the guide folder)
// matches that file byte-for-byte (trailing newline ignored).
// Usage: node examples/scripts/check-links.mjs [--allow-missing] [--sync]
// --allow-missing skips links to module files not written yet (anchors in existing files are still checked).
// --sync rewrites every `// file:` block from its file first (the file is the source of truth).
// --sync 06-foo.md 07-bar.md limits the rewrite to those modules (never sync a module a worker is still writing).
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const allowMissing = process.argv.includes('--allow-missing');
const sync = process.argv.includes('--sync');
const FILE_BLOCK = /^(```\w*\n\/\/ file: (\S+)\n)([\s\S]*?)^```/gm;
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const syncOnly = process.argv.slice(2).filter((a) => a.endsWith('.md')).map((a) => resolve(root, a));

// GitHub heading slug: lowercase, drop HTML tags (but not inside code spans), drop punctuation except - and _, spaces -> '-'.
const slug = (h) =>
  h.trim().toLowerCase().replace(/`[^`]*`|<[^>]+>/g, (m) => (m[0] === '`' ? m : '')).replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

const mdFiles = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (f === 'node_modules' || f.startsWith('.')) return [];
    return statSync(p).isDirectory() ? mdFiles(p) : f.endsWith('.md') ? [p] : [];
  });

const anchorsOf = (file) => {
  const seen = new Map();
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  return new Set(
    [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, h]) => {
      const s = slug(h);
      const n = seen.get(s) ?? 0;
      seen.set(s, n + 1);
      return n ? `${s}-${n}` : s;
    }),
  );
};

let broken = 0;
for (const file of mdFiles(root)) {
  if (sync && (syncOnly.length === 0 || syncOnly.includes(file))) {
    const md = readFileSync(file, 'utf8');
    const synced = md.replace(FILE_BLOCK, (block, head, rel) => {
      const src = resolve(root, rel);
      return existsSync(src) ? `${head}${readFileSync(src, 'utf8').trimEnd()}\n\`\`\`` : block;
    });
    if (synced !== md) writeFileSync(file, synced);
  }
  const text = stripCode(readFileSync(file, 'utf8'));
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    // decodeURIComponent, not decodeURI: file names may contain %2C or %26, which decodeURI keeps encoded.
    const [path, anchor] = target.split('#').map((part) => (part === undefined ? part : decodeURIComponent(part)));
    const dest = path ? resolve(dirname(file), path) : file;
    if (allowMissing && !existsSync(dest) && /\/\d\d-[^/]+\.md$|examples\/README\.md$/.test(dest)) continue;
    const ok = existsSync(dest) && (!anchor || !dest.endsWith('.md') || anchorsOf(dest).has(anchor));
    if (!ok) {
      broken++;
      console.log(`${file.slice(root.length + 1)} -> ${target}`);
    }
  }
  for (const [, , rel, body] of readFileSync(file, 'utf8').matchAll(FILE_BLOCK)) {
    const src = resolve(root, rel);
    const actual = existsSync(src) ? readFileSync(src, 'utf8').trimEnd() : null;
    if (actual !== body.trimEnd()) {
      broken++;
      console.log(`${file.slice(root.length + 1)} -> // file: ${rel} ${actual === null ? 'does not exist' : 'differs from the file'}`);
    }
  }
}
console.log(broken ? `${broken} problem(s)` : 'All links and file blocks OK');
process.exit(broken ? 1 : 0);
