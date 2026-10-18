// Exercise 38.2: the built entry points, read from dist/ui-lib. Needs `npx ng build ui-lib` in labs/angular first.
import ts from 'typescript';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, existsSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  existsSync: (path: URL) => boolean;
};

const distRoot = new URL('../../../../../angular/dist/ui-lib/', import.meta.url);

interface ExportTarget {
  types?: string;
  default?: string;
}

function readDist(path: string): string {
  if (!existsSync(new URL('package.json', distRoot))) {
    throw new Error('run `npx ng build ui-lib` in labs/angular first');
  }
  return readFileSync(new URL(path, distRoot), 'utf8');
}

function readExports(): Record<string, ExportTarget> {
  const manifest: { exports: Record<string, ExportTarget> } = JSON.parse(readDist('package.json'));
  return manifest.exports;
}

/** Names a types file exports: `export` modifiers and `export { … }` lists. */
function exportedNames(source: string): string[] {
  const file = ts.createSourceFile('entry.d.ts', source, ts.ScriptTarget.Latest, true);
  const names: string[] = [];
  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      names.push(...statement.exportClause.elements.map((element) => element.name.text));
    } else if (ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (ts.isClassDeclaration(statement) || ts.isFunctionDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
        if (statement.name) names.push(statement.name.text);
      }
    }
  }
  return names.sort();
}

describe.each(['ex2-a', 'ex2-b'])('Exercise 38.2 · entry point %s', (entry) => {
  const target = (): ExportTarget => readExports()[`./${entry}`] ?? {};

  it('exposes the entry point as its own subpath in the package exports', () => {
    expect(Object.keys(readExports())).toContain(`./${entry}`);
    expect(target().default).toContain(`ui-lib-${entry}`);
    expect(target().types).toContain(`ui-lib-${entry}`);
    expect(target().default).not.toBe(readExports()['.']?.default);
  });

  it('declares only the documented names in the entry point types', () => {
    const types = readDist(target().types ?? 'missing-entry-types');
    expect(exportedNames(types)).toEqual(['UiStatusPill', 'provideUiStatus']);
  });

  it('keeps the internal formatter out of the public types', () => {
    const types = readDist(target().types ?? 'missing-entry-types');
    expect(types).not.toContain('formatStatus');
    // Unexported, not removed: the helper is compiled into the entry point's bundle.
    expect(readDist(target().default ?? 'missing-entry-bundle')).toContain('formatStatus');
  });
});
