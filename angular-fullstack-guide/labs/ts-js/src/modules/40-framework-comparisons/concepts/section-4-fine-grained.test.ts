// @vitest-environment jsdom
// Section 4 claims about our model of solid-js 1.9.17's update path (mini-fine-grained.ts); Solid itself is not run.
import { createComponent, createSignal, insertText } from './mini-fine-grained';

describe('Module 40 · section 4', () => {
  it('Section 4: our fine-grained model calls the component function once', () => {
    let calls = 0;
    const [count, setCount] = createSignal(0);
    function Counter(): Node {
      calls += 1;
      const div = document.createElement('div');
      insertText(div, () => count());
      return div;
    }
    const view = createComponent(Counter, {});
    setCount(1);
    setCount(2);
    expect(calls).toBe(1);
    expect(view.textContent).toBe('2');
  });

  it('Section 4: our fine-grained model writes only the text node bound to the changed signal', () => {
    const [a, setA] = createSignal(0);
    const [b] = createSignal(0);
    const root = document.createElement('div');
    const textA = insertText(root, () => a());
    const textB = insertText(root, () => b());
    const observer = new MutationObserver(() => undefined);
    observer.observe(root, { characterData: true, childList: true, subtree: true });
    setA(5);
    const records = observer.takeRecords();
    observer.disconnect();
    expect(records).toHaveLength(1);
    expect(records[0]?.target).toBe(textA);
    expect([textA.data, textB.data]).toEqual(['5', '0']);
  });

  it('Section 4: a value read into a constant in the component body never updates in our fine-grained model', () => {
    const [count, setCount] = createSignal(0);
    const texts: Text[] = [];
    function Label(): Node {
      const div = document.createElement('div');
      const snapshot = count();
      texts.push(insertText(div, snapshot), insertText(div, () => count()));
      return div;
    }
    createComponent(Label, {});
    setCount(3);
    expect(texts.map((text) => text.data)).toEqual(['0', '3']);
  });
});
