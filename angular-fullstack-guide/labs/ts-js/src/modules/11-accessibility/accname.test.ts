// @vitest-environment jsdom
// Exercise 11.2 tests: a model of the Accessible Name and Description Computation 1.2 (W3C Working Draft, 02 October 2026) for a subset.
// jsdom has no accessibility tree (`computedRole` is undefined), so these are results of the model, not of a browser or a screen reader.
// Step names are the draft's own ("LabelledBy", "AriaLabel", "Host Language Label", "Name From Content", "Tooltip"); examples 1, 2, 3 and 5
// of section 4.3.2 are reproduced with `div` and `span` in place of its made-up element names.
import { afterEach, describe, expect, it } from 'vitest';
import { accessibleDescription, accessibleName } from './accname';
import { mount, need, unmount } from './support/dom';

afterEach(unmount);

/** Mounts the markup alone (ids repeat between cases, so the previous case is removed first) and names the element. */
function nameOf(html: string, selector: string): string {
  unmount();
  return accessibleName(need(mount(html), selector));
}

describe('E11.2 An accessible-name calculator (a subset of AccName 1.2)', () => {
  it('aria-labelledby joins the referenced text in IDREF order, even when hidden, beats aria-label and native labels, and is followed once (LabelledBy)', () => {
    // Example 1: hidden element2 and element3, still "hello". Example 2: element3 hidden inside a visible element2, no name.
    expect(nameOf('<div id="a" role="button" aria-labelledby="b"></div><div id="b" hidden><div id="c" hidden>hello</div></div>', '#a')).toBe('hello');
    expect(nameOf('<div id="a" role="button" aria-labelledby="b"></div><div id="b"><div id="c" hidden>hello</div></div>', '#a')).toBe('');
    // IDREF order, and it wins over aria-label and a native label.
    const html = '<span id="x">Alpha</span><span id="y">Beta</span><label for="i">Native</label><input id="i" aria-label="Label" aria-labelledby="y x">';
    expect(nameOf(html, '#i')).toBe('Beta Alpha');
    // Example 3: each aria-labelledby is followed once, so element2 (which points at element1) has no name.
    const chain = '<div id="e1" aria-labelledby="e3"></div><div id="e2" aria-labelledby="e1"></div><div id="e3"> hello </div>';
    expect([nameOf(chain, '#e1'), accessibleName(need(document.body, '#e2'))]).toEqual(['hello', '']);
    // Example 5: a self-reference falls through to aria-label for itself, then adds the link text.
    const rows = '<a id="f1" href="./Documentation.pdf">Documentation.pdf</a><span id="d1" role="button" tabindex="0" aria-label="Delete" aria-labelledby="d1 f1"></span>';
    expect(nameOf(rows, '#d1')).toBe('Delete Documentation.pdf');
  });

  it('aria-label is next, and a blank value falls through (AriaLabel)', () => {
    expect(nameOf('<button id="b" aria-label="Close">x</button>', '#b')).toBe('Close');
    expect(nameOf('<button id="b" aria-label="   ">Save</button>', '#b')).toBe('Save');
  });

  it('native labels name input, img, fieldset, table and button inputs (Host Language Label)', () => {
    expect(nameOf('<label for="n">Full name</label><input id="n" value="Ana">', '#n')).toBe('Full name');
    expect(nameOf('<label>Full <input id="n" value="Ana"> name</label>', '#n')).toBe('Full name');
    expect(nameOf('<img id="p" src="a.png" alt="Company logo">', '#p')).toBe('Company logo');
    expect(nameOf('<img id="p" src="a.png" alt="" title="Ignored">', '#p')).toBe('');
    expect(nameOf('<fieldset id="f"><legend>Shipping</legend><input></fieldset>', '#f')).toBe('Shipping');
    expect(nameOf('<table id="t"><caption>Orders</caption><tr><td>1</td></tr></table>', '#t')).toBe('Orders');
    expect(nameOf('<input id="s" type="submit" value="Send">', '#s')).toBe('Send');
    // HTML-AAM: a hidden label, legend or caption provides no name.
    expect(nameOf('<label for="n" hidden>Hidden</label><input id="n">', '#n')).toBe('');
  });

  it('button, a[href], headings and the roles button, link, tab, menuitem and heading take the name from content, skipping hidden nodes (Name From Content)', () => {
    const html = [
      '<button id="b"><span>Add</span> <img src="c.png" alt="item"> <span aria-hidden="true">x</span><span style="display: none">y</span></button>',
      '<a id="a" href="/orders">Orders <span style="opacity: 0">now</span></a>',
      '<h2 id="h">Order <em>7</em></h2>',
      '<div id="t" role="tab">Overview</div>',
      '<div id="m" role="menuitem">Open</div>',
      '<div id="plain">Not a name</div>',
    ].join('');
    unmount();
    const root = mount(html);
    const names = ['#b', '#a', '#h', '#t', '#m', '#plain'].map((id) => accessibleName(need(root, id)));
    expect(names).toEqual(['Add item', 'Orders now', 'Order 7', 'Overview', 'Open', '']);
    // Hidden Not Referenced: a hidden root is empty.
    expect(accessibleName(need(mount('<button id="z" hidden>Hidden</button>'), '#z'))).toBe('');
  });

  it('title is the fallback, and placeholder the last one for text inputs only (Tooltip)', () => {
    expect(nameOf('<button id="b" title="Close"></button>', '#b')).toBe('Close');
    expect(nameOf('<input id="i" title="Tip" placeholder="Hint">', '#i')).toBe('Tip');
    expect(nameOf('<input id="i" placeholder="Search">', '#i')).toBe('Search');
    expect(nameOf('<input id="c" type="checkbox" placeholder="Hint">', '#c')).toBe('');
    expect(nameOf('<label for="i">Label</label><input id="i" title="Tip" placeholder="Hint">', '#i')).toBe('Label');
  });

  it('whitespace is collapsed and trimmed', () => {
    expect(nameOf('<button id="b">\n  Add   to\tcart \n</button>', '#b')).toBe('Add to cart');
    expect(nameOf('<div id="d" role="button" aria-label="  Save   all ">x</div>', '#d')).toBe('Save all');
  });

  it('the description joins aria-describedby texts, else uses title when it was not the name', () => {
    const html = '<p id="h1">We never share it.</p><p id="h2" hidden>Optional.</p><input id="e" aria-label="Email" aria-describedby="h1 h2" title="Tip">';
    const root = mount(html);
    expect(accessibleDescription(need(root, '#e'))).toBe('We never share it. Optional.');
    expect(accessibleDescription(need(mount('<input id="t" aria-label="Email" title="Tip">'), '#t'))).toBe('Tip');
    expect(accessibleDescription(need(mount('<button id="u" title="Close"></button>'), '#u'))).toBe('');
  });
});
