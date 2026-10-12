import { ApplicationRef, EnvironmentInjector, createComponent } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LeakyTicker } from './legacy/leaky-ticker';
import { LiveTicker } from './live-ticker';
import { QuoteSource } from './quote-source';
import { TickerHost } from './ticker-host';

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

function render(active = true): {
  fixture: ComponentFixture<TickerHost>;
  host: TickerHost;
  source: QuoteSource;
} {
  const fixture = TestBed.createComponent(TickerHost);
  fixture.componentInstance.active.set(active);
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance, source: TestBed.inject(QuoteSource) };
}

beforeEach(() => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] }));

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('E20.4 A leak-free live ticker', () => {
  it('polling starts only when the bound active input is true (not in the constructor)', () => {
    const { fixture, host, source } = render(false);
    expect(vi.getTimerCount()).toBe(0);
    host.active.set(true);
    fixture.detectChanges();
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(source.pending).toHaveLength(1);
  });

  it('the first quote is requested after the first render', () => {
    const source = TestBed.inject(QuoteSource);
    const ref = createComponent(LiveTicker, {
      environmentInjector: TestBed.inject(EnvironmentInjector),
    });
    ref.setInput('active', true);
    TestBed.inject(ApplicationRef).attachView(ref.hostView);
    expect(source.pending).toHaveLength(0);
    TestBed.inject(ApplicationRef).tick();
    expect(source.pending).toHaveLength(1);
    ref.destroy();
  });

  it('destroying the component stops the interval (no pending fake timers) and removes the window listener', () => {
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');
    const { fixture, host, source } = render();
    expect(vi.getTimerCount()).toBe(1);
    host.shown.set(false);
    fixture.detectChanges();
    expect(vi.getTimerCount()).toBe(0);
    const onOnline = added.mock.calls.find(([type]) => type === 'online')?.[1];
    expect(removed).toHaveBeenCalledWith('online', onOnline);
    const requests = source.pending.length;
    window.dispatchEvent(new Event('online'));
    expect(source.pending).toHaveLength(requests);
  });

  it('a quote that resolves after destruction does not write to the component', async () => {
    const { fixture, host, source } = render();
    const ticker: LiveTicker = fixture.debugElement.query(
      By.directive(LiveTicker),
    ).componentInstance;
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(source.pending).toHaveLength(2);
    source.answerOldest(7);
    await flush();
    expect(ticker.price()).toBe(7);
    host.shown.set(false);
    fixture.detectChanges();
    source.answerOldest(42);
    await flush();
    expect(ticker.price()).toBe(7);
  });

  it('an inactive-to-active toggle starts a single interval, not two', () => {
    const { fixture, host, source } = render(false);
    for (const active of [true, false, true]) {
      host.active.set(active);
      fixture.detectChanges();
    }
    expect(vi.getTimerCount()).toBe(1);
    const before = source.pending.length;
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(source.pending).toHaveLength(before + 1);
  });

  it('the legacy ticker leaves timers and a listener behind after destruction', () => {
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');
    const fixture = TestBed.createComponent(LeakyTicker);
    fixture.detectChanges();
    const source = TestBed.inject(QuoteSource);
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(1);
    expect(removed).not.toHaveBeenCalledWith('online', expect.anything());
    const requests = source.pending.length;
    vi.advanceTimersByTime(1000);
    window.dispatchEvent(new Event('online'));
    expect(source.pending).toHaveLength(requests + 2);
    const leaked = added.mock.calls.find(([type]) => type === 'online')?.[1];
    window.removeEventListener('online', leaked as EventListener);
  });
});
