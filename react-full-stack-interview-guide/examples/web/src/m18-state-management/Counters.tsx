import { connect, useDispatch, useSelector, type ConnectedProps } from 'react-redux';
import {
  incrementIfOdd as modernIncrementIfOdd,
  increment as modernIncrement,
  type CounterDispatch,
  type CounterRootState,
} from './counterSlice';
import { increment, incrementIfOdd, type LegacyRootState } from './legacyRedux';

// ---- Legacy: connect(mapStateToProps, mapDispatchToProps)(Component) -------------------------
// `connect` is marked @deprecated in react-redux 9.3's types (strikethrough only, it still works);
// `legacy_connect` is the same function without the mark.

const mapStateToProps = (state: LegacyRootState) => ({ count: state.counter.count });
// Object shorthand: connect wraps each action creator in dispatch, thunk creators included.
const mapDispatchToProps = { increment, incrementIfOdd };

const connector = connect(mapStateToProps, mapDispatchToProps);
type LegacyCounterProps = ConnectedProps<typeof connector>;

function CounterView({ count, increment: onIncrement, incrementIfOdd: onIncrementIfOdd }: LegacyCounterProps) {
  return (
    <div>
      <p>Legacy count: {count}</p>
      <button type="button" onClick={onIncrement}>
        Legacy +1
      </button>
      <button type="button" onClick={onIncrementIfOdd}>
        Legacy +1 if odd
      </button>
    </div>
  );
}

/** The connected (container) component: a higher-order component wrapping the presentational one. */
export const LegacyCounter = connector(CounterView);

// ---- Modern: hooks ---------------------------------------------------------------------------

export function ModernCounter() {
  const count = useSelector((state: CounterRootState) => state.counter.count);
  const dispatch = useDispatch<CounterDispatch>();
  return (
    <div>
      <p>Modern count: {count}</p>
      <button type="button" onClick={() => dispatch(modernIncrement())}>
        Modern +1
      </button>
      <button type="button" onClick={() => dispatch(modernIncrementIfOdd())}>
        Modern +1 if odd
      </button>
    </div>
  );
}
