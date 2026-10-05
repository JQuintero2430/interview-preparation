import { checkImports, checkProject, extractEdges, parseModule, resolveSpecifier } from './boundaries';

describe('parseModule', () => {
  test('layers with slices and layers without', () => {
    expect(parseModule('features/cart/ui/CartButton.tsx')).toEqual({ layer: 'features', slice: 'cart', rest: 'ui/CartButton.tsx' });
    expect(parseModule('shared/ui/Button.tsx')).toEqual({ layer: 'shared', slice: null, rest: 'ui/Button.tsx' });
    expect(parseModule('app/main.tsx')).toEqual({ layer: 'app', slice: null, rest: 'main.tsx' });
  });

  test('anything outside the layers is not ours', () => {
    expect(parseModule('components/Button.tsx')).toBeNull();
    expect(parseModule('features')).toBeNull();
  });
});

describe('checkImports', () => {
  test('downward imports through a slice index are allowed', () => {
    const edges = [
      { from: 'pages/checkout/ui/CheckoutPage.tsx', to: 'features/cart/index.ts' },
      { from: 'features/cart/ui/CartButton.tsx', to: 'entities/product/index.ts' },
      { from: 'entities/product/ui/ProductCard.tsx', to: 'shared/ui/Button.tsx' },
      { from: 'features/cart/ui/CartButton.tsx', to: 'features/cart/model/store.ts' },
    ];
    expect(checkImports(edges)).toEqual([]);
  });

  test('an upward import is rejected', () => {
    const [v] = checkImports([{ from: 'shared/ui/Button.tsx', to: 'features/cart/index.ts' }]);
    expect(v?.rule).toBe('upward-layer');
  });

  test('two slices on one layer must not import each other', () => {
    const [v] = checkImports([{ from: 'features/cart/ui/CartButton.tsx', to: 'features/wishlist/index.ts' }]);
    expect(v?.rule).toBe('cross-slice');
  });

  test('reaching into another slice internals is a deep import', () => {
    const [v] = checkImports([{ from: 'pages/checkout/ui/Page.tsx', to: 'features/cart/model/store.ts' }]);
    expect(v?.rule).toBe('deep-import');
  });

  test('packages and unknown paths are ignored', () => {
    expect(checkImports([{ from: 'features/cart/ui/A.tsx', to: 'utils/format.ts' }])).toEqual([]);
  });
});

describe('extracting edges from source', () => {
  test('relative and alias specifiers resolve to src-relative paths', () => {
    expect(resolveSpecifier('features/cart/ui/A.tsx', '../model/store')).toBe('features/cart/model/store');
    expect(resolveSpecifier('features/cart/ui/A.tsx', '@/entities/product')).toBe('entities/product');
    expect(resolveSpecifier('features/cart/ui/A.tsx', 'react')).toBeNull();
  });

  test('static, type, side-effect, re-export and dynamic imports are all seen', () => {
    const source = `
      import { useState } from 'react';
      import type { Product } from '@/entities/product';
      import {
        a,
        b,
      } from '@/shared/lib/math';
      import './styles.css';
      export { x } from '../model/store';
      const Lazy = import('@/widgets/header');
    `;
    expect(extractEdges('features/cart/ui/A.tsx', source).map((e) => e.to)).toEqual([
      'entities/product',
      'shared/lib/math',
      'features/cart/ui/styles.css',
      'features/cart/model/store',
      'widgets/header',
    ]);
  });

  test('checkProject reports one violation per bad edge', () => {
    const violations = checkProject({
      'features/cart/ui/A.tsx': `import { w } from '@/features/wishlist';\nimport { p } from '@/entities/product';`,
      'entities/product/index.ts': `import { f } from '@/features/cart';`,
    });
    expect(violations.map((v) => [v.from, v.rule])).toEqual([
      ['features/cart/ui/A.tsx', 'cross-slice'],
      ['entities/product/index.ts', 'upward-layer'],
    ]);
  });
});
