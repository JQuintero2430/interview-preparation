// Checks the TS/JS snippets in modules/*.md against the labs (STYLE-GUIDE §7.2).
// Usage: node labs/tools/check-snippets.mjs [guideRoot] [module-file-prefix ...]
//   e.g. node labs/tools/check-snippets.mjs . 01 02 03 04 17
// Complete (a `<sub>Source: [..](path)</sub>` within 3 lines after the block) must equal the file;
// Excerpt (`// Excerpt of <path>`) must have its non-blank lines, trimmed, in the file in order;
// Partial (`// Partial:`) is skipped, and so is Output (an unmarked block under a `### Q… · Output` question,
// checked against its test instead); any other ts/js block is reported as unclassified.
// Exit code 1 on any mismatch, missing file or unclassified block. Node standard library only.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LANGS = new Set(['ts', 'js', 'typescript', 'javascript']);

// Returns { lang, code, line, after, question } for every fenced block; `after` is the 3 lines that
// follow it and `question` the nearest `### Q…` heading above it (or '').
export function blocksOf(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let question = '';
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6} /.test(lines[i])) question = /^### Q\d/.test(lines[i]) ? lines[i] : '';
    const open = /^(```|~~~)(\S*)/.exec(lines[i]);
    if (!open) continue;
    let j = i + 1;
    while (j < lines.length && !lines[j].startsWith(open[1])) j++;
    blocks.push({ lang: open[2], code: lines.slice(i + 1, j).join('\n'), line: i + 1, after: lines.slice(j + 1, j + 4).join('\n'), question });
    i = j;
  }
  return blocks;
}

const trimEnds = (text) => text.split('\n').map((l) => l.trimEnd()).join('\n').trim();

export function isSubsequence(needles, haystack) {
  let k = 0;
  for (const line of haystack) if (k < needles.length && line === needles[k]) k++;
  return k === needles.length;
}

// Classifies one block; `read(path)` returns the file text or undefined. Returns null when the block is fine.
export function checkBlock(block, mdDir, guideRoot, read) {
  if (!LANGS.has(block.lang)) return null;
  const first = block.code.split('\n')[0].trim();
  if (first.startsWith('// Partial:')) return null;
  const excerpt = /^\/\/ Excerpt of (\S+?):?(?:\s|$)/.exec(first); // a trailing `: note` is allowed
  if (excerpt) {
    const text = read(resolve(guideRoot, excerpt[1]));
    if (text === undefined) return `excerpt source missing: ${excerpt[1]}`;
    const wanted = block.code.split('\n').slice(1).map((l) => l.trim()).filter(Boolean);
    const have = text.split('\n').map((l) => l.trim());
    return isSubsequence(wanted, have) ? null : `excerpt lines not found in order in ${excerpt[1]}`;
  }
  const source = /<sub>Source: \[[^\]]*\]\(([^)]+)\)<\/sub>/.exec(block.after);
  if (source) {
    const text = read(resolve(mdDir, decodeURIComponent(source[1])));
    if (text === undefined) return `complete source missing: ${source[1]}`;
    return trimEnds(text) === trimEnds(block.code) ? null : `complete snippet differs from ${source[1]}`;
  }
  // The Output kind: an unmarked block under an Output question is checked against its test.
  if (/^### Q[^·]*·(?:[^·]*·)*\s*Output\s*·/.test(block.question)) return null;
  return 'unclassified';
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const [rootArg, ...prefixes] = process.argv.slice(2);
  const root = resolve(rootArg ?? join(here, '..', '..'));
  const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined);
  const modulesDir = join(root, 'modules');
  const files = readdirSync(modulesDir)
    .filter((f) => f.endsWith('.md') && (prefixes.length === 0 || prefixes.some((p) => f.startsWith(p))))
    .sort();
  let problems = 0;
  for (const file of files) {
    for (const block of blocksOf(readFileSync(join(modulesDir, file), 'utf8'))) {
      const problem = checkBlock(block, modulesDir, root, read);
      if (problem === null) continue;
      problems += 1;
      console.log(`modules/${file}:${block.line}: ${problem}`);
    }
  }
  console.log(problems === 0 ? 'All snippets check out.' : `${problems} snippet problem(s).`);
  process.exitCode = problems === 0 ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
