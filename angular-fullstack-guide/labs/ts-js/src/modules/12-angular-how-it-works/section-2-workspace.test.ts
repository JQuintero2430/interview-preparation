// Section 2 claims: the lab's angular.json (read-only) maps the labs application project to targets, each a builder with options and named configurations.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

interface Budget {
  readonly type: string;
  readonly maximumWarning?: string;
  readonly maximumError?: string;
}

interface Target {
  readonly builder: string;
  readonly options?: Readonly<Record<string, unknown>>;
  readonly configurations?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly defaultConfiguration?: string;
}

interface Project {
  readonly projectType: 'application' | 'library';
  readonly root: string;
  readonly sourceRoot: string;
  readonly prefix: string;
  readonly architect: Readonly<Record<string, Target>>;
}

interface Workspace {
  readonly version: number;
  readonly projects: Readonly<Record<string, Project>>;
}

const workspace = JSON.parse(readFileSync(new URL('../../../../angular/angular.json', import.meta.url), 'utf8')) as Workspace;

function target(name: string): Target {
  const found = workspace.projects['labs']?.architect[name];
  if (!found) throw new Error(`no target ${name}`);
  return found;
}

describe('Section 2: the CLI workspace (labs/angular/angular.json)', () => {
  it('Section 2: the lab workspace maps the labs application project to build, serve and test targets', () => {
    expect(workspace.version).toBe(1);
    // ssr-lab is module 32's SSR project (HOUSE-26), security-lab module 33's CSP project (HOUSE-29) and
    // i18n-lab, module 34's locale project (HOUSE-31), animations-lab, module 35's motion project (HOUSE-33), and
    // material-lab, module 36's Material project (HOUSE-35), and elements-lab, module 37's Elements and service-worker project
    // (HOUSE-38), and ui-lib, module 38's library project (HOUSE-40), in the order they were added; this section reads
    // only the labs project.
    expect(Object.keys(workspace.projects)).toEqual(['labs', 'ssr-lab', 'security-lab', 'i18n-lab', 'animations-lab', 'material-lab', 'elements-lab', 'ui-lib']);
    const project = workspace.projects['labs'];
    expect(project?.projectType).toBe('application');
    expect(project?.prefix).toBe('lab');
    expect(project?.sourceRoot).toBe('src');
    expect(Object.keys(project?.architect ?? {})).toEqual(['build', 'serve', 'test']);
  });

  it('Section 2: build uses @angular/build:application and defaults to the production configuration', () => {
    expect(target('build').builder).toBe('@angular/build:application');
    expect(target('build').defaultConfiguration).toBe('production');
    expect(target('build').options?.['browser']).toBe('src/main.ts');
    expect(target('serve').builder).toBe('@angular/build:dev-server');
    expect(target('serve').defaultConfiguration).toBe('development');
    expect(target('serve').configurations?.['development']?.['buildTarget']).toBe('labs:build:development');
    expect(target('test').builder).toBe('@angular/build:unit-test');
  });

  it('Section 2: the production configuration sets budgets and output hashing, development turns optimization off', () => {
    const production = target('build').configurations?.['production'];
    const budgets = production?.['budgets'] as readonly Budget[] | undefined;
    expect(budgets?.map((budget) => budget.type)).toEqual(['initial', 'anyComponentStyle']);
    expect(production?.['outputHashing']).toBe('all');
    expect(target('build').configurations?.['development']).toEqual({ optimization: false, extractLicenses: false, sourceMap: true });
  });
});
