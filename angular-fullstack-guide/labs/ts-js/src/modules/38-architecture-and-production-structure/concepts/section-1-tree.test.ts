// Section 1 claim: no file in one feature folder imports from another feature folder (read-only scan).
import ts from 'typescript';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, readdirSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  readdirSync: (path: URL, options: { withFileTypes: true }) => { name: string; isDirectory(): boolean }[];
};

const sampleApp = new URL(
  '../../../../../angular/src/app/modules/38-architecture-and-production-structure/sample-app/',
  import.meta.url,
);

function tsFilesUnder(dir: URL): URL[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? tsFilesUnder(new URL(`${entry.name}/`, dir)) : entry.name.endsWith('.ts') ? [new URL(entry.name, dir)] : [],
  );
}

function featureOf(file: URL): string | undefined {
  return /\/features\/([^/]+)\//.exec(file.pathname)?.[1];
}

describe('Module 38 · section 1', () => {
  it('Section 1: no file in one feature folder imports from another feature folder', () => {
    const files = tsFilesUnder(sampleApp);
    const inFeatures = files.filter((file) => featureOf(file) !== undefined);
    expect([...new Set(inFeatures.map(featureOf))].sort()).toEqual(['catalog', 'orders']);

    const crossings = inFeatures.flatMap((file) =>
      ts
        .preProcessFile(readFileSync(file, 'utf8'), true, true)
        .importedFiles.map((imported) => imported.fileName)
        .filter((specifier) => specifier.startsWith('.'))
        .map((specifier) => new URL(specifier, file))
        .filter((target) => featureOf(target) !== undefined && featureOf(target) !== featureOf(file))
        .map((target) => `${file.pathname} -> ${target.pathname}`),
    );

    expect(crossings).toEqual([]);
  });
});
