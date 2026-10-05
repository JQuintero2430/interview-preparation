import { createElement, isValidElement } from 'react';
import { render, screen } from '@testing-library/react';

// 6.2 / 6.3: JSX is a function call that returns a plain object (an element).
// These tests read that object directly to show what the compiler produced.

test('JSX and createElement describe the same element', () => {
  const fromJsx = <h1 className="title">Hello</h1>;
  const fromCall = createElement('h1', { className: 'title' }, 'Hello');

  expect(fromJsx.type).toBe('h1');
  expect(fromJsx.type).toBe(fromCall.type);
  expect(fromJsx.props).toEqual(fromCall.props);
  expect(fromJsx.props).toEqual({ className: 'title', children: 'Hello' });
});

test('an element is a tagged, immutable object (frozen in development)', () => {
  const element = <p>Hi</p>;
  const tag = (element as unknown as { $$typeof: symbol }).$$typeof;

  expect(isValidElement(element)).toBe(true);
  expect(tag).toBe(Symbol.for('react.transitional.element'));
  expect(Object.isFrozen(element)).toBe(true);
  expect(Object.isFrozen(element.props)).toBe(true);
});

test('key is stored on the element, not in props, and is coerced to a string', () => {
  const element = <li key={7}>Seven</li>;

  expect(element.key).toBe('7');
  expect(Object.keys(element.props)).toEqual(['children']);
});

test('creating an element does not call the component; rendering does', () => {
  const Greeting = vi.fn(({ name }: { name: string }) => <p>Hello, {name}</p>);
  const element = <Greeting name="Ada" />;

  expect(element.type).toBe(Greeting);
  expect(Greeting).not.toHaveBeenCalled();

  render(element);
  expect(Greeting).toHaveBeenCalled();
  expect(screen.getByText('Hello, Ada')).toBeInTheDocument();
});
