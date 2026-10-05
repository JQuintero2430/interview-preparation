import { render, screen } from '@testing-library/react';
import { Text } from './Text';

test('renders a span by default and spreads the remaining props onto it', () => {
  render(<Text className="muted">Hint</Text>);
  const el = screen.getByText('Hint');
  expect(el.tagName).toBe('SPAN');
  expect(el).toHaveClass('muted');
});

test('as="a" renders an anchor and accepts anchor props', () => {
  render(
    <Text as="a" href="/docs">
      Docs
    </Text>,
  );
  expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
});

test('the props are typed for the chosen element', () => {
  render(
    <>
      <Text as="label" htmlFor="email">
        Email
      </Text>
      <input id="email" />
      {/* @ts-expect-error `href` does not exist on the default element, a span */}
      <Text href="/nope">Not a link</Text>
    </>,
  );
  expect(screen.getByLabelText('Email').tagName).toBe('INPUT');
  expect(screen.getByText('Not a link').tagName).toBe('SPAN');
});
