import ts from 'typescript';
import { isEnabled } from './feature-flags';
import { typecheck } from './typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const SOURCE = readFileSync(new URL('./feature-flags.ts', import.meta.url), 'utf8');
const FLAGS_FILE = { '/virtual/feature-flags.ts': SOURCE };
const codes = (consumer: string, extraFiles: Record<string, string> = FLAGS_FILE) =>
  typecheck(consumer, undefined, extraFiles).map(({ file, line, code }) => `${file}:${line}: TS${code}`);

describe('E06.3 a typed feature-flag table', () => {
  it('isEnabled honours enabled and rollout', () => {
    expect([isEnabled('newCheckout', 10), isEnabled('newCheckout', 30), isEnabled('darkMode', 99), isEnabled('betaSearch')]).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });

  it('a misspelled flag name is a compile error', () => {
    expect(codes("import { isEnabled } from './feature-flags';\nexport const on = isEnabled('newChekout');")).toEqual([
      '/virtual/main.ts:2: TS2345',
    ]);
    // The alternative in the worked solution: names written twice and a Record annotation still catch a missing or an extra entry.
    const entry = (name: string) => `${name}: { enabled: true, description: 'x' }`;
    const declared = "type FlagName = 'newCheckout' | 'darkMode' | 'betaSearch';\ninterface FlagConfig { enabled: boolean; description: string; rollout?: number }\n";
    const table = (...names: string[]) => `${declared}export const table: Record<FlagName, FlagConfig> = { ${names.map(entry).join(', ')} };`;
    expect(codes(table('newCheckout', 'darkMode'), {})).toEqual(['/virtual/main.ts:3: TS2741']);
    expect(codes(table('newCheckout', 'darkMode', 'betaSearch', 'oldSearch'), {})).toEqual(['/virtual/main.ts:3: TS2353']);
  });

  it('a misspelled config property is a compile error', () => {
    const misspelled = SOURCE.replace("darkMode: { enabled: true,", "darkMode: { enabeld: true,");
    const lineOf = (text: string) => misspelled.split('\n').findIndex((line) => line.includes(text)) + 1;
    // The entry is rejected where it is written, and the now-incomplete flag no longer widens to FlagConfig.
    expect(codes('export {};', { '/virtual/feature-flags.ts': misspelled })).toEqual([
      `/virtual/feature-flags.ts:${lineOf('enabeld')}: TS2561`,
      `/virtual/feature-flags.ts:${lineOf('const flag: FlagConfig')}: TS2322`,
    ]);
  });

  it('the literal values survive', () => {
    const consumer = `import { FEATURE_FLAGS, type FlagName } from './feature-flags';
type Expected = 'newCheckout' | 'darkMode' | 'betaSearch';
export const names: Expected[] = [] as FlagName[];
export const back: FlagName[] = [] as Expected[];
export const rollout: 25 = FEATURE_FLAGS.newCheckout.rollout;
export const enabled: false = FEATURE_FLAGS.betaSearch.enabled;`;
    expect(codes(consumer)).toEqual([]);
    expect(codes(consumer.replace("'betaSearch'", "'betaSearch' | 'oldSearch'"))).toEqual(['/virtual/main.ts:4: TS2322']);
    // The alternative in the worked solution: a Record annotation widens the values, so a literal type no longer holds.
    const widened = `interface FlagConfig { enabled: boolean; description: string }
const table: Record<'darkMode', FlagConfig> = { darkMode: { enabled: true, description: 'x' } };
export const on: true = table.darkMode.enabled;`;
    expect(codes(widened, {})).toEqual(['/virtual/main.ts:3: TS2322']);
  });

  it('no enum and no run-time cost beyond the object', () => {
    const output = ts.transpileModule(SOURCE, {
      compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.Preserve, removeComments: true },
    }).outputText;
    expect(SOURCE).not.toMatch(/\benum\b/);
    expect(output).toBe(`export const FEATURE_FLAGS = {
    newCheckout: { enabled: true, description: 'One-page checkout', rollout: 25 },
    darkMode: { enabled: true, description: 'Dark theme toggle' },
    betaSearch: { enabled: false, description: 'Search backed by the new index' },
};
export function isEnabled(name, bucket = 0) {
    const flag = FEATURE_FLAGS[name];
    return flag.enabled && bucket < (flag.rollout ?? 100);
}
`);
  });
});
