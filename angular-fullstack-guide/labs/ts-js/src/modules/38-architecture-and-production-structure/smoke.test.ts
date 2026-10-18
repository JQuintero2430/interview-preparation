// Smoke: the ui-lib build output exists and names its package (read-only).

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, existsSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  existsSync: (path: URL) => boolean;
};

const distRoot = new URL('../../../../angular/dist/ui-lib/', import.meta.url);

describe('Module 38 lab smoke', () => {
  it('Smoke: dist/ui-lib/package.json names the ui-lib package', () => {
    const manifest = new URL('package.json', distRoot);
    if (!existsSync(manifest)) throw new Error('run `npx ng build ui-lib` in labs/angular first');

    const pkg = JSON.parse(readFileSync(manifest, 'utf8')) as { readonly name: string };
    expect(pkg.name).toBe('ui-lib');
  });
});
