// Section 3 claims about our model of react-dom 19.3.1's bailout rules (mini-rerender.ts); React itself is not run.
import { createContext, el, memo, mount, useContext, useState, type Element } from './mini-rerender';

/** Mounts a `Parent` that holds `count` and renders `child(count)`; returns the root and Parent's setter. */
function withParent(child: (count: number) => Element) {
  let setCount: (next: number) => boolean = () => false;
  function Parent(): readonly Element[] {
    const [count, set] = useState(0);
    setCount = set;
    return [child(count)];
  }
  const app = mount(el(Parent));
  return { app, setCount: (next: number) => setCount(next) };
}

const leaf = (): readonly Element[] => [];

describe('Module 40 · section 3', () => {
  it('Section 3: our model re-runs a child without memo whenever its parent re-renders', () => {
    function Plain(): readonly Element[] {
      return leaf();
    }
    const { app, setCount } = withParent(() => el(Plain, { label: 'total' }));
    expect(app.rendered).toEqual(['Parent', 'Plain']);
    expect(setCount(1)).toBe(true);
    expect(app.flush()).toEqual(['Parent', 'Plain']);
  });

  it('Section 3: our model skips a memo child whose props are shallow-equal', () => {
    const MemoLabel = memo(function MemoLabel(): readonly Element[] {
      return leaf();
    });
    const { app, setCount } = withParent(() => el(MemoLabel, { label: 'total' }));
    expect(setCount(1)).toBe(true);
    expect(app.flush()).toEqual(['Parent']);
  });

  it('Section 3: our model re-renders a memo child that receives a new inline object', () => {
    const MemoBox = memo(function MemoBox(): readonly Element[] {
      return leaf();
    });
    const { app, setCount } = withParent(() => el(MemoBox, { style: { gap: 4 } }));
    expect(setCount(1)).toBe(true);
    expect(app.flush()).toEqual(['Parent', 'MemoBox']);
  });

  it('Section 3: our model schedules nothing for a setState with an Object.is-equal value', () => {
    function Plain(): readonly Element[] {
      return leaf();
    }
    const { app, setCount } = withParent(() => el(Plain));
    expect(setCount(0)).toBe(false);
    expect(app.flush()).toEqual([]);
  });

  it('Section 3: our model re-renders a context reader below a skipped memo parent', () => {
    const CountContext = createContext(-1);
    const seen: number[] = [];
    function Reader(): readonly Element[] {
      seen.push(useContext(CountContext));
      return leaf();
    }
    const MemoShell = memo(function MemoShell(): readonly Element[] {
      return [el(Reader)];
    });
    const { app, setCount } = withParent((count) => el(CountContext, { value: count }, el(MemoShell)));
    expect(app.rendered).toEqual(['Parent', 'MemoShell', 'Reader']);
    expect(setCount(1)).toBe(true);
    expect(app.flush()).toEqual(['Parent', 'Reader']);
    expect(seen).toEqual([0, 1]);
  });
});
