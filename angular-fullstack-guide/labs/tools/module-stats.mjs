// Per-module statistics for the guide: questions, exercises, type mix (QUALITY-BAR D3) and prose words.
// Usage: node labs/tools/module-stats.mjs [--strict] [guideRoot]
// Flags floors (STYLE-GUIDE §12), SYLLABUS §1 ceilings, the prose cap (RUN.md §9: 10,000 words for
// Parts A, B, C and E) and D3 failures. Exit code 1 only with --strict and at least one flag.
// Node standard library only.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROSE_CAP = 10_000;
const CAPPED_PARTS = new Set(['A', 'B', 'C', 'E']);

// Rows of the SYLLABUS §1 table: { num, slug, part, ng, qMax, exMax }.
export function syllabusRows(syllabus) {
  const section = syllabus.split(/^## 1\./m)[1]?.split(/^## /m)[0] ?? '';
  // The slug cell may carry a note (`signals` *(pilot)*) and the kind cell is **NG** or —.
  return [...section.matchAll(/^\|\s*(\d{2})\s*\|\s*`([a-z0-9-]+)`[^|]*\|\s*([A-G])[^|]*\|\s*([^|]*?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/gm)].map(
    (m) => ({ num: m[1], slug: m[2], part: m[3], ng: m[4].includes('NG'), qMax: Number(m[5]), exMax: Number(m[6]) }),
  );
}

export function proseWords(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').split(/\s+/).filter(Boolean).length;
}

// Type tags of each `### Qnn.nn · Tag · Tag · Title` heading; the last segment is the title.
export function questionTags(markdown) {
  return [...markdown.matchAll(/^### Q\d+\.\d+[a-z]? · (.*)$/gm)].map((m) => m[1].split(' · ').slice(0, -1).map((t) => t.trim()));
}

export function moduleStats(markdown) {
  const tags = questionTags(markdown);
  const mix = {};
  for (const t of tags.flat()) mix[t] = (mix[t] ?? 0) + 1;
  return {
    questions: tags.length,
    exercises: (markdown.match(/^### Exercise /gm) ?? []).length,
    mix,
    prose: proseWords(markdown),
  };
}

export function flagsFor(stats, row) {
  const flags = [];
  const qFloor = row.ng ? 25 : 15;
  const exFloor = row.ng ? 4 : 2;
  if (stats.questions < qFloor) flags.push(`questions ${stats.questions} < floor ${qFloor}`);
  if (stats.exercises < exFloor) flags.push(`exercises ${stats.exercises} < floor ${exFloor}`);
  if (stats.questions > row.qMax) flags.push(`questions ${stats.questions} > ceiling ${row.qMax}`);
  if (stats.exercises > row.exMax) flags.push(`exercises ${stats.exercises} > ceiling ${row.exMax}`);
  if (CAPPED_PARTS.has(row.part) && stats.prose > PROSE_CAP) flags.push(`prose ${stats.prose} > cap ${PROSE_CAP}`);
  const tags = Object.keys(stats.mix);
  if (tags.length < 4) flags.push(`D3: ${tags.length} tags < 4`);
  if (!stats.mix['Trade-off']) flags.push('D3: no Trade-off');
  if (!stats.mix['Design'] && !stats.mix['Bug hunt']) flags.push('D3: no Design or Bug hunt');
  for (const [tag, n] of Object.entries(stats.mix)) {
    if (stats.questions > 0 && n / stats.questions > 0.6) flags.push(`D3: ${tag} on ${n}/${stats.questions} (> 60%)`);
  }
  return flags;
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const root = resolve(args.find((a) => a !== '--strict') ?? join(here, '..', '..'));
  const rows = new Map(syllabusRows(readFileSync(join(root, 'SYLLABUS.md'), 'utf8')).map((r) => [`${r.num}-${r.slug}.md`, r]));
  const files = readdirSync(join(root, 'modules')).filter((f) => rows.has(f)).sort();
  let flagged = 0;
  console.log('| Module | Q | Ex | Prose words | Type mix | Flags |\n|---|---|---|---|---|---|');
  for (const file of files) {
    const stats = moduleStats(readFileSync(join(root, 'modules', file), 'utf8'));
    const flags = flagsFor(stats, rows.get(file));
    if (flags.length > 0) flagged += 1;
    const mix = Object.entries(stats.mix).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(', ');
    console.log(`| ${file.slice(0, -3)} | ${stats.questions} | ${stats.exercises} | ${stats.prose} | ${mix} | ${flags.join('; ') || 'none'} |`);
  }
  const total = files.reduce((sum, f) => sum + moduleStats(readFileSync(join(root, 'modules', f), 'utf8')).questions, 0);
  console.log(`\n${files.length} module(s), ${total} question(s) (guide floor 600), ${flagged} with flags.`);
  process.exitCode = strict && flagged > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
