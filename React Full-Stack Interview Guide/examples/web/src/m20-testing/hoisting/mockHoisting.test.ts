// Read this file top to bottom, then predict the three answers before looking at the assertions.
import { moduleLog } from './moduleLog';
import { apiBase, describeApi } from './apiConfig';

// Written AFTER the imports, yet the mock is in place by the time they run.
const events = vi.hoisted(() => ['vi.hoisted factory ran']);

vi.mock('./apiConfig', async (importOriginal) => {
  events.push('vi.mock factory ran');
  const actual = await importOriginal<typeof import('./apiConfig')>();
  events.push('original module imported inside the factory');
  return { ...actual, apiBase: 'https://mock.example.test' };
});

events.push('test file body ran');

test('PREDICT 1: the order of events', () => {
  expect(events).toEqual([
    'vi.hoisted factory ran',
    'vi.mock factory ran',
    'original module imported inside the factory',
    'test file body ran',
  ]);
});

test('PREDICT 2: did the real apiConfig.ts run, and how many times?', () => {
  expect(moduleLog).toEqual(['apiConfig.ts evaluated']);
});

test('PREDICT 3: the overridden export vs the function that reads it internally', () => {
  expect(apiBase).toBe('https://mock.example.test');
  expect(describeApi()).toBe('API at https://real.example.test');
});
