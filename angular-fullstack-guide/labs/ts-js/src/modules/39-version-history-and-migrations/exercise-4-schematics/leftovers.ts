// Exercise 39.4: the leftover scanner. It reports what the schematics that ran in memory did not migrate, from the
// tree they return, with TypeScript's compiler API (the same four kinds section 10's leftover test checks on disk).
import ts from 'typescript';
import type { Workspace } from '../support/run-schematic';
import { legacyFolder } from './workspace';

export type Leftover = 'NgModule' | 'structural directive' | 'decorator input' | 'constructor injection';

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

/** `kind: file` for every leftover in the tree's legacy folder, sorted. */
export function scanLeftovers(tree: Workspace): string[] {
  return Object.entries(tree)
    .filter(([path]) => path.startsWith(legacyFolder) && path.endsWith('.ts'))
    .flatMap(([path, text]) => [...leftoversIn(text)].map((kind) => `${kind}: ${path.slice(legacyFolder.length)}`))
    .sort();
}
