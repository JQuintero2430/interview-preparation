import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as ReactDOM from 'react-dom';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { ClientOnlyStamp, Stamp, SuppressedStamp } from './Hydration';

let root: Root | undefined;
let container: HTMLElement | undefined;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {}); // React logs hydration problems in development
});
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  vi.restoreAllMocks();
});

/** Produce server HTML for `serverUi`, put it in the DOM, then hydrate it with `clientUi`. */
async function hydrate(serverUi: ReactNode, clientUi: ReactNode) {
  const errors: unknown[] = [];
  container = document.createElement('div');
  container.innerHTML = renderToString(serverUi);
  document.body.append(container);
  const target = container;
  await act(async () => {
    root = hydrateRoot(target, clientUi, { onRecoverableError: (error) => errors.push(error) });
  });
  return { text: () => target.querySelector('p')?.textContent, errors };
}

test('matching server and client output hydrates silently', async () => {
  const { text, errors } = await hydrate(<Stamp value="same" />, <Stamp value="same" />);
  expect(text()).toBe('same');
  expect(errors).toHaveLength(0);
});

test('a text mismatch is reported through onRecoverableError and the client output wins', async () => {
  const { text, errors } = await hydrate(<Stamp value="server" />, <Stamp value="client" />);
  expect(errors.length).toBeGreaterThan(0);
  expect(String((errors[0] as Error).message)).toMatch(/hydrat/i);
  expect(text()).toBe('client'); // React discarded the server HTML and re-rendered on the client
});

test('suppressHydrationWarning silences the check but does not patch the text up', async () => {
  const { text, errors } = await hydrate(
    <SuppressedStamp value="server" />,
    <SuppressedStamp value="client" />,
  );
  expect(errors).toHaveLength(0);
  expect(text()).toBe('server'); // still the server's text: the DOM now disagrees with React's output
});

test('useSyncExternalStore with getServerSnapshot: hydrate with the server value, then update, no error', async () => {
  const { text, errors } = await hydrate(<ClientOnlyStamp client="client" />, <ClientOnlyStamp client="client" />);
  expect(errors).toHaveLength(0);
  expect(text()).toBe('client');
});

test('the legacy root APIs are gone from react-dom in React 19', () => {
  for (const removed of ['render', 'hydrate', 'unmountComponentAtNode', 'findDOMNode']) {
    expect(removed in ReactDOM).toBe(false);
  }
});
