// @vitest-environment jsdom
// Q11.14 and Q11.15 (Output questions of module 11). Both assert results of lab models in jsdom 30.1.1: the announcer's DOM
// contents with fake timers (announcer.ts) and the accessible name the AccName 1.2 subset computes (accname.ts, Exercise 11.2).
// jsdom has no accessibility tree and no screen reader, so neither says what a browser or an assistive technology does.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureLogs } from '../capture';
import { createAnnouncer } from '../../modules/11-accessibility/announcer';
import { accessibleName } from '../../modules/11-accessibility/accname';
import { mount, need, unmount } from '../../modules/11-accessibility/support/dom';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  unmount();
  document.body.replaceChildren(); // the announcer's regions are not mounted through mount()
});

describe('Module 11 · Output questions: live regions and accessible names', () => {
  it('Q11.14 the announcer writes after a delay, clears first so an identical message changes the text twice, and uses role alert for assertive', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const announcer = createAnnouncer();
      const text = (role: string) => JSON.stringify(document.querySelector(`[role="${role}"]`)?.textContent);
      announcer.announce('Saved');
      console.log(text('status'));
      vi.advanceTimersByTime(100);
      console.log(text('status'));
      announcer.announce('Saved');
      console.log(text('status'));
      vi.advanceTimersByTime(100);
      console.log(text('status'));
      announcer.announce('Payment failed', 'assertive');
      vi.advanceTimersByTime(100);
      console.log(text('alert'), document.querySelector('[role="alert"]')?.getAttribute('aria-live'));
    });
    expect(lines).toEqual(['""', '"Saved"', '""', '"Saved"', '"Payment failed" assertive']);
  });

  it('Q11.15 aria-labelledby (here a self-reference) beats aria-label, which beats a label, which beats title, which beats placeholder', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const root = mount(
        '<a id="f1" href="./Documentation.pdf">Documentation.pdf</a>' +
          '<span id="d1" role="button" tabindex="0" aria-label="Delete" aria-labelledby="d1 f1"></span>' +
          '<label for="e">Email</label><input id="e" aria-label="Mail">' +
          '<input id="p" title="Tip" placeholder="Hint"><input id="q" placeholder="Search">',
      );
      for (const id of ['d1', 'e', 'p', 'q']) console.log(id, JSON.stringify(accessibleName(need(root, `#${id}`))));
    });
    expect(lines).toEqual(['d1 "Delete Documentation.pdf"', 'e "Mail"', 'p "Tip"', 'q "Search"']);
  });
});
