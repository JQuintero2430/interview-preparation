// @vitest-environment jsdom
// Section 9 claims: one counter change run through our model of react-dom 19.3.1's bailout rules (mini-rerender.ts)
// and our model of solid-js 1.9.17's update path (mini-fine-grained.ts). Neither React nor Solid is run here.
import { el, memo, mount, useState, type Element } from './mini-rerender';
import { createComponent, createSignal, insertText } from './mini-fine-grained';

describe('Module 40 · section 9', () => {
  it('Section 9: one counter change re-runs the header and its non-memo children in our re-render model', () => {
    let setCount: (next: number) => boolean = () => false;
    function Title(): readonly Element[] {
      return [];
    }
    function Count(): readonly Element[] {
      return [];
    }
    const Nav = memo(function Nav(): readonly Element[] {
      return [];
    });
    function Header(): readonly Element[] {
      const [count, set] = useState(0);
      setCount = set;
      return [el(Title, { text: 'Shop' }), el(Count, { value: count }), el(Nav)];
    }
    const app = mount(el(Header));
    expect(app.rendered).toEqual(['Header', 'Title', 'Count', 'Nav']);
    expect(setCount(1)).toBe(true);
    expect(app.flush()).toEqual(['Header', 'Title', 'Count']);
  });

  it('Section 9: the same change runs one bound effect and no component function in our fine-grained model', () => {
    const calls: string[] = [];
    let effectRuns = 0;
    let countText: Text | undefined;
    const [count, setCount] = createSignal(0);
    function Title(): Node {
      calls.push('Title');
      const h1 = document.createElement('h1');
      insertText(h1, 'Shop');
      return h1;
    }
    function Count(): Node {
      calls.push('Count');
      const span = document.createElement('span');
      countText = insertText(span, () => {
        effectRuns += 1;
        return count();
      });
      return span;
    }
    function Header(): Node {
      calls.push('Header');
      const header = document.createElement('header');
      header.append(createComponent(Title, {}), createComponent(Count, {}));
      return header;
    }
    const view = createComponent(Header, {});
    expect(calls).toEqual(['Header', 'Title', 'Count']);
    expect(effectRuns).toBe(1);

    const observer = new MutationObserver(() => undefined);
    observer.observe(view, { characterData: true, childList: true, subtree: true });
    setCount(1);
    const records = observer.takeRecords();
    observer.disconnect();

    expect(calls).toEqual(['Header', 'Title', 'Count']);
    expect(effectRuns).toBe(2);
    expect(records).toHaveLength(1);
    expect(records[0]?.target).toBe(countText);
    expect(view.textContent).toBe('Shop1');
  });
});
