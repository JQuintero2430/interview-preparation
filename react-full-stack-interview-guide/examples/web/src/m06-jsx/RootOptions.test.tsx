import { act, useId } from 'react';
import { createRoot } from 'react-dom/client';

// 6.12: what @testing-library/react's render() does for you, written out by hand.

function FieldId() {
  const id = useId();
  return <span>{id}</span>;
}

function mountContainer() {
  const container = document.createElement('div');
  document.body.append(container);
  return container;
}

test('identifierPrefix namespaces useId, and unmount empties the container', () => {
  const container = mountContainer();
  const root = createRoot(container, { identifierPrefix: 'widget-' });

  act(() => root.render(<FieldId />));
  expect(container.textContent).toMatch(/^_widget-r_[0-9a-z]+_$/);

  act(() => root.unmount());
  expect(container).toBeEmptyDOMElement();
  container.remove();
});

test('calling root.render again updates the same tree; it does not remount', () => {
  const container = mountContainer();
  const root = createRoot(container);

  act(() => root.render(<FieldId />));
  const firstId = container.textContent;
  act(() => root.render(<FieldId />));
  expect(container.textContent).toBe(firstId);

  act(() => root.unmount());
  container.remove();
});
