// Section 10 claim: after the migration program the migrated folder keeps none of the legacy folder's leftovers.
// Cross-lab read (plan C10): parses labs/angular/src/app/modules/39-version-history-and-migrations/{legacy,migrated}
// with the TypeScript compiler API, read-only; no git, npm, ng, network or clock.
import ts from 'typescript';

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

const featureRoot = new URL('../../../../../angular/src/app/modules/39-version-history-and-migrations/', import.meta.url);

type Leftover = 'NgModule' | 'structural directive' | 'decorator input' | 'constructor injection';

function decoratorName(decorator: ts.Decorator): string | undefined {
  const call = decorator.expression;
  return ts.isCallExpression(call) && ts.isIdentifier(call.expression) ? call.expression.text : undefined;
}

function isTemplateWithStructuralDirective(node: ts.Node): boolean {
  return (
    ts.isPropertyAssignment(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === 'template' &&
    ts.isStringLiteralLike(node.initializer) &&
    /\*ng[A-Z]/.test(node.initializer.text)
  );
}

/** The kinds of leftover one source file contains. */
function leftoversIn(text: string): Set<Leftover> {
  const found = new Set<Leftover>();
  const visit = (node: ts.Node): void => {
    const decorators = ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []).map(decoratorName) : [];
    if (decorators.includes('NgModule')) found.add('NgModule');
    if (decorators.includes('Input')) found.add('decorator input');
    if (ts.isConstructorDeclaration(node) && node.parameters.length > 0) found.add('constructor injection');
    if (isTemplateWithStructuralDirective(node)) found.add('structural directive');
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile('scanned.ts', text, ts.ScriptTarget.Latest, true));
  return found;
}

/** `kind: file` for every leftover in the folder's non-spec .ts files, sorted. */
function scan(folder: 'legacy' | 'migrated'): string[] {
  const dir = new URL(`${folder}/`, featureRoot);
  if (!existsSync(dir)) throw new Error(`labs/angular/src/app/modules/39-version-history-and-migrations/${folder}/ is missing`);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'))
    .flatMap((name) => [...leftoversIn(readFileSync(new URL(name, dir), 'utf8'))].map((kind) => `${kind}: ${name}`))
    .sort();
}

describe('Section 10: leftovers of the migration program', () => {
  it('Section 10: the migrated folder has no NgModule, structural directive, decorator input or constructor injection', () => {
    // The legacy folder is the control: the same scan finds each kind there.
    expect(scan('legacy')).toEqual([
      'NgModule: legacy-orders.module.ts',
      'constructor injection: legacy-order-panel.ts',
      'decorator input: legacy-order-panel.ts',
      'structural directive: legacy-order-panel.ts',
    ]);
    expect(scan('migrated')).toEqual([]);
  });
});
