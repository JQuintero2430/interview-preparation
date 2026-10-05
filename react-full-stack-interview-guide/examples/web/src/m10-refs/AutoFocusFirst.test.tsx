import { Fragment, createRef, type FragmentInstance } from 'react';
import { render, screen } from '@testing-library/react';
import { AutoFocusFirst } from './AutoFocusFirst';

test('focuses the first focusable descendant without adding a wrapper element', () => {
  const { container } = render(
    <AutoFocusFirst>
      <p>Intro text</p>
      <label>
        Name <input />
      </label>
      <button type="button">Go</button>
    </AutoFocusFirst>,
  );

  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
  // No extra DOM node: the three children sit directly in the container.
  expect(container.children).toHaveLength(3);
});

test('a Fragment ref holds a FragmentInstance, not a DOM node', () => {
  const ref = createRef<FragmentInstance>();
  render(
    <Fragment ref={ref}>
      <button type="button">One</button>
      <button type="button">Two</button>
    </Fragment>,
  );

  expect(ref.current).not.toBeNull();
  expect(ref.current).not.toBeInstanceOf(Node);

  ref.current?.focusLast();
  expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
});
