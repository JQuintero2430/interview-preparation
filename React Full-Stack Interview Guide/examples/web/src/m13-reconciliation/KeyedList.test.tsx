import { render } from '@testing-library/react';
import { KeyedList } from './KeyedList';

// Re-renders the list with a new order and returns the text of every node React (re)inserted.
function movedNodes(before: string[], after: string[]) {
  const { container, rerender } = render(<KeyedList items={before} />);
  const ul = container.querySelector('ul')!;
  const observer = new MutationObserver(() => {});
  observer.observe(ul, { childList: true });
  rerender(<KeyedList items={after} />);
  const records = observer.takeRecords();
  observer.disconnect();
  return {
    inserted: records.flatMap((r) => Array.from(r.addedNodes, (n) => n.textContent)),
    order: Array.from(ul.children, (li) => li.textContent),
  };
}

test('moving the FIRST item to the end moves exactly one DOM node', () => {
  const { inserted, order } = movedNodes(['A', 'B', 'C', 'D'], ['B', 'C', 'D', 'A']);
  expect(order).toEqual(['B', 'C', 'D', 'A']);
  expect(inserted).toEqual(['A']);
});

test('moving the LAST item to the front moves every other node instead', () => {
  const { inserted, order } = movedNodes(['A', 'B', 'C', 'D'], ['D', 'A', 'B', 'C']);
  expect(order).toEqual(['D', 'A', 'B', 'C']);
  expect(inserted).toEqual(['A', 'B', 'C']);
});

test('an unchanged order touches no DOM nodes at all', () => {
  const { inserted } = movedNodes(['A', 'B', 'C'], ['A', 'B', 'C']);
  expect(inserted).toEqual([]);
});
