// @vitest-environment jsdom
// Live regions and focus after navigation, asserted as DOM contents and focus. A screen reader's speech is not observable in
// jsdom (no accessibility tree), so nothing here says what is announced: only what the markup holds and where focus is.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAnnouncer, type Announcer } from './announcer';
import { focusAfterNavigation } from './focus-after-navigation';
import { mount, need, unmount } from './support/dom';

let announcer: Announcer | undefined;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  announcer?.destroy();
  announcer = undefined;
  vi.useRealTimers();
  unmount();
});

describe('Module 11 · section 5 · live regions in jsdom', () => {
  it('Section 5: the announcer creates one status region with aria-live polite and writes the message after a tick', () => {
    announcer = createAnnouncer();
    const regions = document.querySelectorAll('[role="status"]');
    expect(regions).toHaveLength(1);
    const region = need(document.body, '[role="status"]');
    expect([region.getAttribute('aria-live'), region.getAttribute('aria-atomic'), region.textContent]).toEqual(['polite', 'true', '']);
    announcer.announce('3 results');
    expect(region.textContent).toBe('');
    vi.advanceTimersByTime(100);
    expect(region.textContent).toBe('3 results');
  });

  it('Section 5: an identical second message is cleared first so the text changes twice', () => {
    announcer = createAnnouncer();
    const region = need(document.body, '[role="status"]');
    const snapshots: string[] = [];
    announcer.announce('Saved');
    vi.advanceTimersByTime(100);
    snapshots.push(region.textContent ?? '');
    announcer.announce('Saved');
    snapshots.push(region.textContent ?? '');
    vi.advanceTimersByTime(100);
    snapshots.push(region.textContent ?? '');
    expect(snapshots).toEqual(['Saved', '', 'Saved']);
  });

  it('Section 5: assertive messages use role alert', () => {
    announcer = createAnnouncer();
    announcer.announce('Payment failed', 'assertive');
    vi.advanceTimersByTime(100);
    const alert = need(document.body, '[role="alert"]');
    expect([alert.getAttribute('aria-live'), alert.textContent]).toEqual(['assertive', 'Payment failed']);
    expect(need(document.body, '[role="status"]').textContent).toBe('');
  });

  it('Section 5: destroy removes the region', () => {
    announcer = createAnnouncer();
    announcer.announce('Pending');
    announcer.destroy();
    vi.advanceTimersByTime(100);
    expect(document.querySelectorAll('[role="status"], [role="alert"]')).toHaveLength(0);
  });
});

describe('Module 11 · section 5 · focus after navigation in jsdom', () => {
  it('Section 5: focusing a heading with tabindex -1 moves activeElement to it', () => {
    const root = mount('<a id="link" href="#x">Orders</a><main><h1 id="title">Orders</h1><p>List</p></main>');
    need(root, '#link').focus();
    const heading = need(root, '#title');
    heading.focus();
    expect(document.activeElement?.id).toBe('link');
    const focused = focusAfterNavigation({ title: 'Orders · Shop' });
    expect([focused, document.activeElement, heading.getAttribute('tabindex'), document.title]).toEqual([heading, heading, '-1', 'Orders · Shop']);
  });

  it('Section 5: removing the focused element makes body active and fires no blur (jsdom)', () => {
    const root = mount('<button id="del">Delete</button>');
    const button = need(root, '#del');
    let blurs = 0;
    button.addEventListener('blur', () => (blurs += 1));
    button.focus();
    button.remove();
    expect([document.activeElement === document.body, blurs]).toEqual([true, 0]);
  });
});
