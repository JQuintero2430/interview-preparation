// Checks Python snippets in modules/*.md against the labs (STYLE-GUIDE §7.1).
// Usage: node labs/tools/check-snippets.mjs [guideRoot] [module-file-prefix ...]
// Node standard library only.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LANGS = new Set(['py', 'python']);

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
    blocks.push({
      lang: open[2],
      code: lines.slice(i + 1, j).join('\n'),
      line: i + 1,
      after: lines.slice(j + 1, j + 4).join('\n'),
      question,
    });
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

export function checkBlock(block, mdDir, guideRoot, read) {
  if (!LANGS.has(block.lang)) return null;
  const first = block.code.split('\n')[0].trim();
  if (first.startsWith('# Partial:') || first.startsWith('// Partial:')) return null;

  const excerpt = /^(?:#|\/\/)\s*Excerpt of (\S+?):?(?:\s|$)/.exec(first);
  if (excerpt) {
    const text = read(resolve(guideRoot, excerpt[1]));
    if (text === undefined) return `excerpt source missing: ${excerpt[1]}`;
    const wanted = block.code.split('\n').slice(1).map((l) => l.trim()).filter(Boolean);
    const have = text.split('\n').map((l) => l.trim());
    return isSubsequence(wanted, have) ? null : `excerpt lines not found in order in ${excerpt[1]}`;
  }

  const complete = /^(?:#|\/\/)\s*Complete:\s*(\S+)/.exec(first);
  if (complete) {
    const text = read(resolve(guideRoot, complete[1]));
    if (text === undefined) return `complete source missing: ${complete[1]}`;
    const wanted = block.code.split('\n').slice(1).join('\n');
    return trimEnds(text) === trimEnds(wanted) ? null : `complete snippet differs from ${complete[1]}`;
  }

  const source = /<sub>Source:\s*\[[^\]]*\]\(([^)]+)\)<\/sub>/.exec(block.after);
  if (source) {
    const text = read(resolve(mdDir, decodeURIComponent(source[1])));
    if (text === undefined) return `complete source missing: ${source[1]}`;
    return trimEnds(text) === trimEnds(block.code) ? null : `complete snippet differs from ${source[1]}`;
  }

  // Output questions: unmarked block under an Output question
  if (/^### Q[^·]*·(?:[^·]*·)*\s*Output\s*·/.test(block.question)) return null;

  return 'unclassified';
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const [rootArg, ...prefixes] = process.argv.slice(2);
  const root = resolve(rootArg ?? join(here, '..', '..'));
  const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined);
  const modulesDir = join(root, 'modules');
  if (!existsSync(modulesDir)) {
    console.log('No modules/ directory yet.');
    process.exit(0);
  }
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
