import { fireEvent, render, screen } from '@testing-library/react';

/**
 * Predict-the-output exercise. The assertions were predicted before running, then confirmed by running them (React 19.3, jsdom 30).
 */
function Tree({ log }: { log: (s: string) => void }) {
  return (
    <div onClickCapture={() => log('react:div capture')} onClick={() => log('react:div bubble')}>
      <button onClickCapture={() => log('react:button capture')} onClick={() => log('react:button bubble')}>
        go
      </button>
    </div>
  );
}

test('Part 1: capture/bubble order across native listeners and React 17+ handlers', () => {
  const events: string[] = [];
  const log = (s: string) => events.push(s);
  document.addEventListener('click', () => log('document:capture'), { capture: true, once: true });
  document.addEventListener('click', () => log('document:bubble'), { once: true });
  render(<Tree log={log} />);
  screen.getByRole('button').addEventListener('click', () => log('native:button'));

  fireEvent.click(screen.getByRole('button'));

  // React registers capture AND bubble listeners on the root container. So React's capture-phase
  // handlers run when the event passes the root on the way DOWN (after document capture), the target's
  // own native listener runs next, and React's bubble handlers run when the event passes the root on
  // the way UP, before document's bubble listener.
  expect(events).toEqual([
    'document:capture',
    'react:div capture',
    'react:button capture',
    'native:button',
    'react:button bubble',
    'react:div bubble',
    'document:bubble',
  ]);
});

test('Part 2: microtasks do not run between listeners of a script-dispatched click', async () => {
  const events: string[] = [];
  const button = document.createElement('button');
  document.body.append(button);
  button.addEventListener('click', () => {
    events.push('l1');
    queueMicrotask(() => events.push('microtask'));
  });
  button.addEventListener('click', () => events.push('l2'));

  button.click(); // dispatched from script: the JS stack is NOT empty between listeners
  events.push('after click()');
  await Promise.resolve();

  // A real user click has an empty stack after each listener, so a browser would log
  // ['l1', 'microtask', 'l2']. jsdom cannot reproduce that; this is the el.click() behaviour.
  expect(events).toEqual(['l1', 'l2', 'after click()', 'microtask']);
  button.remove();
});
