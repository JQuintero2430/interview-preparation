// Checks every relative link and anchor in the guide's Markdown files.
// Usage: node labs/tools/check-links.mjs [--planned] [guideRoot]   (default: the guide folder)
// Exit code 1 when any link is broken. With --planned, a missing file that is a planned
// module (SYLLABUS.md section 1), a planned root file, or a cross-guide link to an unwritten
// Java module whose slug is in ../java-backend-guide/SYLLABUS.md is counted as planned, not failed.
// Node standard library only.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP_DIRS = new Set(['node_modules', 'labs', '.git']);

export function listMarkdown(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : listMarkdown(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

export function stripCode(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');
}

// GitHub's heading-anchor algorithm: lowercase, drop punctuation, spaces to hyphens,
// and suffix -1, -2 ... for repeated headings.
export function githubSlug(text, seen) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

export function anchorsOf(markdown) {
  const anchors = new Set();
  const seen = new Map();
  for (const line of markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').split('\n')) {
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) anchors.add(githubSlug(heading[1].replace(/`/g, ''), seen));
    for (const m of line.matchAll(/<a\s+(?:id|name)="([^"]+)"/g)) anchors.add(m[1]);
  }
  return anchors;
}

export function linksOf(markdown) {
  return [...stripCode(markdown).matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
}

const PLANNED_ROOT_FILES = ['GLOSSARY.md', 'QUESTION-INDEX.md', 'CHEATSHEET.md', 'MOCK-INTERVIEWS.md', 'README.md', 'PROGRESS.md', 'SOURCES.md'];

// Basenames of every file the guide plans to have: `NN-slug.md` for each row of the
// SYLLABUS.md section 1 table, plus the root files.
export function plannedFiles(syllabus) {
  const section = syllabus.split(/^## 1\./m)[1]?.split(/^## /m)[0] ?? '';
  const modules = [...section.matchAll(/^\|\s*(\d{2})\s*\|\s*`([a-z0-9-]+)`/gm)].map((m) => `${m[1]}-${m[2]}.md`);
  return new Set([...modules, ...PLANNED_ROOT_FILES]);
}

// Slugs of every module planned in the Java backend guide.
export function javaPlannedSlugs(javaSyllabus) {
  const section = javaSyllabus.split(/^## 1\./m)[1]?.split(/^## /m)[0] ?? '';
  return new Set([...section.matchAll(/^\|\s*(\d{2})\s*\|\s*`([a-z0-9-]+)`/gm)].map((m) => `${m[1]}-${m[2]}`));
}

export function isPlannedProblem(problem, planned, javaPlanned = new Set()) {
  const missing = /^(\S+) \(missing file(?:, outside guide)?\)$/.exec(problem);
  if (!missing) return false;
  const target = missing[1].split('#')[0];
  const fileBase = basename(target);
  if (planned.has(fileBase)) return true;
  // Cross-guide link into ../java-backend-guide/modules/<NN>-<slug>.md
  if (target.includes('java-backend-guide')) {
    const slug = fileBase.replace(/\.md$/, '');
    if (javaPlanned.has(slug)) return true;
  }
  return false;
}

function isExternal(target) {
  return /^(https?:|mailto:)/.test(target);
}

export function checkFile(file, anchorCache, root = dirname(file)) {
  const problems = [];
  const anchorsFor = (path) => {
    if (!anchorCache.has(path)) anchorCache.set(path, anchorsOf(readFileSync(path, 'utf8')));
    return anchorCache.get(path);
  };
  for (const target of linksOf(readFileSync(file, 'utf8'))) {
    if (isExternal(target)) continue;
    const [rawPath, anchor] = target.split('#');
    const path = rawPath ? resolve(dirname(file), decodeURIComponent(rawPath)) : file;
    if (!existsSync(path)) {
      const inside = relative(root, path).split(/[\\/]/)[0] !== '..';
      problems.push(`${target} (missing file${inside ? '' : ', outside guide'})`);
    } else if (anchor && path.endsWith('.md') && statSync(path).isFile() && !anchorsFor(path).has(decodeURIComponent(anchor))) {
      problems.push(`${target} (missing anchor)`);
    }
  }
  return problems;
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const plannedMode = args.includes('--planned');
  const root = resolve(args.find((a) => a !== '--planned') ?? join(here, '..', '..'));
  const planned = plannedMode ? plannedFiles(readFileSync(join(root, 'SYLLABUS.md'), 'utf8')) : new Set();
  
  let javaPlanned = new Set();
  if (plannedMode) {
    const javaSyllabusPath = resolve(root, '..', 'java-backend-guide', 'SYLLABUS.md');
    if (existsSync(javaSyllabusPath)) {
      javaPlanned = javaPlannedSlugs(readFileSync(javaSyllabusPath, 'utf8'));
    }
  }

  const cache = new Map();
  let failed = 0;
  let plannedCount = 0;

  for (const file of listMarkdown(root)) {
    const problems = checkFile(file, cache, root);
    for (const p of problems) {
      if (plannedMode && isPlannedProblem(p, planned, javaPlanned)) {
        plannedCount += 1;
      } else {
        failed += 1;
        console.log(`${relative(root, file)}: ${p}`);
      }
    }
  }

  if (plannedMode && plannedCount > 0) {
    console.log(`(${plannedCount} planned link(s) skipped)`);
  }
  if (failed === 0) {
    console.log('All links and anchors resolve.');
  } else {
    console.log(`${failed} link problem(s).`);
  }
  process.exitCode = failed === 0 ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
