import { describe, expect, it } from 'vitest';
import { findDuplicates, type NpmLsNode } from './duplicates';

describe('findDuplicates', () => {
  it('flags two versions of react (a library bundled its own)', () => {
    const tree: NpmLsNode = {
      name: 'app',
      dependencies: {
        react: { version: '19.3.0' },
        'old-widget': { version: '2.0.0', dependencies: { react: { version: '18.3.1' } } },
      },
    };
    const report = findDuplicates(tree);
    expect(report?.copies.map((c) => c.version)).toEqual(['18.3.1', '19.3.0']);
    expect(report?.copies[0]?.requiredBy).toEqual(['app > old-widget > react']);
  });

  it('is quiet when every reference is the same copy', () => {
    const tree: NpmLsNode = {
      name: 'app',
      dependencies: {
        react: { version: '19.3.0' },
        'react-dom': { version: '19.3.0', dependencies: { react: { version: '19.3.0' } } },
      },
    };
    expect(findDuplicates(tree)).toBeNull();
  });

  it('uses the physical path to catch the same version installed twice', () => {
    const tree: NpmLsNode = {
      name: 'app',
      dependencies: {
        react: { version: '19.3.0', path: '/app/node_modules/react' },
        linked: { version: '1.0.0', dependencies: { react: { version: '19.3.0', path: '/lib/node_modules/react' } } },
      },
    };
    expect(findDuplicates(tree)?.copies).toHaveLength(2);
  });

  it('returns null when the package is absent or the tree is empty', () => {
    expect(findDuplicates({ name: 'app' })).toBeNull();
    expect(findDuplicates({ name: 'app', dependencies: { lodash: { version: '4.17.21' } } })).toBeNull();
  });

  it('can look for any package', () => {
    const tree: NpmLsNode = {
      name: 'app',
      dependencies: {
        a: { version: '1.0.0', dependencies: { 'react-dom': { version: '19.0.0' } } },
        b: { version: '1.0.0', dependencies: { 'react-dom': { version: '18.0.0' } } },
      },
    };
    expect(findDuplicates(tree, 'react-dom')?.copies).toHaveLength(2);
  });
});
