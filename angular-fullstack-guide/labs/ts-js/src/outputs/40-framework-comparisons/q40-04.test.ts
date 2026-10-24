// Output question Q40.04: our model of react-dom 19.3.1's bailout rules (mini-rerender.ts) after a parent's state change.
// React itself is not run.
import { captureLogs } from '../capture';
import {
  createContext,
  el,
  memo,
  mount,
  useContext,
  useState,
  type Element,
} from '../../modules/40-framework-comparisons/concepts/mini-rerender';

describe('40 · Q40.04', () => {
  it('Q40.04 our model re-runs Plain, MemoBox and the context reader, and skips MemoLabel and MemoShell', async () => {
    const lines = await captureLogs((log) => {
      const CountContext = createContext(-1);
      function Reader(): readonly Element[] {
        useContext(CountContext);
        return [];
      }
      function Plain(): readonly Element[] {
        return [];
      }
      const MemoLabel = memo(function MemoLabel(): readonly Element[] {
        return [];
      });
      const MemoBox = memo(function MemoBox(): readonly Element[] {
        return [];
      });
      const MemoShell = memo(function MemoShell(): readonly Element[] {
        return [el(Reader)];
      });
      let setCount: (next: number) => boolean = () => false;
      function Parent(): readonly Element[] {
        const [count, set] = useState(0);
        setCount = set;
        return [
          el(Plain),
          el(MemoLabel, { label: 'total' }),
          el(MemoBox, { style: { gap: 4 } }),
          el(CountContext, { value: count }, el(MemoShell)),
        ];
      }
      const app = mount(el(Parent));
      setCount(1);
      for (const name of app.flush()) log(name);
    });
    expect(lines).toEqual(['Parent', 'Plain', 'MemoBox', 'Reader']);
  });
});
