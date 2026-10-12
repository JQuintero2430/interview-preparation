import { reflectComponentType, type Type } from '@angular/core';

export interface InputEntry {
  readonly property: string;
  readonly publicName: string;
  readonly isSignal: boolean;
}

export interface ComponentEntry {
  readonly name: string;
  readonly selector: string;
  readonly inputs: readonly InputEntry[];
  readonly outputs: readonly string[];
  readonly contentSlots: readonly string[];
  readonly standalone: boolean;
}

export interface NotAComponentEntry {
  readonly name: string;
  readonly error: 'not a component';
}

export type CatalogEntry = ComponentEntry | NotAComponentEntry;

/** Describes each class through the public reflectComponentType: components by selector, then the rest. */
export function describeComponents(types: readonly Type<unknown>[]): CatalogEntry[] {
  const entries = types.map(describeComponent);
  const components = entries
    .filter(isComponentEntry)
    .sort((a, b) => compareText(a.selector, b.selector));
  const others = entries.filter((entry) => !isComponentEntry(entry));
  return [...components, ...others];
}

function describeComponent(type: Type<unknown>): CatalogEntry {
  const mirror = reflectComponentType(type);
  if (mirror === null) {
    return { name: type.name, error: 'not a component' };
  }
  return {
    name: type.name,
    selector: mirror.selector,
    inputs: mirror.inputs.map(({ propName, templateName, isSignal }) => ({
      property: propName,
      publicName: templateName,
      isSignal,
    })),
    outputs: mirror.outputs.map((output) => output.templateName),
    contentSlots: [...mirror.ngContentSelectors],
    standalone: mirror.isStandalone,
  };
}

function isComponentEntry(entry: CatalogEntry): entry is ComponentEntry {
  return !('error' in entry);
}

// Code-point order, so the result does not depend on the runtime's locale.
function compareText(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}
