import { Activity, useEffect, useState } from 'react';

/** Effect setups and cleanups append here. The tests reset it. */
export const log: string[] = [];

function Counter({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    log.push(`${name} effect setup`);
    return () => {
      log.push(`${name} effect cleanup`);
    };
  }, [name]);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      {name} count {count}
    </button>
  );
}

type Tab = 'A' | 'B';

/**
 * Two tabs, each with its own counter.
 * `mode="activity"` keeps both mounted and hides the inactive one with <Activity>.
 * `mode="conditional"` is the classic `{tab === 'A' && <Counter />}`, which unmounts it.
 */
export function Tabs({ mode }: { mode: 'activity' | 'conditional' }) {
  const [tab, setTab] = useState<Tab>('A');

  return (
    <div>
      <button type="button" onClick={() => setTab('A')}>
        Show A
      </button>
      <button type="button" onClick={() => setTab('B')}>
        Show B
      </button>
      {mode === 'activity' ? (
        <>
          <Activity mode={tab === 'A' ? 'visible' : 'hidden'}>
            <Counter name="A" />
          </Activity>
          <Activity mode={tab === 'B' ? 'visible' : 'hidden'}>
            <Counter name="B" />
          </Activity>
        </>
      ) : (
        <>
          {tab === 'A' && <Counter name="A" />}
          {tab === 'B' && <Counter name="B" />}
        </>
      )}
    </div>
  );
}
