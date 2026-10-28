// Per-module statistics for the guide: questions, exercises, Production scenario questions,
// type mix and prose words.
// Usage: node labs/tools/module-stats.mjs [--strict] [guideRoot]
// Flags floors (STYLE-GUIDE §12), SYLLABUS §1 ceilings and the per-module prose cap (SYLLABUS §1).
// Exit code 1 only with --strict and at least one flag. Node standard library only.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// STYLE-GUIDE §12: core (including the pilot) and supporting floors.
const FLOORS = {
  core: { q: 20, ex: 3, ps: 3 },
  supporting: { q: 12, ex: 2, ps: 1 },
};

// Rows of the SYLLABUS §1 table:
// | # | Slug | Part | Kind | Q | Ex | Prose cap | Lab | Prerequisites |
// -> { num, slug, part, kind, qMax, exMax, proseCap, lab }
export function syllabusRows(syllabus) {
  const section = syllabus.split(/^## 1\./m)[1]?.split(/^## /m)[0] ?? '';
  const rows = [];
  for (const line of section.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 8 || !/^\d{2}$/.test(cells[0])) continue;
    const slug = /^`([a-z0-9-]+)`/.exec(cells[1]);
    const part = /^([A-Z])\b/.exec(cells[2]);
    const kind = /^(core|supporting)\b/.exec(cells[3]);
    if (!slug || !part || !kind || !/^\d+$/.test(cells[4]) || !/^\d+$/.test(cells[5]) || !/^[\d,_]+$/.test(cells[6])) continue;
    const lab = cells[7].replace(/`/g, '');
    rows.push({
      num: cells[0],
      slug: slug[1],
      part: part[1],
      kind: kind[1],
      qMax: Number(cells[4]),
      exMax: Number(cells[5]),
      proseCap: Number(cells[6].replace(/[,_]/g, '')),
      lab: /^[—–-]*$/.test(lab) ? null : lab,
    });
  }
  return rows;
}

// Prose words: everything outside fenced code blocks (STYLE-GUIDE §7: code, Mermaid and snippets are fenced).
export function proseWords(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').split(/\s+/).filter(Boolean).length;
}

// Type tags of each `### Q<NN>.<mm> · <Type> · ... · <Title>` heading; the last segment is the title.
export function questionTags(markdown) {
  const text = markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  return [...text.matchAll(/^### Q\d+\.\d+[a-z]? · (.*)$/gm)].map((m) => m[1].split(' · ').slice(0, -1).map((t) => t.trim()));
}

export function moduleStats(markdown) {
  const text = markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  const tags = questionTags(markdown);
  const mix = {};
  for (const t of tags.flat()) mix[t] = (mix[t] ?? 0) + 1;
  return {
    questions: tags.length,
    exercises: (text.match(/^### Exercise \d+\.\d+ · /gm) ?? []).length,
    production: tags.filter((t) => t.includes('Production scenario')).length,
    mix,
    prose: proseWords(markdown),
  };
}

export function flagsFor(stats, row) {
  const flags = [];
  const floor = FLOORS[row.kind] ?? FLOORS.core;
  if (stats.questions < floor.q) flags.push(`questions ${stats.questions} < floor ${floor.q}`);
  if (stats.exercises < floor.ex) flags.push(`exercises ${stats.exercises} < floor ${floor.ex}`);
  if (stats.production < floor.ps) flags.push(`Production scenario ${stats.production} < floor ${floor.ps}`);
  if (stats.questions > row.qMax) flags.push(`questions ${stats.questions} > ceiling ${row.qMax}`);
  if (stats.exercises > row.exMax) flags.push(`exercises ${stats.exercises} > ceiling ${row.exMax}`);
  if (row.proseCap && stats.prose > row.proseCap) flags.push(`prose ${stats.prose} > cap ${row.proseCap}`);
  return flags;
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const root = resolve(args.find((a) => a !== '--strict') ?? join(here, '..', '..'));
  const rows = new Map(syllabusRows(readFileSync(join(root, 'SYLLABUS.md'), 'utf8')).map((r) => [`${r.num}-${r.slug}.md`, r]));
  const modules = join(root, 'modules');
  const files = existsSync(modules) ? readdirSync(modules).filter((f) => rows.has(f)).sort() : [];
  let flagged = 0;
  let total = 0;
  console.log('| Module | Q | Ex | PS | Prose words | Type mix | Flags |\n|---|---|---|---|---|---|---|');
  for (const file of files) {
    const stats = moduleStats(readFileSync(join(modules, file), 'utf8'));
    const flags = flagsFor(stats, rows.get(file));
    if (flags.length > 0) flagged += 1;
    total += stats.questions;
    const mix = Object.entries(stats.mix).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(', ');
    console.log(`| ${file.slice(0, -3)} | ${stats.questions} | ${stats.exercises} | ${stats.production} | ${stats.prose} | ${mix} | ${flags.join('; ') || 'none'} |`);
  }
  console.log(`\n${files.length} module(s) of ${rows.size} planned, ${total} question(s), ${flagged} with flags.`);
  process.exitCode = strict && flagged > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
