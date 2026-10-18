// Exercise 38.3: the rules, modeled on (not a copy of) @nx/eslint-plugin's depConstraints.
import type { Project } from './imports';

export interface Constraint {
  sourceTag: string;
  /** Every direct dependency needs at least one of these tags; '*' allows any. */
  onlyDependOnLibsWithTags?: string[];
  /** No project reachable through the dependencies may carry any of these tags. */
  notDependOnLibsWithTags?: string[];
}

const only = (sourceTag: string, ...tags: string[]): Constraint => ({ sourceTag, onlyDependOnLibsWithTags: tags });

export const exerciseConstraints: Constraint[] = [
  only('type:app', '*'),
  only('type:core', 'type:core', 'type:app', 'type:ui', 'type:util'),
  only('type:feature', 'type:feature', 'type:ui', 'type:data-access', 'type:util'),
  { ...only('type:ui', 'type:ui', 'type:util'), notDependOnLibsWithTags: ['type:data-access'] },
  only('type:data-access', 'type:data-access', 'type:util'),
  only('type:util', 'type:util'),
  only('scope:orders', 'scope:orders', 'scope:shared'),
  only('scope:catalog', 'scope:catalog', 'scope:shared'),
  only('scope:shared', 'scope:shared'),
];

export const appliesTo = (constraint: Constraint, source: Project): boolean =>
  constraint.sourceTag === '*' || source.tags.includes(constraint.sourceTag);

export const allowsTarget = (constraint: Constraint, target: Project): boolean =>
  !constraint.onlyDependOnLibsWithTags ||
  constraint.onlyDependOnLibsWithTags.includes('*') ||
  constraint.onlyDependOnLibsWithTags.some((tag) => target.tags.includes(tag));

/** The banned tags a project carries, for one constraint. */
export const bannedTagsOn = (constraint: Constraint, project: Project): string[] =>
  (constraint.notDependOnLibsWithTags ?? []).filter((tag) => project.tags.includes(tag));

export const finding = {
  onlyDepend: (from: Project, to: Project) => `only-depend: ${from.name} -> ${to.name}`,
  banned: (from: Project, to: Project, tag: string) => `banned-tag: ${from.name} -> ${to.name} (${tag})`,
  relative: (from: Project, to: Project) => `relative-import: ${from.name} -> ${to.name}`,
  noConstraint: (from: Project) => `no-constraint: ${from.name}`,
};
