import { Profiler, type ProfilerOnRenderCallback } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPageBefore, ColorPageLiftedContent, ColorPageMovedDown, log } from './StateColocation';

beforeEach(() => {
  log.length = 0;
});

async function typeThreeCharacters() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Color'), 'ish');
  expect(screen.getByLabelText('Color')).toHaveValue('redish');
}

test('before: the expensive tree re-renders on every keystroke', async () => {
  render(<ColorPageBefore />);
  await typeThreeCharacters();
  expect(log).toEqual(['ExpensiveTree', 'ExpensiveTree', 'ExpensiveTree', 'ExpensiveTree']);
});

test('moving state down: the expensive tree renders once', async () => {
  render(<ColorPageMovedDown />);
  await typeThreeCharacters();
  expect(log).toEqual(['ExpensiveTree']);
});

test('lifting content up: the expensive tree renders once', async () => {
  render(<ColorPageLiftedContent />);
  await typeThreeCharacters();
  expect(log).toEqual(['ExpensiveTree']);
});

test('<Profiler> reports one mount commit, then one update commit per keystroke', async () => {
  const phases: string[] = [];
  const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    phases.push(phase);
    expect(actualDuration).toBeGreaterThanOrEqual(0);
  };

  render(
    <Profiler id="color-page" onRender={onRender}>
      <ColorPageMovedDown />
    </Profiler>,
  );
  await typeThreeCharacters();

  expect(phases).toEqual(['mount', 'update', 'update', 'update']);
});
