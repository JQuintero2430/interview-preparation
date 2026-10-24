// @vitest-environment jsdom
// Exercise 40.1: six criteria, each run over both runtimes. Both are our code, modeled on react-dom 19.3.1 (a) and
// @vue/runtime-core 3.5.44 (b), read, not run; neither React nor Vue runs here. DOM writes and moves are counted
// with a MutationObserver's takeRecords(), never with timings.
import { render as renderA } from './a/runtime';
import { render as renderB } from './b/runtime';
import type { RenderFn } from './renderer';
import { c, h, memo } from './vdom';
import type { State, VNode } from './vdom';

const list = (ids: readonly string[]): VNode => h('ul', ids.map((id) => h('li', [id], id)));
const items = (container: Element): Element[] => Array.from(container.querySelectorAll('li'));

describe.each<[string, RenderFn, number]>([
  ['a (lastPlacedIndex, modeled on react-dom 19.3.1)', renderA, 4],
  ['b (longest increasing subsequence, modeled on @vue/runtime-core 3.5.44)', renderB, 1],
])('Exercise 40.1 · runtime %s', (_variant, render, lastToFrontMoves) => {
  it('mounts a nested tree of elements, text and components into the container', () => {
    const Item = (props: { readonly label: string }): VNode => h('li', [props.label]);
    const container = document.createElement('div');
    render(h('main', [h('h1', ['Shop']), h('ul', [c(Item, { label: 'pen' }), c(Item, { label: 'ink' })])]), container);
    expect(container.innerHTML).toBe('<main><h1>Shop</h1><ul><li>pen</li><li>ink</li></ul></main>');
  });

  it('writes only the text node whose value changed on an update', () => {
    const Total = (props: { readonly count: number }): VNode => h('p', [`items: ${props.count}`]);
    const view = (count: number): VNode => h('section', [h('h1', ['Cart']), c(Total, { count })]);
    const container = document.createElement('div');
    render(view(1), container);
    const observer = new MutationObserver(() => undefined);
    observer.observe(container, { subtree: true, childList: true, characterData: true, attributes: true });

    render(view(2), container);
    const records = observer.takeRecords();
    observer.disconnect();
    expect(records.map((record) => record.type)).toEqual(['characterData']);
    expect(records[0]?.target.textContent).toBe('items: 2');
    expect(container.textContent).toBe('Cartitems: 2');
  });

  it("keeps every keyed row's DOM node when the rows are reordered", () => {
    const container = document.createElement('div');
    render(list(['a', 'b', 'c', 'd']), container);
    const [a, b, c2, d] = items(container);

    render(list(['c', 'a', 'd', 'b']), container);
    const after = items(container);
    expect(after.map((li) => li.textContent)).toEqual(['c', 'a', 'd', 'b']);
    [c2, a, d, b].forEach((node, i) => expect(after[i]).toBe(node));
  });

  it('replaces a row whose key changed and discards its component state', () => {
    let stamps = 0;
    const Row = (props: { readonly label: string }, state: State): VNode => {
      if (!state.has('stamp')) state.set('stamp', ++stamps);
      return h('li', [`${props.label}#${String(state.get('stamp'))}`]);
    };
    const rows = (keys: readonly string[]): VNode =>
      h('ul', keys.map((key, i) => c(Row, { label: ['a', 'b', 'c'][i] ?? key }, key)));
    const container = document.createElement('div');
    render(rows(['a', 'b', 'c']), container);
    const before = items(container);
    expect(before.map((li) => li.textContent)).toEqual(['a#1', 'b#2', 'c#3']);

    render(rows(['a', 'x', 'c']), container);
    const after = items(container);
    expect(after.map((li) => li.textContent)).toEqual(['a#1', 'b#4', 'c#3']);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
    expect(after[2]).toBe(before[2]);
  });

  it('skips a memo component whose props are shallow-equal', () => {
    const calls: string[] = [];
    const Label = memo((props: { readonly text: string }): VNode => {
      calls.push('Label');
      return h('span', [props.text]);
    });
    const Plain = (props: { readonly text: string }): VNode => {
      calls.push('Plain');
      return h('span', [props.text]);
    };
    const view = (text: string): VNode => h('div', [c(Label, { text }), c(Plain, { text })]);
    const container = document.createElement('div');
    render(view('total'), container);
    render(view('total'), container);
    expect(calls).toEqual(['Label', 'Plain', 'Plain']);

    render(view('sum'), container);
    expect(calls).toEqual(['Label', 'Plain', 'Plain', 'Label', 'Plain']);
    expect(container.textContent).toBe('sumsum');
  });

  it('moves the last row to the front with the number of moves its algorithm predicts', () => {
    const container = document.createElement('div');
    render(list(['a', 'b', 'c', 'd', 'e']), container);
    const before: Node[] = items(container);
    const observer = new MutationObserver(() => undefined);
    observer.observe(container, { subtree: true, childList: true });

    render(list(['e', 'a', 'b', 'c', 'd']), container);
    const records = observer.takeRecords();
    observer.disconnect();
    // A move is an insertBefore of a node already in the list: one record removes it, one adds it back.
    const moves = records.flatMap((record) => Array.from(record.addedNodes)).filter((node) => before.includes(node));
    expect(moves).toHaveLength(lastToFrontMoves);
    expect(items(container).map((li) => li.textContent)).toEqual(['e', 'a', 'b', 'c', 'd']);
    expect(items(container).filter((li) => before.includes(li))).toHaveLength(before.length);
  });
});
