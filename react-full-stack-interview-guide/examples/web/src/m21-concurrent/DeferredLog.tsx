import { useDeferredValue, useState, useTransition } from 'react';

/** Every render of the components below appends a line here. The tests reset it. */
export const log: string[] = [];

/** `useDeferredValue(text)`: no initialValue, so the first render does not defer. */
export function DeferredEcho({ text }: { text: string }) {
  const deferred = useDeferredValue(text);
  log.push(`render text=${text} deferred=${deferred}`);
  return <p>{deferred}</p>;
}

/** Same, with `initialValue = ''` (React 19): the first render deliberately shows the initial value. */
export function DeferredEchoWithInitial({ text }: { text: string }) {
  const deferred = useDeferredValue(text, '');
  log.push(`render text=${text} deferred=${deferred}`);
  return <p>{deferred}</p>;
}

/** The same value, but the update that changes it runs inside a transition. */
export function EchoInTransition() {
  const [text, setText] = useState('a');
  const [, startTransition] = useTransition();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            setText('ab');
          })
        }
      >
        Append b
      </button>
      <DeferredEcho text={text} />
    </>
  );
}
