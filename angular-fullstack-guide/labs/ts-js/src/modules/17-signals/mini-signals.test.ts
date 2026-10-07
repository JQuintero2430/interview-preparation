import { computed, effect, signal } from './mini-signals';

const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe('E17.6 mini signals', () => {
  it('signal set/update and Object.is equality', () => {
    const s = signal(1);
    s.update((v) => v + 1);
    expect(s()).toBe(2);
  });

  it('computed is lazy and memoized', () => {
    const a = signal(1);
    let runs = 0;
    const double = computed(() => {
      runs++;
      return a() * 2;
    });
    a.set(2);
    a.set(3);
    expect(runs).toBe(0);
    expect(double()).toBe(6);
    expect(double()).toBe(6);
    expect(runs).toBe(1);
  });

  it('is glitch-free on a diamond: d never sees mixed values and computes once', () => {
    const a = signal(1);
    const b = computed(() => a() * 2);
    const c = computed(() => a() * 3);
    const seen: string[] = [];
    const d = computed(() => {
      const r = `${b()}+${c()}`;
      seen.push(r);
      return r;
    });
    d();
    a.set(2);
    d();
    expect(seen).toEqual(['2+3', '4+6']);
  });

  it('stops propagation when a computed produces an equal value (equality cutoff)', () => {
    const n = signal(2);
    const parity = computed(() => n() % 2);
    let downstreamRuns = 0;
    const label = computed(() => {
      downstreamRuns++;
      return parity() === 0 ? 'even' : 'odd';
    });
    label();
    n.set(4);
    expect(label()).toBe('even');
    expect(downstreamRuns).toBe(1);
  });

  it('tracks dependencies dynamically on every run', () => {
    const useX = signal(true);
    const x = signal('x');
    const y = signal('y');
    let runs = 0;
    const pick = computed(() => {
      runs++;
      return useX() ? x() : y();
    });
    pick();
    y.set('y2'); // not a dependency yet
    pick();
    expect(runs).toBe(1);
    useX.set(false);
    expect(pick()).toBe('y2');
    x.set('x2'); // no longer a dependency
    pick();
    expect(runs).toBe(2);
  });

  it('batches synchronous writes into one effect run', async () => {
    const first = signal('Ada');
    const last = signal('Lovelace');
    const log: string[] = [];
    effect(() => {
      log.push(`${first()} ${last()}`);
    });
    await flush();
    first.set('Grace');
    last.set('Hopper');
    await flush();
    expect(log).toEqual(['Ada Lovelace', 'Grace Hopper']);
  });

  it('skips an effect run when a computed it reads recomputes to an equal value', async () => {
    const s = signal(1);
    const parity = computed(() => s() % 2);
    let runs = 0;
    effect(() => {
      parity();
      runs++;
    });
    await flush();
    s.set(3);
    await flush();
    expect(runs).toBe(1);
  });

  it('runs cleanup before the next run and on dispose', async () => {
    const s = signal('a');
    const log: string[] = [];
    const dispose = effect((onCleanup) => {
      const v = s();
      log.push(`run ${v}`);
      onCleanup(() => log.push(`cleanup ${v}`));
    });
    await flush();
    s.set('b');
    await flush();
    dispose();
    s.set('c');
    await flush();
    expect(log).toEqual(['run a', 'cleanup a', 'run b', 'cleanup b']);
  });
});
