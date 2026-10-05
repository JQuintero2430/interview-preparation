import { configureStore, createSelector, createSlice } from '@reduxjs/toolkit';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { log } from './renderLog';

const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState: { a: 0, b: 0 },
  reducers: {
    incA: (state) => {
      state.a += 1;
    },
    incB: (state) => {
      state.b += 1;
    },
  },
});

/** A fresh store per test. */
export function makePuzzleStore() {
  return configureStore({ reducer: { puzzle: puzzleSlice.reducer } });
}

type PuzzleState = ReturnType<ReturnType<typeof makePuzzleStore>['getState']>;
const usePuzzleSelector = useSelector.withTypes<PuzzleState>();

const selectA = (state: PuzzleState) => state.puzzle.a;
const selectAObject = createSelector([selectA], (a) => ({ a }));

// 1) Selects a primitive.
function Primitive() {
  const a = usePuzzleSelector(selectA);
  log.push(`Primitive ${a}`);
  return null;
}

// 2) Builds a new object on every call, compared with === (the default).
function NewObject() {
  const { a } = usePuzzleSelector((state) => ({ a: state.puzzle.a }));
  log.push(`NewObject ${a}`);
  return null;
}

// 3) Same object shape, but from a memoized selector.
function Memoized() {
  const { a } = usePuzzleSelector(selectAObject);
  log.push(`Memoized ${a}`);
  return null;
}

// 4) New object every call, compared with shallowEqual.
function Shallow() {
  const { a } = usePuzzleSelector((state) => ({ a: state.puzzle.a }), shallowEqual);
  log.push(`Shallow ${a}`);
  return null;
}

// 5) Selects the whole slice object, then reads one field from it.
function WholeSlice() {
  const { a } = usePuzzleSelector((state) => state.puzzle);
  log.push(`WholeSlice ${a}`);
  return null;
}

/** Renders the five readers. Its own useDispatch subscribes to nothing, so it never re-renders. */
export function ReduxPuzzle() {
  const dispatch = useDispatch();
  return (
    <>
      <button type="button" onClick={() => dispatch(puzzleSlice.actions.incA())}>
        inc a
      </button>
      <button type="button" onClick={() => dispatch(puzzleSlice.actions.incB())}>
        inc b
      </button>
      <Primitive />
      <NewObject />
      <Memoized />
      <Shallow />
      <WholeSlice />
    </>
  );
}
