import {
  createEnvironmentInjector,
  EnvironmentInjector,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchApi } from './search-api';
import { LabM29SearchBox } from './search-box';
import { StatusApi, StatusPoller } from './status-poller';

// Read before any fake clock exists, so it keeps measuring real time.
const realNow = performance.now.bind(performance);

const restoreTimers = (): void => {
  vi.useRealTimers();
};

const setups: [string, () => void][] = [
  ['explicit advance', () => vi.useFakeTimers()],
  ['auto-advancing', () => vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 })],
];

interface Mounted {
  fixture: ComponentFixture<LabM29SearchBox>;
  search: SearchApi['search'];
  type(text: string): void;
  results(): string[];
}

function mountSearchBox(): Mounted {
  const search = vi.fn<SearchApi['search']>((term) =>
    Promise.resolve([`${term} one`, `${term} two`]),
  );
  TestBed.configureTestingModule({ providers: [{ provide: SearchApi, useValue: { search } }] });
  const fixture = TestBed.createComponent(LabM29SearchBox);
  const root: HTMLElement = fixture.nativeElement;
  TestBed.tick();
  return {
    fixture,
    search,
    type: (text) => {
      const input = root.querySelector('input');
      if (input === null) {
        throw new Error('no input rendered');
      }
      input.value = text;
      input.dispatchEvent(new Event('input'));
      TestBed.tick();
    },
    results: () => Array.from(root.querySelectorAll('li')).map((item) => item.textContent ?? ''),
  };
}

function startPoller(providers: (Provider | EnvironmentProviders)[]): {
  poller: StatusPoller;
  owner: EnvironmentInjector;
} {
  const owner = createEnvironmentInjector(providers, TestBed.inject(EnvironmentInjector));
  return { poller: owner.get(StatusPoller), owner };
}

describe.each(setups)('E29.4 fake timers (%s)', (_name, install) => {
  afterEach(restoreTimers);

  it('typing does not search before 300 ms of quiet', async () => {
    install();
    const { search, type } = mountSearchBox();

    type('a');
    await vi.advanceTimersByTimeAsync(200);
    type('an');
    await vi.advanceTimersByTimeAsync(200);

    expect(search).not.toHaveBeenCalled();
  });

  it('the search runs once after 300 ms with the last term', async () => {
    install();
    const { search, type, results } = mountSearchBox();

    type('a');
    await vi.advanceTimersByTimeAsync(100);
    type('an');
    await vi.advanceTimersByTimeAsync(100);
    type('ang');
    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('ang');
    expect(results()).toEqual(['ang one', 'ang two']);
  });

  it('polling asks the server every 5 seconds', async () => {
    install();
    const get = vi.fn<StatusApi['get']>().mockResolvedValue('up');
    TestBed.configureTestingModule({
      providers: [StatusPoller, { provide: StatusApi, useValue: { get } }],
    });
    const poller = TestBed.inject(StatusPoller);

    poller.start();
    await vi.advanceTimersByTimeAsync(4000);
    expect(get).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(get).toHaveBeenCalledTimes(1);
    expect(poller.status()).toBe('up');

    await vi.advanceTimersByTimeAsync(5000);
    expect(get).toHaveBeenCalledTimes(2);
    poller.stop();
  });

  it('polling stops when its owner is destroyed', async () => {
    install();
    const get = vi.fn<StatusApi['get']>().mockResolvedValue('up');
    const { poller, owner } = startPoller([
      StatusPoller,
      { provide: StatusApi, useValue: { get } },
    ]);

    poller.start();
    await vi.advanceTimersByTimeAsync(5000);
    expect(get).toHaveBeenCalledTimes(1);

    owner.destroy();
    await vi.advanceTimersByTimeAsync(15000);

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('the fixture becomes stable without waiting in real time', async () => {
    install();
    const { fixture, type } = mountSearchBox();
    const started = realNow();

    type('ng');
    const stable = fixture.whenStable();
    await vi.advanceTimersByTimeAsync(5000);
    await stable;

    expect(fixture.isStable()).toBe(true);
    expect(realNow() - started).toBeLessThan(1000);
  });

  it('fake timers are off after each test', () => {
    const nativeSetTimeout = setTimeout;
    // Vitest runs onTestFinished after every afterEach hook, so this observes the hook itself.
    onTestFinished(() => {
      expect(vi.isFakeTimers()).toBe(false);
      expect(setTimeout).toBe(nativeSetTimeout);
    });

    install();
    expect(vi.isFakeTimers()).toBe(true);
    expect(setTimeout).not.toBe(nativeSetTimeout);
  });
});
