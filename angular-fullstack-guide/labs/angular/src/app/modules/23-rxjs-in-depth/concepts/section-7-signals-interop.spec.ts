import {
  Component,
  EnvironmentInjector,
  createEnvironmentInjector,
  output,
  signal,
} from '@angular/core';
import { outputToObservable, rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, EMPTY, Observable, Subject, timer } from 'rxjs';

/** A component with one output, for `outputToObservable`. */
@Component({ selector: 'lab-m23-picker', template: '' })
class Picker {
  readonly picked = output<string>();
}

describe('Section 7: RxJS and signals', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Section 7: toSignal with requireSync throws NG0601 for a source that is not synchronous', () => {
    vi.useFakeTimers();
    let message = '';
    try {
      TestBed.runInInjectionContext(() => toSignal(timer(10), { requireSync: true }));
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0601');
    expect(message).toContain('`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');

    const sync = TestBed.runInInjectionContext(() => toSignal(new BehaviorSubject(1), { requireSync: true }));
    expect(sync()).toBe(1);
  });

  it('Section 7: toSignal with an injector unsubscribes when that injector is destroyed and manualCleanup keeps it', () => {
    const cleaned = new Subject<number>();
    const manual = new Subject<number>();

    const child = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    toSignal(cleaned, { injector: child });
    toSignal(manual, { injector: child, manualCleanup: true });
    expect(cleaned.observed).toBe(true);
    expect(manual.observed).toBe(true);

    child.destroy();
    expect(cleaned.observed).toBe(false);
    expect(manual.observed).toBe(true);

    // manualCleanup needs no injection context at all.
    const outside = new Subject<number>();
    const value = toSignal(outside, { manualCleanup: true, initialValue: 0 });
    outside.next(5);
    expect(value()).toBe(5);
    outside.complete();
    expect(outside.observed).toBe(false);
    manual.complete();
  });

  it('Section 7: toSignal outside an injection context throws NG0203', () => {
    let message = '';
    try {
      toSignal(new BehaviorSubject(1));
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0203');
    expect(message).toContain('toSignal() can only be used within an injection context');
  });

  it('Section 7: a toSignal over a failed source rethrows on every read', () => {
    const source = new Subject<number>();
    const state = TestBed.runInInjectionContext(() => toSignal(source, { initialValue: 0 }));
    source.next(1);
    expect(state()).toBe(1);

    source.error(new Error('boom'));
    expect(() => state()).toThrow('boom');
    expect(() => state()).toThrow('boom');
  });

  it('Section 7: toObservable emits once after the effect runs, with the last of several writes', async () => {
    const count = signal(1);
    const seen: number[] = [];
    TestBed.runInInjectionContext(() => toObservable(count)).subscribe((value) => seen.push(value));

    count.set(2);
    count.set(3);
    expect(seen).toEqual([]);
    TestBed.tick();
    expect(seen).toEqual([3]);

    count.set(4);
    await Promise.resolve();
    expect(seen).toEqual([3]);
    TestBed.tick();
    expect(seen).toEqual([3, 4]);
  });

  it('Section 7: a late toObservable subscriber receives the replayed value', () => {
    const count = signal(1);
    const stream = TestBed.runInInjectionContext(() => toObservable(count));
    count.set(2);
    TestBed.tick();

    const seen: number[] = [];
    stream.subscribe((value) => seen.push(value));
    expect(seen).toEqual([2]);
  });

  it('Section 7: rxResource unsubscribes the previous stream when params change', async () => {
    const id = signal(1);
    const log: string[] = [];
    const sources = new Map<number, Subject<string>>();
    const trace: string[] = [];

    const resource = TestBed.runInInjectionContext(() =>
      rxResource({
        params: () => id(),
        stream: ({ params }) => {
          const source = new Subject<string>();
          sources.set(params, source);
          return new Observable<string>((subscriber) => {
            log.push(`sub${params}`);
            const inner = source.subscribe(subscriber);
            return () => {
              inner.unsubscribe();
              log.push(`fin${params}`);
            };
          });
        },
      }),
    );
    const note = (): void => {
      trace.push(`${resource.status()}:${String(resource.value())}`);
    };

    note();
    TestBed.tick();
    await Promise.resolve();
    note();

    sources.get(1)?.next('v1');
    await Promise.resolve();
    note();
    sources.get(1)?.next('v1b');
    await Promise.resolve();
    note();

    id.set(2);
    TestBed.tick();
    await Promise.resolve();
    note();
    sources.get(2)?.next('v2');
    await Promise.resolve();
    note();

    expect(log).toEqual(['sub1', 'fin1', 'sub2']);
    expect(trace).toEqual([
      'loading:undefined',
      'loading:undefined',
      'resolved:v1',
      'resolved:v1b',
      'loading:undefined',
      'resolved:v2',
    ]);

    sources.get(2)?.error(new Error('bad'));
    await Promise.resolve();
    expect(resource.status()).toBe('error');
    expect(String(resource.error())).toContain('bad');
    expect(() => resource.value()).toThrow('Resource is currently in an error state');
  });

  it('Section 7: rxResource reports NG0991 when the stream completes without a value', async () => {
    const resource = TestBed.runInInjectionContext(() => rxResource({ params: () => 1, stream: () => EMPTY }));
    TestBed.tick();
    await Promise.resolve();

    expect(resource.status()).toBe('error');
    expect(String(resource.error())).toContain('NG0991');
    expect(String(resource.error())).toContain('Resource completed before producing a value');
  });

  it('Section 7: outputToObservable completes when the component is destroyed', () => {
    const fixture = TestBed.createComponent(Picker);
    const log: string[] = [];
    outputToObservable(fixture.componentInstance.picked).subscribe({
      next: (value) => log.push(value),
      complete: () => log.push('complete'),
    });

    fixture.componentInstance.picked.emit('n1');
    expect(log).toEqual(['n1']);
    fixture.destroy();
    expect(log).toEqual(['n1', 'complete']);
  });
});
