// Generates GLOSSARY.md (FINISH.md §6.2) from _meta/GLOSSARY-TERMS.md.
// Usage: node labs/tools/glossary.mjs [--write | --check] [guideRoot]
// No flag: the text goes to stdout. --write: writes GLOSSARY.md. --check: exit 1 when the file differs.
// An entry line that does not parse exits 2 and names the line. Counts go to stderr.
// Node standard library only.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubSlug } from './check-links.mjs';

const ENTRY = /^- \*\*(.+?)\*\*(?: \([^)]*\))?: (.+)$/; // a note after the term, "(as used in 14)" or "(internal)", is dropped
const AS_USED = /\s*\(as (?:used|defined) in [^)]*\)/g;
const LINK = /\[([^\]]*)\]\(([^)]*)\)/g;

export class ParseError extends Error {}

// Entries { term, key, def, link, module } in file order; throws ParseError naming the bad line.
export function parseTerms(text) {
  const entries = [];
  let module = null;
  text.split('\n').forEach((line, i) => {
    const heading = line.match(/^## Module (\d+)/);
    if (heading) module = Number(heading[1]);
    if (module === null || heading || line.trim() === '') return;
    const m = line.match(ENTRY);
    // The source link is the first one of the trailing parenthetical (`([13 §1](…), [§9](…))`, or `(MDN; [24 §9](…))`).
    const at = line.includes(' ([') ? line.lastIndexOf(' ([') : line.lastIndexOf(' (');
    const link = at < 0 ? null : [...line.slice(at).matchAll(LINK)][0];
    if (!m || !link) throw new ParseError(`line ${i + 1}: ${line.slice(0, 120)}`);
    const term = m[1].replace(AS_USED, '').replace(/`/g, '').trim();
    const def = m[2].replace(/(?:\.\.\/)+modules\//g, 'modules/');
    entries.push({ term, key: normalizeKey(term), def, link: { label: link[1], url: link[2].replace(/(?:\.\.\/)+modules\//, 'modules/') }, module });
  });
  return entries;
}

export function normalizeKey(term) {
  return term.replace(/`/g, '').replace(AS_USED, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// One group per key: the lowest module defines it, the others become "also in" links.
export function groupEntries(entries) {
  const groups = new Map();
  for (const e of [...entries].sort((a, b) => a.module - b.module)) {
    const g = groups.get(e.key);
    if (!g) groups.set(e.key, { ...e, also: [] });
    else if (!g.also.some((l) => l.url === e.link.url)) g.also.push(e.link);
  }
  return [...groups.values()];
}

export function sortKey(term) {
  return term.toLowerCase().replace(/^[^\p{L}\p{N}]+/u, '');
}

export function letterOf(term) {
  const c = term.replace(/^`/, '')[0] ?? '';
  return /^[a-z]$/i.test(c) ? c.toUpperCase() : 'Symbols';
}

export function renderGlossary(groups) {
  const byLetter = new Map();
  for (const g of groups) {
    const l = letterOf(g.term);
    byLetter.set(l, [...(byLetter.get(l) ?? []), g]);
  }
  const letters = [...byLetter.keys()].sort((a, b) => (a === 'Symbols') - (b === 'Symbols') || a.localeCompare(b));
  const seen = new Map(letters.map((l) => [l.toLowerCase(), 1])); // keep entry ids clear of the letter headings
  const out = [
    '# Glossary', '',
    '> Generated from `_meta/GLOSSARY-TERMS.md`; do not edit by hand. Regenerate with `node labs/tools/glossary.mjs --write`.', '',
    letters.map((l) => `[${l}](#${l.toLowerCase()})`).join(' · '), '',
  ];
  for (const l of letters) {
    out.push(`## ${l}`, '');
    for (const g of byLetter.get(l).sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)) || a.key.localeCompare(b.key))) {
      const slug = githubSlug(g.term, seen) || githubSlug('term', seen);
      const also = g.also.length ? ` · also in ${g.also.map((x) => `[${x.label}](${x.url})`).join(', ')}` : '';
      out.push(`- <a id="${slug}"></a>**${g.term}**: ${g.def}${also}`);
    }
    out.push('');
  }
  return out.join('\n');
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const root = resolve(args.find((a) => !a.startsWith('--')) ?? join(here, '..', '..'));
  let entries;
  try {
    entries = parseTerms(readFileSync(join(root, '_meta', 'GLOSSARY-TERMS.md'), 'utf8'));
  } catch (e) {
    if (!(e instanceof ParseError)) throw e;
    console.error(`GLOSSARY-TERMS.md ${e.message}`);
    process.exit(2);
  }
  const groups = groupEntries(entries);
  console.error(`${entries.length} entries, ${groups.length} distinct keys`);
  const text = renderGlossary(groups);
  const file = join(root, 'GLOSSARY.md');
  if (args.includes('--write')) writeFileSync(file, text);
  else if (args.includes('--check')) {
    const same = existsSync(file) && readFileSync(file, 'utf8') === text;
    if (!same) console.error('GLOSSARY.md differs from the generated text; run --write.');
    process.exitCode = same ? 0 : 1;
  } else process.stdout.write(text);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
