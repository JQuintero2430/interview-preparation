// Section 5 claim: ng-packagr turns projects/ui-lib into a publishable folder (read-only scan of dist/ui-lib).
// Needs `npx ng build ui-lib` in labs/angular first.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, readdirSync, existsSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  readdirSync: (path: URL, options: { withFileTypes: true }) => { name: string; isDirectory(): boolean }[];
  existsSync: (path: URL) => boolean;
};

const distRoot = new URL('../../../../../angular/dist/ui-lib/', import.meta.url);

function requireDist(): void {
  if (!existsSync(new URL('package.json', distRoot))) {
    throw new Error('run `npx ng build ui-lib` in labs/angular first');
  }
}

function filesUnder(dir: URL, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesUnder(new URL(`${entry.name}/`, dir), `${prefix}${entry.name}/`)
      : [`${prefix}${entry.name}`],
  );
}

describe('Module 38 · section 5', () => {
  it('Section 5: the build writes package.json, a fesm2022 bundle and a bundled types file', () => {
    requireDist();

    expect(filesUnder(distRoot)).toEqual(
      expect.arrayContaining([
        'README.md',
        'fesm2022/ui-lib.mjs',
        'fesm2022/ui-lib.mjs.map',
        'package.json',
        'types/ui-lib.d.ts',
      ]),
    );
  });

  it('Section 5: the built bundle contains a partial declaration, not a full definition', () => {
    requireDist();

    const bundle = readFileSync(new URL('fesm2022/ui-lib.mjs', distRoot), 'utf8');
    expect(bundle).toContain('ɵɵngDeclareComponent');
    expect(bundle).not.toContain('ɵɵdefineComponent');
  });
});
