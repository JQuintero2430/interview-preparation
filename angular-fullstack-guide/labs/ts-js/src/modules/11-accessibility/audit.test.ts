// @vitest-environment jsdom
// Exercise 11.3 tests: the ten rules of a miniature audit. Rule ids are axe-core's, the implementation is the model's own.
// The axe-core 4.14.0 ids below are constants copied from a throwaway run on 2026-10-07 (module 11 section 7); no test imports axe.
import { afterEach, describe, expect, it } from 'vitest';
import { audit, type RuleId } from './audit';
import { mount, unmount } from './support/dom';

afterEach(unmount);

/** Axe-core 4.14.0 violations on the throwaway page of section 7, from the run recorded on 2026-10-07 (not asserted by running axe here). */
const AXE_4_14_0_VIOLATIONS = ['button-name', 'heading-order', 'image-alt', 'label'];

const CLEAN = `<main><h1>Orders</h1><h2 id="s">Shipping</h2>
  <img src="a.png" alt="Logo"><img src="b.png" alt="">
  <button type="button" aria-label="Close"><svg></svg></button><a href="/help">Help centre</a>
  <label for="e">Email</label><input id="e" aria-describedby="hint"><p id="hint">We never share it.</p>
  <div role="button" tabindex="0">Open</div><div aria-hidden="true">decoration</div></main>`;

const CASES: ReadonlyArray<readonly [RuleId, string, string[]]> = [
  ['image-alt', '<img id="a" src="x.png"><img id="b" src="y.png" alt="Logo"><img id="c" src="z.png" alt="">', ['a']],
  ['button-name', '<button id="a"></button><button id="b" aria-label="Close"></button><button id="c">Save</button><div id="d" role="button" tabindex="0"></div>', ['a', 'd']],
  ['link-name', '<a id="a" href="/x"><img src="i.png" alt=""></a><a id="b" href="/y">Home</a><a id="c" name="anchor"></a>', ['a']],
  ['label', '<input id="a"><input id="b" placeholder="Search"><label>Name <input id="c"></label><input id="d" type="submit" value="Go"><select id="e"></select>', ['a', 'b', 'e']],
  ['duplicate-id', '<p id="x"></p><p id="y"></p><p id="x"></p><p id="x"></p>', ['x', 'x']],
  ['aria-hidden-focus', '<div id="a" aria-hidden="true"><button>One</button></div><div id="b" aria-hidden="true"><span>text</span></div><button id="c" aria-hidden="true">Two</button>', ['a', 'c']],
  ['tabindex', '<div id="a" tabindex="2"></div><div id="b" tabindex="0"></div><div id="c" tabindex="-1"></div>', ['a']],
  ['heading-order', '<h1>One</h1><h2 id="a">Two</h2><h4 id="b">Four</h4><h2 id="c">Back</h2>', ['b']],
  ['aria-valid-attr-value', '<span id="n">Name</span><input id="a" aria-labelledby="n"><input id="b" aria-labelledby="n gone"><input id="c" aria-describedby="missing">', ['b', 'c']],
  ['interactive-supports-focus', '<div id="a" role="button">Go</div><div id="b" role="button" tabindex="0">Go</div><button id="c" role="button">Go</button><div id="d" role="tab" tabindex="-1">Tab</div>', ['a']],
];

const ids = (rule: RuleId): string[] => audit().filter((violation) => violation.rule === rule).map((violation) => violation.element.id);

describe('E11.3 A miniature accessibility audit', () => {
  it('a clean fixture returns no violations and leaves the DOM unchanged', () => {
    const root = mount(CLEAN);
    const before = root.innerHTML;
    expect(audit(root)).toEqual([]);
    expect(root.innerHTML).toBe(before);
  });

  it.each(CASES)('each rule reports exactly the offending elements on a fixture built for it: %s', (rule, html, expected) => {
    mount(html);
    expect(ids(rule)).toEqual(expected);
  });

  it('an img with alt="" is not a violation and an img with no alt attribute is', () => {
    mount('<img id="a" src="x.png" alt=""><img id="b" src="y.png">');
    expect(ids('image-alt')).toEqual(['b']);
  });

  it('names come from accessibleName (an icon button named by aria-label passes)', () => {
    mount('<span id="t">Delete</span><button id="a" aria-label="Close"><svg></svg></button><button id="b" aria-labelledby="t"></button><button id="c" title="Tip"></button><button id="d"><svg></svg></button>');
    expect(ids('button-name')).toEqual(['d']);
  });

  it('results are in document order and each carries its rule id', () => {
    mount('<h1>T</h1><img id="i" src="x.png"><h3 id="h">Deep</h3><button id="b"></button><input id="f">');
    const found = audit().map((violation) => [violation.element.id, violation.rule]);
    expect(found).toEqual([['i', 'image-alt'], ['h', 'heading-order'], ['b', 'button-name'], ['f', 'label']]);
    expect(audit().every((violation) => violation.message.length > 0)).toBe(true);
  });

  it('on the shared fixture the audit reports the four rule ids axe-core 4.14.0 reported in a throwaway run, and also interactive-supports-focus, which that run did not', () => {
    mount('<main><h1>Orders</h1><img src="a.png"><button></button><input><div role="button" onclick="go()">Open</div><h3>Details</h3><a href="/help">click here</a></main>');
    const found = audit().map((violation) => violation.rule);
    expect([...new Set(found)].sort()).toEqual([...AXE_4_14_0_VIOLATIONS, 'interactive-supports-focus'].sort());
    expect(found.filter((rule) => rule === 'link-name')).toEqual([]);
  });
});
