// Consistency scan over modules/*.md (FINISH.md §4.2, sections 1-5): status markers, one API with
// different markers, duplicate question candidates, glossary duplicates, header consistency. Every item carries its chunk tag X-01..X-05.
// Usage: node labs/tools/consistency-scan.mjs [--strict-markers] [guideRoot]
// Markdown output without Markdown links. Exit 1 only with --strict-markers and a section 1 item.
// Node standard library only.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionTags } from './module-stats.mjs';

const KEYWORDS = ['Developer preview', 'Experimental', 'Deprecated', 'Removed', 'Changed', 'Stable', 'Added', 'Baseline'];
const MARKER = new RegExp(`\\[((?:${KEYWORDS.join('|')})[^\\]\\n]*)\\](?!\\()`, 'g');
const V = String.raw`v\d+(?:\.\d+)?`;
const CANONICAL = [
  `Developer preview since ${V}`,
  `Experimental since ${V}`,
  `Deprecated since ${V} — use .+`,
  `Removed in ${V}`,
  `Changed in ${V}: .+`,
  `Stable since ${V}`,
  String.raw`Added in v\d+\.\d+`,
  String.raw`Baseline \d{4}: (?:newly|widely) available, per MDN`,
  'Baseline: limited availability, per MDN',
].map((p) => new RegExp(`^${p}$`));
const CHUNKS = [[11, 'X-01'], [21, 'X-02'], [30, 'X-03'], [40, 'X-04'], [47, 'X-05']];
const STOP = new Set(['the', 'and', 'for', 'with', 'what', 'how', 'why', 'does', 'when', 'are', 'you', 'your', 'this', 'that', 'from', 'into', 'its', 'not', 'can', 'use', 'which', 'should', 'would', 'about', 'than', 'then']);

export const chunkOf = (num) => (CHUNKS.find(([max]) => Number(num) <= max) ?? CHUNKS.at(-1))[1];
export const isCanonical = (text) => CANONICAL.some((re) => re.test(text));
export const shapeOf = (text) => text.replace(/\d+/g, 'N');
export const kindOf = (text) => KEYWORDS.find((k) => text.startsWith(k));

// Lines outside fenced code blocks: [{ n, text }].
export function proseLines(markdown) {
  let fence = null;
  const out = [];
  markdown.split('\n').forEach((text, i) => {
    const m = /^(```|~~~)/.exec(text);
    if (m && !fence) fence = m[1];
    else if (m && m[1] === fence) fence = null;
    else if (!fence) out.push({ n: i + 1, text });
  });
  return out;
}

// The last backticked token within 60 characters before the marker, or null.
export function apiBefore(line, index) {
  const before = line.slice(Math.max(0, index - 60), index);
  const ticks = [...before.matchAll(/`([^`]+)`/g)];
  return ticks.length ? ticks.at(-1)[1] : null;
}

// Markers of one module: [{ text, api, line }].
export function markersOf(markdown) {
  return proseLines(markdown).flatMap(({ n, text }) =>
    [...text.matchAll(MARKER)].map((m) => ({ text: m[1], api: apiBefore(text, m.index), line: n })));
}

// Question headings of one module: [{ id, type, title, line }].
export function questionsOf(markdown) {
  return proseLines(markdown).flatMap(({ n, text }) => {
    const id = /^### (Q\d+\.\d+[a-z]?) · /.exec(text)?.[1];
    if (!id) return [];
    const parts = text.slice(`### ${id} · `.length).split(' · ');
    return [{ id, type: parts.slice(0, -1).join(' · ') || questionTags(text)[0]?.join(' · ') || '', title: parts.at(-1).trim(), line: n }];
  });
}

export const normTitle = (title) => title.toLowerCase().replace(/[`\W_]+/g, ' ').trim();
export function tokensOf(title) {
  return new Set(normTitle(title).split(' ').filter((t) => t.length >= 3 && !STOP.has(t)));
}
// Jaccard index >= 0.6 in integer arithmetic (no float rounding).
export function similar(a, b) {
  if (normTitle(a) === normTitle(b)) return true;
  const ta = tokensOf(a);
  const tb = tokensOf(b);
  const inter = [...ta].filter((t) => tb.has(t)).length;
  const union = ta.size + tb.size - inter;
  return union > 0 && inter * 5 >= union * 3;
}

// Section 1: non-canonical markers grouped by shape: [{ shape, items: [{ module, line, text }] }].
export function nonCanonical(modules) {
  const groups = new Map();
  for (const mod of modules) {
    for (const m of markersOf(mod.markdown)) {
      if (isCanonical(m.text)) continue;
      const shape = shapeOf(m.text);
      if (!groups.has(shape)) groups.set(shape, []);
      groups.get(shape).push({ module: mod, line: m.line, text: m.text });
    }
  }
  return [...groups].map(([shape, items]) => ({ shape, items }));
}

function conflicting(markers) {
  const texts = new Set(markers.map((m) => m.text));
  const kinds = new Set(markers.map((m) => kindOf(m.text)));
  const sameKind = [...kinds].some((k) => new Set(markers.filter((m) => kindOf(m.text) === k).map((m) => m.text)).size > 1);
  const mixed = kinds.has('Stable') && (kinds.has('Deprecated') || kinds.has('Removed'));
  return texts.size > 1 && (sameKind || mixed);
}

// Section 2: [{ api, markers: [{ module, line, text }] }] for APIs with different markers.
export function apiConflicts(modules) {
  const byApi = new Map();
  for (const mod of modules) {
    for (const m of markersOf(mod.markdown)) {
      if (!m.api) continue;
      if (!byApi.has(m.api)) byApi.set(m.api, []);
      byApi.get(m.api).push({ module: mod, line: m.line, text: m.text });
    }
  }
  return [...byApi].filter(([, ms]) => conflicting(ms)).map(([api, markers]) => ({ api, markers }));
}

// Section 3: pairs of questions in different modules with similar titles.
export function duplicateQuestions(modules) {
  const all = modules.flatMap((module) => questionsOf(module.markdown).map((q) => ({ ...q, module })));
  const pairs = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (all[i].module.num !== all[j].module.num && similar(all[i].title, all[j].title)) pairs.push([all[i], all[j]]);
    }
  }
  return pairs;
}

// Glossary entries: [{ module, term, key, line }] from `## Module NN` sections of GLOSSARY-TERMS.md.
export const normTerm = (term) => term.replace(/`/g, '').replace(/ \(as used in \d+\)/g, '').toLowerCase().trim();
export function glossaryEntries(glossary) {
  let module = null;
  const out = [];
  for (const line of glossary.split('\n')) {
    const h = /^## Module (\d+)/.exec(line);
    if (h) module = h[1].padStart(2, '0');
    const e = module && /^- \*\*(.+?)\*\*( \(as used in \d+\))?: /.exec(line);
    if (e) out.push({ module, term: e[1], key: normTerm(e[1]), line });
  }
  return out;
}

// Section 4: [{ key, entries }] for terms defined in more than one module, sorted by key.
export function glossaryDuplicates(entries) {
  const byKey = new Map();
  for (const e of entries) byKey.set(e.key, [...(byKey.get(e.key) ?? []), e]);
  return [...byKey].filter(([, es]) => new Set(es.map((e) => e.module)).size > 1)
    .map(([key, es]) => ({ key, entries: es })).sort((a, b) => (a.key < b.key ? -1 : 1));
}

// Module numbers linked in one header line (`> **Prerequisites:** ...`), without the module itself.
const headerLine = (markdown, label) => new RegExp(`^> \\*\\*${label}:\\*\\* (.*)$`, 'm').exec(markdown)?.[1] ?? '';
const linkedModules = (text) => [...new Set([...text.matchAll(/\]\((\d{2})-[^)]*\)/g)].map((m) => m[1]))];

// SYLLABUS §1 Prerequisites column: Map(num -> [num]).
export function syllabusPrereqs(syllabus) {
  const section = syllabus.split(/^## 1\./m)[1]?.split(/^## /m)[0] ?? '';
  return new Map([...section.matchAll(/^\|\s*(\d{2})\s*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|\s*([^|]*?)\s*\|/gm)]
    .map((m) => [m[1], m[2].match(/\d{2}/g) ?? []]));
}

// Section 5: per module header facts: [{ module, missing, extra, noBack, leadsTo, applies }].
export function headerChecks(modules, prereqs) {
  const info = new Map(modules.map((m) => [m.num, {
    pre: linkedModules(headerLine(m.markdown, 'Prerequisites')).filter((n) => n !== m.num),
    lead: linkedModules(headerLine(m.markdown, 'Leads to')).filter((n) => n !== m.num),
  }]));
  return modules.map((module) => {
    const { pre } = info.get(module.num);
    const want = prereqs.get(module.num);
    return {
      module,
      missing: want ? want.filter((n) => !pre.includes(n)) : [],
      extra: want ? pre.filter((n) => !want.includes(n)) : [],
      noBack: pre.filter((y) => info.has(y) && !info.get(y).lead.includes(module.num)),
      applies: headerLine(module.markdown, 'Applies to'),
    };
  });
}

const where = (mod, line) => `\`modules/${mod.file}:${line}\``;
const lowest = (mods) => mods.map((m) => m.num).sort()[0];
const section = (title, lines) => [`## ${title}`, '', ...(lines.length ? lines : ['None.']), ''];

export function renderMarkers(groups) {
  return section('1. Non-canonical status markers', groups.flatMap(({ shape, items }) => [
    `- \`[${shape}]\` (${items.length})`,
    ...items.map((i) => `  - ${chunkOf(i.module.num)} ${where(i.module, i.line)} \`[${i.text}]\``),
  ]));
}

export function renderConflicts(conflicts) {
  return section('2. One API, different markers', conflicts.flatMap(({ api, markers }) => [
    `- \`${api}\` ${chunkOf(lowest(markers.map((m) => m.module)))}`,
    ...markers.map((m) => `  - ${where(m.module, m.line)} \`[${m.text}]\``),
  ]));
}

export function renderDuplicates(pairs) {
  return section('3. Duplicate question candidates', pairs.map(([a, b]) =>
    `- ${chunkOf(lowest([a.module, b.module]))} ${a.id} (${a.type}) ${where(a.module, a.line)} "${a.title}" vs ${b.id} (${b.type}) ${where(b.module, b.line)} "${b.title}"`));
}

export function renderGlossary(dups) {
  return section('4. Glossary terms defined in more than one module', dups.flatMap(({ key, entries }) => [
    `- \`${key}\` ${chunkOf(lowest(entries.map((e) => ({ num: e.module }))))} (${entries.length})`,
    ...entries.map((e) => `  - ${e.module}: ${e.line.replace(/^- /, '')}`),
  ]));
}

export function renderHeaders(checks) {
  const list = (ns) => ns.join(', ');
  const problems = checks.flatMap((c) => {
    const tag = `${chunkOf(c.module.num)} ${c.module.num}`;
    return [
      ...(c.missing.length ? [`- ${tag} Prerequisites missing against SYLLABUS: ${list(c.missing)}`] : []),
      ...(c.extra.length ? [`- ${tag} Prerequisites extra against SYLLABUS: ${list(c.extra)}`] : []),
      ...c.noBack.map((y) => `- ${tag} lists ${y} as prerequisite, but ${y} Leads to omits ${c.module.num}`),
    ];
  });
  return section('5. Header consistency', [
    ...problems,
    ...(problems.length ? [''] : []),
    '**Applies to** lines:', '',
    ...checks.map((c) => `- ${chunkOf(c.module.num)} ${c.module.num}: ${c.applies || '(none)'}`),
  ]);
}

export function render(modules, extra = {}) {
  const { glossary = '', syllabus = '' } = extra;
  const text = ['# Consistency scan (generated)', '',
    ...renderMarkers(nonCanonical(modules)),
    ...renderConflicts(apiConflicts(modules)),
    ...renderDuplicates(duplicateQuestions(modules)),
    ...renderGlossary(glossaryDuplicates(glossaryEntries(glossary))),
    ...renderHeaders(headerChecks(modules, syllabusPrereqs(syllabus)))].join('\n');
  return text.replaceAll('](', '] (');
}

export function loadExtra(root) {
  const read = (...p) => (existsSync(join(root, ...p)) ? readFileSync(join(root, ...p), 'utf8') : '');
  return { glossary: read('_meta', 'GLOSSARY-TERMS.md'), syllabus: read('SYLLABUS.md') };
}

export function loadModules(root) {
  const dir = join(root, 'modules');
  return readdirSync(dir).filter((f) => /^\d{2}-.*\.md$/.test(f)).sort()
    .map((file) => ({ file, num: file.slice(0, 2), markdown: readFileSync(join(dir, file), 'utf8') }));
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const strict = args.includes('--strict-markers');
  const root = resolve(args.find((a) => !a.startsWith('--')) ?? join(here, '..', '..'));
  const modules = loadModules(root);
  console.log(render(modules, loadExtra(root)));
  process.exitCode = strict && nonCanonical(modules).length > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
