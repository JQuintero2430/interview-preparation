// Section 8 claims: global styles are listed in the lab's angular.json (read-only), not in a component.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, existsSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  existsSync: (path: URL) => boolean;
};

interface Target {
  readonly builder: string;
  readonly options?: { readonly styles?: readonly string[] };
}

interface Workspace {
  readonly projects: Readonly<Record<string, { readonly architect: Readonly<Record<string, Target>> }>>;
}

const labRoot = new URL('../../../../angular/', import.meta.url);
const workspace = JSON.parse(readFileSync(new URL('angular.json', labRoot), 'utf8')) as Workspace;

describe('Section 8: global styles', () => {
  it('Section 8: the lab lists one global stylesheet in angular.json styles', () => {
    const build = workspace.projects['labs']?.architect['build'];

    expect(build?.builder).toBe('@angular/build:application');
    expect(build?.options?.styles).toEqual(['src/styles.css']);
    expect(existsSync(new URL('src/styles.css', labRoot))).toBe(true);
  });
});
