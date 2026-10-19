// Section 3 claims. Test 1 reads the installed @angular/core typings from labs/angular/node_modules, read-only
// (cross-lab read, plan C10); test 2 runs our support table (fixtures/support-windows.ts) for a date passed as a parameter.
import { supportWindows, type SupportRow } from '../fixtures/support-windows';

interface NodeFs {
  existsSync(path: URL): boolean;
  readdirSync(path: URL): string[];
  readFileSync(path: URL, encoding: 'utf8'): string;
}

function isNodeFs(value: unknown): value is NodeFs {
  return typeof value === 'object' && value !== null && 'existsSync' in value && 'readdirSync' in value && 'readFileSync' in value;
}

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node); the guard avoids a cast.
const fsSpecifier = 'node:fs';
const loadedFs: unknown = await import(fsSpecifier);
if (!isNodeFs(loadedFs)) throw new Error('node:fs is unavailable');
const { existsSync, readdirSync, readFileSync } = loadedFs;

const coreDir = new URL('../../../../../angular/node_modules/@angular/core/', import.meta.url);

function requireCoreDir(): void {
  if (!existsSync(new URL('package.json', coreDir))) throw new Error('run `npm ci` in labs/angular first');
}

function installedCoreVersion(): unknown {
  requireCoreDir();
  const manifest: unknown = JSON.parse(readFileSync(new URL('package.json', coreDir), 'utf8'));
  return typeof manifest === 'object' && manifest !== null && 'version' in manifest ? manifest.version : undefined;
}

// The doc comment above each member of `declare enum <name> { ... }`, found in whichever types/*.d.ts declares it.
function enumMemberDocs(name: string): Map<string, string> {
  requireCoreDir();
  const typesDir = new URL('types/', coreDir);
  const header = `declare enum ${name} {`;
  for (const file of readdirSync(typesDir).filter((f) => f.endsWith('.d.ts'))) {
    const text = readFileSync(new URL(file, typesDir), 'utf8');
    const start = text.indexOf(header);
    if (start < 0) continue;
    const body = text.slice(start + header.length, text.indexOf('\n}', start));
    const docs = new Map<string, string>();
    for (const match of body.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*(\w+) = \d+/g)) {
      docs.set(match[2] ?? '', match[1] ?? '');
    }
    return docs;
  }
  throw new Error(`no types/*.d.ts in @angular/core declares enum ${name}`);
}

type Stage = 'unreleased' | 'active' | 'lts' | 'unsupported';

// A month-only value such as "2027-06" is read as the first day of that month (our convention; the page gives only the month).
const asDay = (date: string): string => (date.length === 7 ? `${date}-01` : date);

function stageOn(row: SupportRow, date: string): Stage {
  if (date < row.released) return 'unreleased';
  if (date < asDay(row.activeEnds)) return 'active';
  if (date < asDay(row.ltsEnds)) return 'lts';
  return 'unsupported';
}

const monthIndex = (date: string): number => Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7));
const supportedMonths = (row: SupportRow): number => monthIndex(row.ltsEnds) - monthIndex(row.released);

describe('Module 39 · section 3', () => {
  it('Section 3: the installed @angular/core 22.2.1 marks ChangeDetectionStrategy.Default as deprecated in its typings', () => {
    expect(installedCoreVersion()).toBe('22.2.1');
    const docs = enumMemberDocs('ChangeDetectionStrategy');
    expect(docs.get('Default')).toContain('@deprecated Use `Eager` instead.');
    expect(docs.get('Default')).toContain('is due to be removed');
    expect(docs.get('Eager')).not.toContain('@deprecated');
    expect(docs.get('OnPush')).not.toContain('@deprecated');
  });

  it('Section 3: our support table puts v22 in active support and v20 and v21 in LTS on 2026-10-18', () => {
    const day = '2026-10-18';
    const stages = supportWindows.map((row) => [row.version, stageOn(row, day)]);
    expect(stages).toEqual([
      ['^22.0.0', 'active'],
      ['^21.0.0', 'lts'],
      ['^20.0.0', 'lts'],
    ]);
    // the page's own Status column on its read date says the same
    expect(supportWindows.map((row) => row.status.toLowerCase())).toEqual(stages.map(([, stage]) => stage));
    // the date is a parameter: a day before v21's LTS started and before v22 existed
    expect(supportWindows.map((row) => stageOn(row, '2026-06-02'))).toEqual(['unreleased', 'active', 'lts']);
    // "typically 24 months" holds for the v22 row only
    expect(supportWindows.map(supportedMonths)).toEqual([24, 19, 18]);
  });
});
