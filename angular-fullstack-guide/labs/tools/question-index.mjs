// Generates QUESTION-INDEX.md (FINISH.md §6.1) from the `### Q` headings of modules/*.md.
// Usage: node labs/tools/question-index.mjs [--write | --check] [guideRoot]
// Default: print to stdout. --write writes QUESTION-INDEX.md at the guide root; --check exits 1 when it differs.
// Exit 2 when a `### Q` heading lacks `<a id="qNN-nn"></a>` on the line before. Node standard library only.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionTags, syllabusRows } from './module-stats.mjs';

// Part letter -> name from the `### Part X · Name` headings of the SYLLABUS; the letter stands in when missing.
export function partNames(syllabus) {
  return Object.fromEntries([...syllabus.matchAll(/^### Part ([A-G]) · (.+?)\s*$/gm)].map((m) => [m[1], m[2]]));
}

// { title, questions: [{ id, anchor, tags, title }], missing: [id] } for one module; `title` drops the "NN. " prefix of the H1.
export function parseModule(markdown) {
  const lines = markdown.split('\n');
  const title = (lines[0] ?? '').replace(/^#\s+(?:\d+\.\s+)?/, '').trim();
  const questions = [];
  const missing = [];
  lines.forEach((line, i) => {
    const m = /^### Q(\d+)\.(\d+)([a-z]?) · (.*)$/.exec(line);
    if (!m) return;
    const id = `Q${m[1]}.${m[2]}${m[3]}`;
    const anchor = `q${m[1]}-${m[2]}${m[3]}`;
    if ((lines[i - 1] ?? '').trim() !== `<a id="${anchor}"></a>`) missing.push(id);
    const tags = questionTags(line)[0];
    questions.push({ id, anchor, tags, title: m[4].split(' · ').pop().trim() });
  });
  return { title, questions, missing };
}

const cell = (text) => text.replace(/\|/g, '\\|');

// modules: [{ num, slug, part, title, questions }] in module order; parts: letter -> name.
export function renderIndex(modules, parts) {
  const all = modules.flatMap((m) => m.questions);
  const mix = {};
  for (const t of all.flatMap((q) => q.tags)) mix[t] = (mix[t] ?? 0) + 1;
  const out = [
    '# Question index',
    '',
    '<!-- Generated file: do not edit. Source: the `### Q` headings of modules/*.md. Regenerate with `node labs/tools/question-index.mjs --write`. -->',
    '',
    `**${all.length} questions in ${modules.length} modules.**`,
    '',
    '| Type | Questions |',
    '|---|---|',
    ...Object.entries(mix).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t, n]) => `| ${t} | ${n} |`),
  ];
  let part = null;
  for (const m of modules) {
    if (m.part !== part) {
      part = m.part;
      out.push('', `## Part ${part} · ${parts[part] ?? part}`);
    }
    out.push('', `### ${m.num} · ${m.title}`, '', '| ID | Type | Question |', '|---|---|---|');
    for (const q of m.questions) {
      out.push(`| [${q.id}](modules/${m.num}-${m.slug}.md#${q.anchor}) | ${cell(q.tags.join(' · '))} | ${cell(q.title)} |`);
    }
  }
  return `${out.join('\n')}\n`;
}

// Reads the guide at `root`; returns { text, missing: ['modules/x.md: Q01.01', ...] }.
export function buildIndex(root) {
  const syllabus = readFileSync(join(root, 'SYLLABUS.md'), 'utf8');
  const rows = syllabusRows(syllabus);
  const missing = [];
  const modules = rows
    .filter((r) => existsSync(join(root, 'modules', `${r.num}-${r.slug}.md`)))
    .map((r) => {
      const parsed = parseModule(readFileSync(join(root, 'modules', `${r.num}-${r.slug}.md`), 'utf8'));
      missing.push(...parsed.missing.map((id) => `modules/${r.num}-${r.slug}.md: ${id}`));
      return { ...r, ...parsed };
    });
  return { text: renderIndex(modules, partNames(syllabus)), missing };
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const root = resolve(args.find((a) => !a.startsWith('--')) ?? join(here, '..', '..'));
  const { text, missing } = buildIndex(root);
  if (missing.length > 0) {
    for (const m of missing) console.error(`missing anchor before heading: ${m}`);
    process.exitCode = 2;
    return;
  }
  const target = join(root, 'QUESTION-INDEX.md');
  if (args.includes('--write')) writeFileSync(target, text);
  else if (args.includes('--check')) {
    const same = existsSync(target) && readFileSync(target, 'utf8') === text;
    if (!same) console.error('QUESTION-INDEX.md differs from the generated text.');
    process.exitCode = same ? 0 : 1;
  } else process.stdout.write(text);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
