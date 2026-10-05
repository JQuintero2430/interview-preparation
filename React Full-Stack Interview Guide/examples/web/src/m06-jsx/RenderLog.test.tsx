import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter, Slot, log } from './RenderLog';

const click = (name: string) => userEvent.click(screen.getByRole('button', { name }));

function renderApp() {
  return render(
    <Counter>
      <Slot />
    </Counter>,
  );
}

beforeEach(() => {
  log.length = 0;
});

test('1. mount: the parent renders first, then its subtree depth-first in tree order', () => {
  renderApp();
  expect(log).toEqual(['Counter 0', 'Display 0', 'Static', 'Slot']);
});

test('2. setting the same value on untouched state renders nothing', async () => {
  renderApp();
  log.length = 0;
  await click('Set same');
  expect(log).toEqual([]);
});

test('3. a state change re-renders the owner and every child it creates, but not `children`', async () => {
  renderApp();
  log.length = 0;
  await click('Increment');
  expect(log).toEqual(['Counter 1', 'Display 1', 'Static']);
});

test('4. the same value right after an update: Counter may render once, its children do not', async () => {
  renderApp();
  await click('Increment');
  log.length = 0;
  await click('Set same');
  expect(log).toEqual(['Counter 1']);
});

test('5. Strict Mode (development): every component function is called twice on mount', () => {
  render(
    <StrictMode>
      <Counter>
        <Slot />
      </Counter>
    </StrictMode>,
  );
  expect(log).toEqual([
    'Counter 0',
    'Counter 0',
    'Display 0',
    'Display 0',
    'Static',
    'Static',
    'Slot',
    'Slot',
  ]);
});

test('6. a new key is a new component: state resets and the whole subtree mounts again', async () => {
  const { rerender } = render(<Counter key="a" />);
  await click('Increment');
  log.length = 0;
  rerender(<Counter key="b" />);
  expect(log).toEqual(['Counter 0', 'Display 0', 'Static']);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});
