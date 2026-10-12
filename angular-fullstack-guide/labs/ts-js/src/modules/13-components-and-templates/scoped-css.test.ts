// Exercise 13.5 tests: a model of the emulated-encapsulation rewriter (sections 7, 8 and 9), not Angular's ShadowCss.
// The expected strings are observed pairs recorded on 2026-10-07 from the real compiler: `encapsulateStyle(css, 'a-c1')`
// of @angular/compiler 22.2.1 (the public export that runs ShadowCss), whitespace collapsed. Selector pairs were recorded
// inside the rule `<selector> { color: red; }`.
import { describe, expect, it } from 'vitest';
import { scopeCss } from './scoped-css';

const ID = 'a-c1';
const RULE = ' { color: red; }';
const collapse = (css: string): string => css.replace(/\s+/g, ' ').trim();
const scopeSelector = (selector: string): string => collapse(scopeCss(selector + RULE, ID));

type Pairs = ReadonlyArray<readonly [string, string]>;

function expectSelectors(pairs: Pairs): void {
  for (const [selector, observed] of pairs) {
    expect(scopeSelector(selector), selector).toBe(observed + RULE);
  }
}

function expectSheets(pairs: Pairs): void {
  for (const [css, observed] of pairs) {
    expect(collapse(scopeCss(css, ID)), css).toBe(observed);
  }
}

const SELECTORS: Pairs = [
  ['p', 'p[_ngcontent-a-c1]'],
  ['.a', '.a[_ngcontent-a-c1]'],
  ['#i', '#i[_ngcontent-a-c1]'],
  ['input[type=text]', 'input[type=text][_ngcontent-a-c1]'],
  ['*', '*[_ngcontent-a-c1]'],
  ['a, b', 'a[_ngcontent-a-c1], b[_ngcontent-a-c1]'],
  ['.a .b > c + d ~ e', '.a[_ngcontent-a-c1] .b[_ngcontent-a-c1] > c[_ngcontent-a-c1] + d[_ngcontent-a-c1] ~ e[_ngcontent-a-c1]'],
  ['.a.b', '.a.b[_ngcontent-a-c1]'],
];

const HOST: Pairs = [
  [':host', '[_nghost-a-c1]'],
  [':host(.on)', '.on[_nghost-a-c1]'],
  [':host(.on) p', '.on[_nghost-a-c1] p[_ngcontent-a-c1]'],
  [':host > p', '[_nghost-a-c1] > p[_ngcontent-a-c1]'],
  [':host p', '[_nghost-a-c1] p[_ngcontent-a-c1]'],
];

const HOST_CONTEXT: Pairs = [
  [':host-context(.dark) p', '.dark[_nghost-a-c1] p[_ngcontent-a-c1], .dark [_nghost-a-c1] p[_ngcontent-a-c1]'],
  [':host-context(.dark)', '.dark[_nghost-a-c1], .dark [_nghost-a-c1]'],
];

const NG_DEEP: Pairs = [
  ['::ng-deep .b', '.b'],
  ['.a ::ng-deep .b', '.a[_ngcontent-a-c1] .b'],
  ['p ::ng-deep a', 'p[_ngcontent-a-c1] a'],
  [':host ::ng-deep .b', '[_nghost-a-c1] .b'],
  ['.a ::ng-deep .b .c, .d', '.a[_ngcontent-a-c1] .b .c, .d[_ngcontent-a-c1]'],
];

const PSEUDOS: Pairs = [
  ['a:hover', 'a[_ngcontent-a-c1]:hover'],
  ['b::before', 'b[_ngcontent-a-c1]::before'],
  ['a:hover, b::before', 'a[_ngcontent-a-c1]:hover, b[_ngcontent-a-c1]::before'],
  ['p:not(.x)', 'p[_ngcontent-a-c1]:not(.x)'],
  ['p:first-child', 'p[_ngcontent-a-c1]:first-child'],
  ['p::part(foo)', 'p[_ngcontent-a-c1]::part(foo)'],
  ['::part(foo)', '[_ngcontent-a-c1]::part(foo)'],
  ['::slotted(p)', '[_ngcontent-a-c1]::slotted(p)'],
];

const MATCH_NOTHING: Pairs = [
  ['html', 'html[_ngcontent-a-c1]'],
  ['body', 'body[_ngcontent-a-c1]'],
  [':root', '[_ngcontent-a-c1]:root'],
  [':host(.a, .b)', '[_ngcontent-a-c1]:host(.a, .b)'],
];

const AT_RULES: Pairs = [
  [
    '@media (min-width: 600px) { p { color: red; } }',
    '@media (min-width: 600px) { p[_ngcontent-a-c1] { color: red; } }',
  ],
  [
    '@layer base { p { color: red; } }',
    '@layer base { p[_ngcontent-a-c1] { color: red; } }',
  ],
  [
    '@container (min-width: 10px) { p { color: red; } }',
    '@container (min-width: 10px) { p[_ngcontent-a-c1] { color: red; } }',
  ],
];

const KEYFRAMES: Pairs = [
  [
    '@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } } p { animation: spin 1s linear; }',
    '@keyframes _ngcontent-a-c1_spin { from { transform: rotate(0); } to { transform: rotate(360deg); } } p[_ngcontent-a-c1] { animation: _ngcontent-a-c1_spin 1s linear; }',
  ],
  [
    'p { animation-name: spin; } @keyframes spin { to { opacity: 0; } }',
    'p[_ngcontent-a-c1] { animation-name: _ngcontent-a-c1_spin; } @keyframes _ngcontent-a-c1_spin { to { opacity: 0; } }',
  ],
  [
    'p { animation: other 1s; } @keyframes spin { to { opacity: 0; } }',
    'p[_ngcontent-a-c1] { animation: other 1s; } @keyframes _ngcontent-a-c1_spin { to { opacity: 0; } }',
  ],
];


describe('E13.5 · a scoped-CSS rewriter (a model, not Angular)', () => {
  it('type, class, id, attribute and universal selectors each gain the content attribute, per compound selector, across combinators and comma lists', () => {
    expectSelectors(SELECTORS);
  });

  it('`:host`, `:host(.on)`, `:host(.on) p` and `:host > p` use the host attribute', () => {
    expectSelectors(HOST);
  });

  it('`:host-context(.dark) p` yields the two documented selectors', () => {
    expectSelectors(HOST_CONTEXT);
  });

  it('`::ng-deep` stops the rewriting after its position and `::ng-deep .b` yields a global selector', () => {
    expectSelectors(NG_DEEP);
  });

  it('pseudo-classes and pseudo-elements stay after the attribute (`a[_NC]:hover`, `b[_NC]::before`)', () => {
    expectSelectors(PSEUDOS);
  });

  it('rules inside `@media` are rewritten and `@keyframes spin` becomes `<id>_spin` with the matching `animation` reference', () => {
    expectSheets(AT_RULES);
    expectSheets(KEYFRAMES);
  });

  it('`html`, `body` and `:root` get the attribute (the documented "matches nothing" trap) and `:host(.a, .b)` is left unconverted, as the real compiler leaves it', () => {
    expectSelectors(MATCH_NOTHING);
  });
});
