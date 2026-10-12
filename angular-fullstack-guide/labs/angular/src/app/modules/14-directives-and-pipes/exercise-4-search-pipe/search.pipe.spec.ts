import { Component, computed, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SEARCH_NORMALIZER, SearchLivePipe, SearchPipe, created, search } from './search.pipe';

// Every call of the counting normalizer is one tick; one search over three items is four ticks
// (the term once, then each item), five over four items.
const calls = { normalizer: 0 };
const counting = (value: string): string => {
  calls.normalizer++;
  return value.toLowerCase();
};
const words = ['Apple', 'banana', 'Cherry'];

@Component({
  selector: 'lab-e4-default-host',
  imports: [SearchPipe],
  template: `<p>{{ (words | labSearch: 'APP').join(',') }}</p>`,
})
class DefaultHost {
  protected readonly words = words;
}

@Component({
  selector: 'lab-e4-strict-host',
  imports: [SearchPipe],
  providers: [{ provide: SEARCH_NORMALIZER, useValue: (value: string) => value }],
  template: `<p>{{ (words | labSearch: 'APP').join(',') }}</p>`,
})
class StrictHost {
  protected readonly words = words;
}

@Component({
  selector: 'lab-e4-pure-host',
  imports: [SearchPipe],
  providers: [{ provide: SEARCH_NORMALIZER, useValue: counting }],
  template: `<p>{{ (words | labSearch: 'e').join(',') }}|{{ tick() }}</p>`,
})
class PureHost {
  protected readonly words = words;
  readonly tick = signal(0);
}

@Component({
  selector: 'lab-e4-live-host',
  imports: [SearchLivePipe],
  providers: [{ provide: SEARCH_NORMALIZER, useValue: counting }],
  template: `<p>{{ (words | labSearchLive: 'e').join(',') }}|{{ tick() }}</p>`,
})
class LiveHost {
  protected readonly words = words;
  readonly tick = signal(0);
}

@Component({
  selector: 'lab-e4-all-host',
  imports: [SearchPipe, SearchLivePipe],
  template: `
    <p id="pure">{{ (items() | labSearch: 'e').join(',') }}</p>
    <p id="live">{{ (items() | labSearchLive: 'e').join(',') }}</p>
    <p id="computed">{{ found().join(',') }}</p>
    <p id="tick">{{ tick() }}</p>
  `,
})
class AllHost {
  readonly items = signal<string[]>([...words]);
  readonly tick = signal(0);
  private readonly normalize = inject(SEARCH_NORMALIZER);
  protected readonly found = computed(() => search(this.items(), 'e', this.normalize));
}

@Component({
  selector: 'lab-e4-two-host',
  imports: [SearchPipe],
  template: `<p>{{ (words | labSearch: 'a').length }}|{{ (words | labSearch: 'b').length }}</p>`,
})
class TwoHost {
  protected readonly words = words;
}

// The computed calls the plain function and the host imports no pipe, so no pipe can be created.
@Component({
  selector: 'lab-e4-computed-host',
  template: `<p>{{ found().join(',') }}</p>`,
})
class ComputedHost {
  private readonly normalize = inject(SEARCH_NORMALIZER);
  protected readonly found = computed(() => search(words, 'e', this.normalize));
}

function mount<T>(host: new () => T) {
  calls.normalizer = 0;
  created.pure = created.live = 0;
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  return { fixture, instance: fixture.componentInstance, text: (selector: string) => root.querySelector(selector)?.textContent };
}

describe('E14.4 A search pipe, pure and impure, with an injected normalizer', () => {
  it('the pure pipe filters case-insensitively through the injected normalizer, and a different `SEARCH_NORMALIZER` provided by the host changes the result', () => {
    expect(mount(DefaultHost).text('p')).toBe('Apple');
    expect(mount(StrictHost).text('p')).toBe('');
  });

  it('an unrelated signal change does not call the pure pipe again but calls the impure one', () => {
    const pure = mount(PureHost);
    expect(calls.normalizer).toBe(4);
    calls.normalizer = 0;
    pure.instance.tick.set(1);
    pure.fixture.detectChanges();
    expect(calls.normalizer).toBe(0);

    const live = mount(LiveHost);
    calls.normalizer = 0;
    live.instance.tick.set(1);
    live.fixture.detectChanges();
    expect(calls.normalizer).toBe(4);
  });

  it('an in-place `push` leaves the pure pipe\'s result stale and updates the impure one and **not** the computed (the signal was not notified)', () => {
    const { fixture, instance, text } = mount(AllHost);
    expect(text('#pure')).toBe('Apple,Cherry');
    instance.items().push('Date');
    instance.tick.set(1);
    fixture.detectChanges();
    expect(text('#pure')).toBe('Apple,Cherry');
    expect(text('#live')).toBe('Apple,Cherry,Date');
    expect(text('#computed')).toBe('Apple,Cherry');
  });

  it('replacing the array refreshes the pure pipe and the computed', () => {
    const { fixture, instance, text } = mount(AllHost);
    instance.items.update((list) => [...list, 'Date']);
    fixture.detectChanges();
    expect(text('#pure')).toBe('Apple,Cherry,Date');
    expect(text('#computed')).toBe('Apple,Cherry,Date');
  });

  it('two usages of the pipe create two instances (a constructor counter)', () => {
    mount(TwoHost);
    expect(created.pure).toBe(2);
  });

  it('the function is reused by the computed without injecting any pipe', () => {
    const { text } = mount(ComputedHost);
    expect(text('p')).toBe('Apple,Cherry');
    expect(created).toEqual({ pure: 0, live: 0 });
    expect(search(words, 'E', (value) => value.toLowerCase())).toEqual(['Apple', 'Cherry']);
  });
});
