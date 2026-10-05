import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { render } from '@testing-library/react';

// propTypes: a validator that would fail if React still ran it.
const nameValidator = vi.fn(() => new Error('name must be a string'));
function Greeting({ name }: { name: unknown }) {
  return <p>Hello {String(name)}</p>;
}
Greeting.propTypes = { name: nameValidator };

// Legacy context: the pre-16.3 API, removed in 19.
class LegacyConsumer extends React.Component {
  static contextTypes = { theme: () => null };
  render() {
    return <p>legacy</p>;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

test('react-dom 19 no longer exports the legacy root APIs', () => {
  for (const name of ['render', 'hydrate', 'unmountComponentAtNode', 'findDOMNode']) {
    expect(name in ReactDOM).toBe(false);
  }
  expect('createPortal' in ReactDOM).toBe(true); // still on 'react-dom'; createRoot lives in 'react-dom/client'
});

test('react 19 no longer exports createFactory, but still exports Component and PureComponent', () => {
  expect('createFactory' in React).toBe(false);
  expect('Component' in React).toBe(true);
  expect('PureComponent' in React).toBe(true);
});

test('propTypes are silently ignored: the validator is never called', () => {
  render(<Greeting name={42} />);
  expect(nameValidator).not.toHaveBeenCalled();
});

test('legacy context (contextTypes) logs a "removed in React 19" error', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<LegacyConsumer />);
  expect(error).toHaveBeenCalledWith(
    expect.stringContaining('uses the legacy contextTypes API which was removed in React 19'),
    'LegacyConsumer',
  );
});

test('a string ref throws during render', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const stringRef = 'input' as unknown as React.Ref<HTMLInputElement>; // the types already forbid it
  expect(() => render(<input ref={stringRef} />)).toThrow(/Expected ref to be a function/);
});
