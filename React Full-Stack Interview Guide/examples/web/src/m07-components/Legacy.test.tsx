import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassCounter, Hoverable, LegacyGreeting, withLoading } from './Legacy';

test('class component: setState with an updater, and static defaultProps still apply', async () => {
  render(
    <>
      <ClassCounter step={2} />
      <ClassCounter />
    </>,
  );
  const [byTwo, byDefault] = screen.getAllByRole('button');
  await userEvent.click(byTwo!);
  await userEvent.click(byTwo!);
  await userEvent.click(byDefault!);
  expect(byTwo).toHaveTextContent('Count: 4');
  expect(byDefault).toHaveTextContent('Count: 1'); // step came from defaultProps
});

function UserName({ name }: { name: string }) {
  return <p>{name}</p>;
}
// Applied once, at module level. Applying a HOC inside render creates a new component type
// on every render, which remounts the subtree and loses its state.
const UserNameWithLoading = withLoading(UserName);

test('HOC: wraps a component, adds a prop, and sets a debuggable displayName', () => {
  const { rerender } = render(<UserNameWithLoading loading name="Ada" />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  rerender(<UserNameWithLoading loading={false} name="Ada" />);
  expect(screen.getByText('Ada')).toBeInTheDocument();
  expect(UserNameWithLoading.displayName).toBe('withLoading(UserName)');
});

test('render prop: the caller decides what to render from the component state', async () => {
  render(<Hoverable>{(hovered) => <span>{hovered ? 'Hovering' : 'Idle'}</span>}</Hoverable>);
  await userEvent.hover(screen.getByText('Idle'));
  expect(screen.getByText('Hovering')).toBeInTheDocument();
  await userEvent.unhover(screen.getByText('Hovering'));
  expect(screen.getByText('Idle')).toBeInTheDocument();
});

test('React 19: JSX ignores defaultProps on a function component', () => {
  render(<LegacyGreeting />);
  expect(screen.getByText('Hello, stranger')).toBeInTheDocument();
});

test('React 19.3: the legacy createElement() still copies defaultProps', () => {
  render(createElement(LegacyGreeting));
  expect(screen.getByText('Hello, world')).toBeInTheDocument();
});
