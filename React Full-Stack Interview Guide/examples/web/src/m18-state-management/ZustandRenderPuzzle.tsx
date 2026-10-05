import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { log } from './renderLog';

type PuzzleStore = { a: number; b: number; incA: () => void; incB: () => void };

export const usePuzzleStore = create<PuzzleStore>()((set) => ({
  a: 0,
  b: 0,
  incA: () => set((s) => ({ a: s.a + 1 })),
  incB: () => set((s) => ({ b: s.b + 1 })),
}));

/** Call in beforeEach: the store is a module singleton. */
export function resetPuzzleStore(): void {
  usePuzzleStore.setState(usePuzzleStore.getInitialState(), true);
}

// 1) No selector: subscribes to the whole store.
function ZWhole() {
  const { a, b } = usePuzzleStore();
  log.push(`ZWhole a=${a} b=${b}`);
  return null;
}

// 2) Selects one primitive.
function ZSlice() {
  const a = usePuzzleStore((s) => s.a);
  log.push(`ZSlice ${a}`);
  return null;
}

// 3) A new object every call, stabilized by useShallow.
//    Without useShallow, Zustand 5 would loop ("Maximum update depth exceeded").
function ZShallow() {
  const { a } = usePuzzleStore(useShallow((s) => ({ a: s.a })));
  log.push(`ZShallow ${a}`);
  return null;
}

// 4) Selects only actions, and owns the buttons.
function ZActions() {
  const incA = usePuzzleStore((s) => s.incA);
  const incB = usePuzzleStore((s) => s.incB);
  log.push('ZActions');
  return (
    <>
      <button type="button" onClick={incA}>
        inc a
      </button>
      <button type="button" onClick={incB}>
        inc b
      </button>
    </>
  );
}

export function ZustandPuzzle() {
  return (
    <>
      <ZWhole />
      <ZSlice />
      <ZShallow />
      <ZActions />
    </>
  );
}
