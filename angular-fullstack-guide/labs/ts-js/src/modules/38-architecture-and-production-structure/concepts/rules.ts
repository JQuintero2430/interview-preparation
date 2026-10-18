// Section 4: the dependency rules as data. A project is a library type plus a scope.
export type LibraryType = 'feature' | 'ui' | 'data-access' | 'util';
export type Scope = 'orders' | 'catalog' | 'shared';
export interface Project {
  type: LibraryType;
  scope: Scope;
}

// Each type lists the types it may import (the direction: feature -> ui, data-access, util).
export const allowedTypes: Record<LibraryType, readonly LibraryType[]> = {
  feature: ['feature', 'ui', 'data-access', 'util'],
  ui: ['ui', 'util'],
  'data-access': ['data-access', 'util'],
  util: ['util'],
};

// A scope may import itself and shared; shared may import only shared.
export function allowedScopes(scope: Scope): readonly Scope[] {
  return scope === 'shared' ? ['shared'] : [scope, 'shared'];
}

export function mayImport(from: Project, to: Project): boolean {
  return allowedTypes[from.type].includes(to.type) && allowedScopes(from.scope).includes(to.scope);
}
