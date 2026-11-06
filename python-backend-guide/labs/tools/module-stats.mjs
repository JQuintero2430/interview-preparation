// Per-module statistics for the Python Backend Guide: questions, exercises, type mix (QUALITY-BAR D3) and prose words.
// Usage: node labs/tools/module-stats.mjs [--strict] [guideRoot]
// Node standard library only.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Rows of the SYLLABUS §1 table: { num, slug, part, kind, qMax, exMax, proseCap, lab }.
export function syllabusRows(syllabus) {
  const section = syllabus.split(/^## 1\./m)[1]?.split(/^## /m)[0] ?? '';
  const rows = [];
  for (const line of section.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 8 || !/^\d{2}$/.test(cells[0])) continue;
    const num = cells[0];
    const slugMatch = /^`([a-z0-9-]+)`/.exec(cells[1]);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    const part = cells[2].split(/\s/)[0];
    const kind = cells[3].includes('core') ? 'core' : 'supporting';
    const qMax = Number(cells[4]);
    const exMax = Number(cells[5]);
    const proseCap = Number(cells[6].replace(/,/g, ''));
    const lab = cells[7].replace(/`/g, '');
    rows.push({ num, slug, part, kind, qMax, exMax, proseCap, lab });
  }
  return rows;
}

export function proseWords(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').split(/\s+/).filter(Boolean).length;
}

// Type tags of each `### Qnn.nn · Tag · Tag · Title` heading
export function questionTags(markdown) {
  return [...markdown.matchAll(/^### Q\d+\.\d+[a-z]? · (.*)$/gm)].map((m) =>
    m[1].split(' · ').slice(0, -1).map((t) => t.trim())
  );
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
  if (!row) return [];
  const flags = [];
  const qFloor = row.kind === 'core' ? 20 : 12;
  const exFloor = row.kind === 'core' ? 3 : 2;

  if (stats.questions < qFloor) flags.push(`Q under floor (${stats.questions} < ${qFloor})`);
  if (stats.questions > row.qMax) flags.push(`Q over ceiling (${stats.questions} > ${row.qMax})`);
  if (stats.exercises < exFloor) flags.push(`Ex under floor (${stats.exercises} < ${exFloor})`);
  if (stats.exercises > row.exMax) flags.push(`Ex over ceiling (${stats.exercises} > ${row.exMax})`);
  if (stats.prose > row.proseCap) flags.push(`Prose over cap (${stats.prose} > ${row.proseCap})`);

  // QUALITY-BAR D3 mix checks (only checked if questions >= floor)
  if (stats.questions >= qFloor) {
    const distinctTags = Object.keys(stats.mix).length;
    if (distinctTags < 4) flags.push(`D3: under 4 distinct tags (${distinctTags})`);
    if (!stats.mix['Trade-off']) flags.push('D3: missing Trade-off');
    if (!stats.mix['Design'] && !stats.mix['Bug hunt']) flags.push('D3: missing Design or Bug hunt');
    for (const [tag, count] of Object.entries(stats.mix)) {
      if (count / stats.questions > 0.6) {
        flags.push(`D3: tag ${tag} exceeds 60% (${Math.round((count / stats.questions) * 100)}%)`);
      }
    }
  }

  return flags;
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const root = resolve(args.find((a) => !a.startsWith('--')) ?? join(here, '..', '..'));

  const syllabusPath = join(root, 'SYLLABUS.md');
  if (!existsSync(syllabusPath)) {
    console.error('SYLLABUS.md not found');
    process.exit(1);
  }

  const rows = new Map(syllabusRows(readFileSync(syllabusPath, 'utf8')).map((r) => [`${r.num}-${r.slug}.md`, r]));
  const modulesDir = join(root, 'modules');
  const files = existsSync(modulesDir) ? readdirSync(modulesDir).filter((f) => rows.has(f)).sort() : [];

  let flagged = 0;
  let totalQ = 0;
  let totalEx = 0;
  let totalProse = 0;

  console.log('| Module | Q | Ex | Prose words | Flags |\n|---|---|---|---|---|');
  for (const file of files) {
    const content = readFileSync(join(modulesDir, file), 'utf8');
    const stats = moduleStats(content);
    const row = rows.get(file);
    const flags = flagsFor(stats, row);

    totalQ += stats.questions;
    totalEx += stats.exercises;
    totalProse += stats.prose;

    if (flags.length > 0) flagged += 1;
    console.log(`| ${file} | ${stats.questions} | ${stats.exercises} | ${stats.prose} | ${flags.join('; ') || 'ok'} |`);
  }

  console.log(`\nTotal modules written: ${files.length} / ${rows.size}`);
  console.log(`Total questions: ${totalQ}, exercises: ${totalEx}, prose words: ${totalProse}`);
  process.exitCode = strict && flagged > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
